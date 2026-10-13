import { useEffect, useRef, useState, type ReactNode } from "react";

import { useAuth } from "../../context/AuthContext";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getDashboard, saveReport } from "../../services/report";

import { toast } from "sonner";

import {
  HiOutlineDocumentCheck,
  HiOutlineClock,
  HiOutlineUsers,
  HiOutlineClipboardDocument,
  HiOutlineArrowPath,
  HiOutlinePencilSquare,
  HiOutlineBolt,
  HiOutlineCheck,
} from "react-icons/hi2";

import { format } from "date-fns";

import DayPickerInput from "../../components/DayPickerInput";
import PageTitle from "../../components/PageTitle";
import UserAvatar from "../../components/UserAvatar";

/* ========================================================================== */
/* Types                                                                      */
/* ========================================================================== */

interface DashboardResponse {
  stats: {
    submitted: number;
    pending: number;
    totalMembers: number;
    completion: number;
  };

  reports: {
    id: string;
    reportDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: {
      name: string;
      email: string;
      avatarUrl: string;
    };
  }[];

  myReport: {
    id: string;
    reportDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
    user: {
      name: string;
      email: string;
    };
  } | null;

  teamStatus: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    submitted: boolean;
  }[];
}

/* ========================================================================== */
/* Avatar                                                                     */
/* ========================================================================== */

const AVATAR_PALETTE = [
  "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200",
  "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
];

