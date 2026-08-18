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
  HiOutlineUserGroup,
  HiOutlineBolt,
  HiOutlineCheck,
} from "react-icons/hi2";

import { format } from "date-fns";

import DayPickerInput from "../../components/DayPickerInput";

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
    description: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
  }[];

  myReport: {
    id: string;
    description: string;
  } | null;

  teamStatus: {
    id: string;
    name: string;
    email: string;
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

function getInitial(name: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "?";
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

  const { hasPermission } = useAuth();

  const canViewAllReports = hasPermission("REPORT_VIEW_ALL");

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [description, setDescription] = useState("");

  const [now, setNow] = useState<Date>(new Date());

  const [animatedProgress, setAnimatedProgress] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ====================================================================== */
  /* Dashboard Query                                                        */
  /* ====================================================================== */

  const { data, isLoading } = useQuery<DashboardResponse>({
    queryKey: ["dashboard", format(selectedDate, "yyyy-MM-dd")],

    queryFn: async () => {
      const response = await getDashboard(format(selectedDate, "yyyy-MM-dd"));

      return response.data;
    },
  });

  /* ====================================================================== */
  /* Today                                                                   */
  /* ====================================================================== */

  const isToday =
    format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

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
  /* Textarea Autosize                                                       */
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
  /* Current Time                                                            */
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

  const total = data?.stats.totalMembers ?? 0;

  const progress = total === 0 ? 0 : Math.round((submitted / total) * 100);

  const ringOffset = RING_CIRCUMFERENCE * (1 - animatedProgress / 100);

  const shouldShowReminder =
    isToday &&
    !data?.myReport &&
    now.getDay() !== 0 &&
    (now.getHours() > 13 || (now.getHours() === 13 && now.getMinutes() >= 0));

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

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;

      const rawProgress = Math.min(elapsed / duration, 1);

      /*
       * Ease-out curve.
       * Starts quickly and slows smoothly
       * near the final percentage.
       */
      const easedProgress = 1 - Math.pow(1 - rawProgress, 3);

      setAnimatedProgress(Math.round(easedProgress * progress));

      if (rawProgress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    setAnimatedProgress(0);

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
        queryKey: ["dashboard", format(selectedDate, "yyyy-MM-dd")],
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
      reportDate: format(selectedDate, "yyyy-MM-dd"),
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

    const text = data.reports
      .map((report) => `${report.user.name}\n${report.description}`)
      .join("\n\n");

    await navigator.clipboard.writeText(text);

    toast.success("Team reports copied successfully.");
  };

  /* ====================================================================== */
  /* Loading                                                                 */
  /* ====================================================================== */

  if (isLoading) {
    return <DashboardSkeleton canViewAllReports={canViewAllReports} />;
  }

  /* ====================================================================== */
  /* Dashboard                                                               */
  /* ====================================================================== */

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <style>{`
                @keyframes dashboard-enter {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .dashboard-enter {
                    animation:
                        dashboard-enter
                        420ms
                        cubic-bezier(.22,1,.36,1)
                        both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .dashboard-enter {
                        animation: none !important;
                    }
                }
            `}</style>

      <div className="dashboard-enter space-y-7 lg:space-y-8">
        {/* ==========================================================
                    HEADER
                    ========================================================== */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2"></div>

            <h1 className="text-[30px] font-bold leading-none tracking-[-0.04em] text-slate-950 dark:text-white sm:text-[34px]">
              {canViewAllReports
                ? isToday
                  ? "Team activity"
                  : format(selectedDate, "EEEE, d MMMM")
                : "Your workspace"}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-zinc-500">
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

        {/* ==========================================================
                    REMINDER
                    ========================================================== */}

        {shouldShowReminder && (
          <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-rose-50/60 dark:border-rose-500/20 dark:bg-rose-500/[0.045]">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                  <HiOutlineClock className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-rose-700 dark:text-rose-400">
                    Daily report reminder
                  </p>

                  <p className="mt-1 text-xs text-rose-600/75 dark:text-rose-400/65">
                    Please submit today's work report before leaving.
                  </p>
                </div>
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
                className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
              >
                Write report
              </button>
            </div>
          </div>
        )}

        {/* ==========================================================
                    TODAY OVERVIEW
                    ========================================================== */}

        {canViewAllReports && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid lg:grid-cols-[280px_1fr]">
              {/* Progress */}

              <div className="flex items-center gap-5 border-b border-slate-100 px-5 py-6 dark:border-zinc-800 lg:border-b-0 lg:border-r lg:px-7">
                <div className="relative h-[88px] w-[88px] shrink-0">
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

                    {/* Background Ring */}

                    <circle
                      cx="50"
                      cy="50"
                      r={RING_RADIUS}
                      fill="none"
                      strokeWidth="6"
                      className="stroke-slate-100 dark:stroke-zinc-800"
                    />

                    {/* Animated Ring */}

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
                      className="stroke-indigo-500 transition-[stroke-dashoffset] duration-100 ease-out"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold tracking-[-0.03em] text-slate-950 dark:text-white">
                      {animatedProgress}%
                    </span>

                    <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-600">
                      Complete
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    Today's progress
                  </p>

                  <p className="mt-1 max-w-[140px] text-xs leading-5 text-slate-500 dark:text-zinc-500">
                    {submitted} of {total} team members submitted
                  </p>
                </div>
              </div>

              {/* Stats */}

              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-zinc-800">
                <DashboardStat
                  icon={<HiOutlineDocumentCheck />}
                  label="Submitted"
                  value={data?.stats.submitted ?? 0}
                  iconClass="text-emerald-600 dark:text-emerald-400"
                />

                <DashboardStat
                  icon={<HiOutlineClock />}
                  label="Pending"
                  value={data?.stats.pending ?? 0}
                  iconClass="text-amber-600 dark:text-amber-400"
                />

                <DashboardStat
                  icon={<HiOutlineUsers />}
                  label="Members"
                  value={data?.stats.totalMembers ?? 0}
                  iconClass="text-violet-600 dark:text-violet-400"
                />
              </div>
            </div>
          </section>
        )}

        {/* ==========================================================
                    YOUR REPORT
                    ========================================================== */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <HiOutlinePencilSquare className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:text-zinc-300">
                    Your report
                  </p>

                  {data?.myReport && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <HiOutlineCheck className="h-3 w-3" />
                      Submitted
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-600">
                  {isToday
                    ? "Editable until you sign off for the day"
                    : "Read-only snapshot for this date"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/[0.06] dark:border-zinc-800 dark:bg-zinc-900/40 dark:focus-within:border-indigo-500/30 dark:focus-within:bg-zinc-900">
              <textarea
                ref={textareaRef}
                rows={5}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={!isToday}
                placeholder={
                  isToday
                    ? "What did you work on today?"
                    : "No report submitted for this date."
                }
                className="min-h-[135px] w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-4 text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-600 sm:px-5"
              />

              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <span className="text-[10px] font-medium tabular-nums text-slate-400 dark:text-zinc-600">
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
                    disabled={reportMutation.isPending || !isToday}
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

        {/* ==========================================================
                    TEAM + ACTIVITY
                    ========================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* Team Status */}

          <DashboardPanel
            icon={<HiOutlineUserGroup />}
            iconClass="text-violet-600 dark:text-violet-400"
            title="Team status"
            subtitle={`${submitted} of ${total} checked in`}
          >
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {data?.teamStatus.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-900/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 ring-black/[0.04] dark:ring-white/[0.05] ${avatarClasses(
                        member.name,
                      )}`}
                    >
                      {getInitial(member.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {member.name}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-400 dark:text-zinc-600">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {member.submitted ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <HiOutlineCheck className="h-3.5 w-3.5" />
                      Submitted
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  )}
                </div>
              ))}

              {!data?.teamStatus.length && (
                <div className="px-5 py-12 text-center">
                  <p className="text-xs font-medium text-slate-500 dark:text-zinc-500">
                    No team members found.
                  </p>
                </div>
              )}
            </div>
          </DashboardPanel>

          {/* Recent Activity */}

          <DashboardPanel
            icon={<HiOutlineBolt />}
            iconClass="text-amber-600 dark:text-amber-400"
            title="Recent activity"
            subtitle={
              data?.reports.length
                ? `${data.reports.length} reports`
                : "No activity yet"
            }
            action={
              <button
                type="button"
                onClick={handleCopyReports}
                className="inline-flex h-8 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </button>
            }
          >
            <div className="max-h-[430px] overflow-y-auto">
              {data?.reports.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-600">
                    <HiOutlineDocumentCheck className="h-5 w-5" />
                  </div>

                  <p className="mt-3 text-xs font-medium text-slate-500 dark:text-zinc-500">
                    No reports yet
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-600">
                    Reports submitted today will appear here.
                  </p>
                </div>
              )}

              {data?.reports.map((report, index) => (
                <div key={report.id} className="relative flex gap-4 px-5 py-4">
                  {index < data.reports.length - 1 && (
                    <span className="absolute bottom-0 left-[31px] top-[48px] w-px bg-slate-100 dark:bg-zinc-800" />
                  )}

                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold ring-1 ring-slate-200 dark:bg-zinc-950 dark:ring-zinc-800">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${avatarClasses(
                        report.user.name,
                      )}`}
                    >
                      {getInitial(report.user.name)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {report.user.name}
                      </p>

                      <time className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-zinc-600">
                        {new Date(report.createdAt).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </time>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-slate-500 dark:text-zinc-400">
                      {report.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </section>
      </div>
    </main>
  );
}

/* ========================================================================== */
/* Dashboard Stat                                                             */
/* ========================================================================== */

function DashboardStat({
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
    <div className="flex min-w-0 items-center gap-3 px-3 py-6 sm:px-5 lg:px-7">
      <div
        className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-slate-50
                    dark:bg-zinc-900
                    ${iconClass}
                `}
      >
        <span className="text-[17px]">{icon}</span>
      </div>

      <div className="min-w-0">
        <p className="text-xl font-bold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-2xl">
          {value}
        </p>

        <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-zinc-600 sm:text-[10px]">
          {label}
        </p>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Dashboard Panel                                                            */
/* ========================================================================== */

function DashboardPanel({
  icon,
  iconClass,
  title,
  subtitle,
  action,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-slate-50
                            dark:bg-zinc-900
                            ${iconClass}
                        `}
          >
            <span className="text-[17px]">{icon}</span>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {title}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-600">
              {subtitle}
            </p>
          </div>
        </div>

        {action}
      </div>

      {children}
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
    <div className="mx-auto w-full max-w-[1440px] animate-pulse px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <div className="space-y-7">
        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-2 w-16 rounded bg-slate-200 dark:bg-zinc-800" />

            <div className="h-9 w-48 rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="h-3 w-72 rounded bg-slate-100 dark:bg-zinc-900" />
          </div>

          {canViewAllReports && (
            <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          )}
        </div>

        {/* Stats */}

        {canViewAllReports && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid lg:grid-cols-[280px_1fr]">
              <div className="h-36 border-b border-slate-100 dark:border-zinc-800 lg:border-b-0 lg:border-r" />

              <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-zinc-800">
                {Array.from({
                  length: 3,
                }).map((_, index) => (
                  <div key={index} className="h-36" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Report */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />

            <div className="space-y-2">
              <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />

              <div className="h-2.5 w-48 rounded bg-slate-100 dark:bg-zinc-900" />
            </div>
          </div>

          <div className="mt-5 h-44 rounded-lg bg-slate-100 dark:bg-zinc-900" />
        </div>

        {/* Panels */}

        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({
            length: 2,
          }).map((_, panelIndex) => (
            <div
              key={panelIndex}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="h-16 border-b border-slate-100 dark:border-zinc-800" />

              <div className="space-y-5 p-5">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-zinc-800" />

                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-zinc-800" />

                      <div className="h-2.5 w-40 rounded bg-slate-100 dark:bg-zinc-900" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