function avatarClasses(name: string) {
  const sum = name
    .split("")
    .reduce((acc, character) => acc + character.charCodeAt(0), 0);

  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

/* ========================================================================== */
/* Progress Ring                                                              */
/* ========================================================================== */

const RING_RADIUS = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/* ========================================================================== */
/* Dashboard                                                                  */
/* ========================================================================== */

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { user, hasPermission } = useAuth();

  const canViewAllReports = hasPermission("REPORT_VIEW_ALL");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [now, setNow] = useState<Date>(new Date());

  /* Visual animation only. The real value comes from the backend. */
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  /* ====================================================================== */
  /* Dashboard Query                                                        */
  /* ====================================================================== */

  const { data, isLoading } = useQuery<DashboardResponse>({
    queryKey: ["dashboard", dateKey],

    queryFn: async () => {
      const response = await getDashboard(dateKey);
      return response.data;
    },
  });

  /* ====================================================================== */
  /* Today                                                                  */
  /* ====================================================================== */

  const isToday = dateKey === format(new Date(), "yyyy-MM-dd");

  /* ====================================================================== */
  /* Populate Existing Report                                               */
  /* ====================================================================== */

  useEffect(() => {
    if (data?.myReport) {
      setDescription(data.myReport.description);
    } else {
      setDescription("");
    }
  }, [data?.myReport]);

  /* ====================================================================== */
  /* Employees Can Only See Today                                           */
  /* ====================================================================== */

  useEffect(() => {
    if (!canViewAllReports) {
      setSelectedDate(new Date());
    }
  }, [canViewAllReports]);

  /* ====================================================================== */
  /* Textarea Autosize                                                      */
  /* ====================================================================== */

  useEffect(() => {
    const element = textareaRef.current;

    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [description]);

  /* ====================================================================== */
  /* Current Time                                                           */
  /* ====================================================================== */

  useEffect(() => {
    const updateTime = () => {
      setNow(new Date());
    };

    updateTime();

    const current = new Date();
    const seconds = current.getSeconds();
    const milliseconds = current.getMilliseconds();

    const delay =
      seconds < 30
        ? (30 - seconds) * 1000 - milliseconds
        : (60 - seconds) * 1000 - milliseconds;

    let interval: ReturnType<typeof setInterval> | undefined;

    const timeout = setTimeout(() => {
      updateTime();
      interval = setInterval(updateTime, 30000);
    }, delay);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  /* ====================================================================== */
  /* Derived Values                                                         */
  /* ====================================================================== */

  const submitted = data?.stats.submitted ?? 0;
  const pending = data?.stats.pending ?? 0;
  const total = data?.stats.totalMembers ?? 0;

  /* Use the completion value coming directly from the backend. */
  const backendCompletion = Number(data?.stats.completion ?? 0);

  /* Protect the ring from invalid values. */
  const progress = Number.isFinite(backendCompletion)
    ? Math.min(100, Math.max(0, backendCompletion))
    : 0;

  /* Convert the animated percentage into an SVG dash offset. */
  const ringOffset = RING_CIRCUMFERENCE * (1 - animatedProgress / 100);

  const shouldShowReminder =
    isToday &&
    !data?.myReport &&
    now.getDay() !== 0 &&
    (now.getHours() > 13 ||
      (now.getHours() === 13 && now.getMinutes() >= 0));

  /* ====================================================================== */
  /* Progress Ring Animation                                                */
  /* ====================================================================== */

  useEffect(() => {
    if (!canViewAllReports || isLoading) {
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    let animationFrame: number | undefined;

    /* Always restart from zero when completion changes. */
    setAnimatedProgress(0);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);

      /* Ease-out cubic. */
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

      /* Keep decimals during the animation so the movement stays smooth. */
      setAnimatedProgress(progress * easedProgress);

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        /* Finish on the exact backend value. */
        setAnimatedProgress(progress);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [progress, canViewAllReports, isLoading]);

  /* ====================================================================== */
  /* Save Report Mutation                                                   */
  /* ====================================================================== */

  const reportMutation = useMutation({
    mutationFn: saveReport,

    onSuccess: (response) => {
      setDescription(response.data.description);

      queryClient.invalidateQueries({
        queryKey: ["dashboard", dateKey],
      });

      toast.success("Report saved successfully.");
    },

    onError: (error: any) => {
      const response = error.response?.data;

      if (response?.errors?.length) {
        response.errors.forEach((err: { message: string }) => {
          toast.error(err.message);
        });

        return;
      }

      toast.error(response?.message || "Failed to save report.");
    },
  });

  /* ====================================================================== */
  /* Save Handler                                                           */
  /* ====================================================================== */

  async function handleSave() {
    const text = description.trim();

    if (!text) {
      toast.warning("Please enter today's work.");
      return;
    }

    reportMutation.mutate({
      description: text,
      reportDate: dateKey,
    });
  }

  /* ====================================================================== */
  /* Copy Own Report                                                        */
  /* ====================================================================== */

  const handleReportSummary = async () => {
    try {
      await navigator.clipboard.writeText(description);
      toast.success("Report copied successfully.");
    } catch {
      toast.error("Unable to copy report.");
    }
  };

  /* ====================================================================== */
  /* Copy Team Reports                                                      */
  /* ====================================================================== */

  const handleCopyReports = async () => {
    if (!data?.reports.length) {
      toast.warning("No reports to copy.");
      return;
    }

    /*
     * Copy into a new array. data.reports is React Query data
     * and must never be mutated.
     */
    const reports = [...data.reports];

    const currentUserIndex = reports.findIndex(
      (report) => String(report.userId) === String(user?.id)
    );

    /*
     * Move only the logged-in user's report to the top of the
     * clipboard text. Everything else keeps its original order.
     */
    if (currentUserIndex > 0) {
      const [currentUserReport] = reports.splice(currentUserIndex, 1);
      reports.unshift(currentUserReport);
    }

    const text = reports
      .map((report) => `${report.user.name}\n${report.description}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Team reports copied successfully.");
    } catch {
      toast.error("Unable to copy team reports.");
    }
  };

  /* ====================================================================== */
  /* Loading                                                                */
  /* ====================================================================== */

  if (isLoading) {
    return <DashboardSkeleton canViewAllReports={canViewAllReports} />;
  }

  /* ====================================================================== */
  /* Render                                                                 */
  /* ====================================================================== */

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageTitle title="Dashboard" />

      <style>{`
        @keyframes dashboard-enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dashboard-enter {
          animation: dashboard-enter 400ms cubic-bezier(.22, 1, .36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .dashboard-enter { animation: none !important; }
        }
      `}</style>

      <div className="dashboard-enter space-y-6">
        {/* ==============================================================
            HEADER
        ============================================================== */}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-slate-950 dark:text-white sm:text-[32px]">
              {canViewAllReports
                ? isToday
                  ? "Team activity"
                  : format(selectedDate, "EEEE, d MMMM")
                : "Your workspace"}
            </h1>

            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-500">
              {canViewAllReports
                ? isToday
                  ? `${submitted} of ${total} team members have submitted today's report`
                  : `Viewing reports for ${format(selectedDate, "dd MMM yyyy")}`
                : data?.myReport
                  ? "Your report has been submitted for today."
                  : "Your daily report is waiting for submission."}
            </p>
          </div>

          {canViewAllReports && (
            <div className="shrink-0">
              <DayPickerInput value={selectedDate} onChange={setSelectedDate} />
            </div>
          )}
        </header>

        {/* ==============================================================
            REMINDER
        ============================================================== */}

        {shouldShowReminder && (
          <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/[0.045] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <HiOutlineClock className="h-4 w-4" />
              </div>

              <p className="text-sm text-rose-700 dark:text-rose-400">
                <span className="font-semibold">Daily report reminder.</span>{" "}
                <span className="text-rose-600/80 dark:text-rose-400/70">
                  Please submit today's work report before leaving.
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                textareaRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                setTimeout(() => textareaRef.current?.focus(), 400);
              }}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-rose-600 px-3.5 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
            >
              Write report
            </button>
          </div>
        )}

        {/* ==============================================================
            MAIN GRID
            Left: writing desk + activity feed
            Right: one rail with progress and team roster
        ============================================================== */}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ============================================================
              LEFT COLUMN
          ============================================================ */}

          <div className="min-w-0 space-y-6">
            {/* ----------------------------------------------------------
                Report composer
            ---------------------------------------------------------- */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <HiOutlinePencilSquare className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Your report
                    </h2>

                    <p className="text-xs text-slate-400 dark:text-zinc-600">
                      {data?.myReport
                        ? "Edit your submitted report and save the changes"
                        : "Add your work report for this date"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {format(selectedDate, "EEE, d MMM")}
                  </span>

                  {data?.myReport ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <HiOutlineCheck className="h-3 w-3" />
                      Submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Not submitted
                    </span>
                  )}
                </div>
              </div>

              <div className="px-5 pb-5 pt-4 sm:px-6">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/[0.06] dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus-within:border-indigo-500/30 dark:focus-within:bg-zinc-900">
                  <textarea
                    ref={textareaRef}
                    rows={6}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    disabled={reportMutation.isPending}
                    placeholder={
                      isToday
                        ? "What did you work on today?"
                        : "No report submitted for this date."
                    }
                    className="min-h-[170px] w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-5"
                  />

                  <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-zinc-600">
                      {description.length} characters
                    </span>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <button
                        type="button"
                        onClick={handleReportSummary}
                        disabled={!description.trim()}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:flex-none"
                      >
                        <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                        Copy report
                      </button>

                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={reportMutation.isPending}
                        className="inline-flex h-9 flex-1 items-center justify-center rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:flex-none"
                      >
                        {reportMutation.isPending ? (
                          <>
                            <HiOutlineArrowPath className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save report"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ----------------------------------------------------------
                Recent activity feed
            ---------------------------------------------------------- */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-amber-600 dark:bg-zinc-900 dark:text-amber-400">
                    <HiOutlineBolt className="text-[17px]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Recent activity
                    </h2>

                    <p className="text-xs text-slate-400 dark:text-zinc-600">
                      {data?.reports.length
                        ? `${data.reports.length} reports`
                        : "No activity yet"}
                    </p>
                  </div>
                </div>

                {/* Only the clipboard order changes. The list is untouched. */}
                <button
                  type="button"
                  onClick={handleCopyReports}
                  className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                  Copy all
                </button>
              </div>

              {data?.reports.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600">
                    <HiOutlineDocumentCheck className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-500 dark:text-zinc-500">
                    No reports yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-600">
                    Reports submitted today will appear here.
                  </p>
                </div>
              )}

              <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800">
                {data?.reports.map((report) => (
                  <li
                    key={report.id}
                    className="flex gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-900/50 sm:px-6"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ring-black/[0.04] dark:ring-white/[0.05] ${avatarClasses(
                        report.user.name
                      )}`}
                    >
                      <UserAvatar
                        name={report.user.name}
                        avatarUrl={report.user.avatarUrl}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-200">
                          {report.user.name}
                        </p>

                        <time className="shrink-0 text-xs font-medium text-slate-400 dark:text-zinc-600">
                          {new Date(report.createdAt).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </time>
                      </div>

                      <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-500 dark:text-zinc-400">
                        {report.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* ============================================================
              RIGHT RAIL
          ============================================================ */}

          <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-6">
            {/* ----------------------------------------------------------
                Progress (managers and admins only)
            ---------------------------------------------------------- */}

            {canViewAllReports && (
              <div className="border-b border-slate-100 p-5 dark:border-zinc-800">
                <div className="flex items-center gap-5">
                  <div className="relative h-[96px] w-[96px] shrink-0">
                    <svg
                      viewBox="0 0 100 100"
                      className="h-full w-full -rotate-90 overflow-visible"
                    >
                      <defs>
                        <filter
                          id="progressGlow"
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Background ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r={RING_RADIUS}
                        fill="none"
                        strokeWidth="6"
                        className="stroke-slate-100 dark:stroke-zinc-800"
                      />

                      {/* Animated progress ring */}
                      <circle
                        cx="50"
                        cy="50"
                        r={RING_RADIUS}
                        fill="none"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={ringOffset}
                        filter="url(#progressGlow)"
                        className="stroke-indigo-500"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
                        {Math.round(animatedProgress)}%
                      </span>

                      <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-600">
                        complete
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      Today's progress
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                      {submitted} of {total} team members submitted
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <RailStat
                    icon={<HiOutlineDocumentCheck />}
                    label="Submitted"
                    value={submitted}
                    iconClass="text-emerald-600 dark:text-emerald-400"
                  />

                  <RailStat
                    icon={<HiOutlineClock />}
                    label="Pending"
                    value={pending}
                    iconClass="text-amber-600 dark:text-amber-400"
                  />

                  <RailStat
                    icon={<HiOutlineUsers />}
                    label="Members"
                    value={total}
                    iconClass="text-violet-600 dark:text-violet-400"
                  />
                </dl>
              </div>
            )}

            {/* ----------------------------------------------------------
                Team roster
            ---------------------------------------------------------- */}

            <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Team status
              </h2>

              <span className="text-xs text-slate-400 dark:text-zinc-600">
                {submitted} of {total} checked in
              </span>
            </div>

            <ul className="max-h-[460px] divide-y divide-slate-100 overflow-y-auto pb-2 dark:divide-zinc-800">
              {data?.teamStatus.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-900/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ring-black/[0.04] dark:ring-white/[0.05] ${avatarClasses(
                        member.name
                      )}`}
                    >
                      <UserAvatar
                        name={member.name}
                        avatarUrl={member.avatarUrl}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {member.name}
                      </p>

                      <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-zinc-600">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {member.submitted ? (
                    <span
                      className="inline-flex shrink-0 items-center text-emerald-600 dark:text-emerald-400"
                      title="Submitted"
                    >
                      <HiOutlineCheck className="h-4 w-4" />
                      <span className="sr-only">Submitted</span>
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  )}
                </li>
              ))}

              {!data?.teamStatus.length && (
                <li className="px-5 py-10 text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
                    No team members found.
                  </p>
                </li>
              )}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Rail Stat                                                                  */
/* ========================================================================== */

function RailStat({
  icon,
  label,
  value,
  iconClass,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  iconClass: string;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-3 dark:bg-zinc-900">
      <span className={`text-[16px] ${iconClass}`}>{icon}</span>

      <dd className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
        {value}
      </dd>

      <dt className="mt-0.5 truncate text-[11px] font-medium text-slate-400 dark:text-zinc-600">
        {label}
      </dt>
    </div>
  );
}

/* ========================================================================== */
/* Dashboard Skeleton                                                         */
/* ========================================================================== */

function DashboardSkeleton({
  canViewAllReports,
}: {
  canViewAllReports: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] animate-pulse space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          <div className="h-3 w-72 rounded bg-slate-100 dark:bg-zinc-900" />
        </div>

        {canViewAllReports && (
          <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-zinc-800" />
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />

              <div className="space-y-2">
                <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-2.5 w-48 rounded bg-slate-100 dark:bg-zinc-900" />
              </div>
            </div>

            <div className="mt-5 h-44 rounded-lg bg-slate-100 dark:bg-zinc-900" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-16 border-b border-slate-100 dark:border-zinc-800" />

            <div className="space-y-5 p-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-zinc-800" />

                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-2.5 w-full rounded bg-slate-100 dark:bg-zinc-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {canViewAllReports && (
            <div className="h-56 border-b border-slate-100 dark:border-zinc-800" />
          )}

          <div className="space-y-5 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-800" />

                <div className="flex-1 space-y-2">
                  <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="h-2.5 w-36 rounded bg-slate-100 dark:bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}