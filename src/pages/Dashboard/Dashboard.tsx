import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getDashboard,

    saveReport,
} from "../../services/report";
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
} from "react-icons/hi2";
import { format } from "date-fns";
import DayPickerInput from "../../components/DayPickerInput";

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

// Deterministic, varied avatar treatment — same person always gets the same pair.
const AVATAR_PALETTE = [
    "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
];

function avatarClasses(name: string) {
    const sum = name
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Dashboard() {
    const queryClient = useQueryClient();

    const { hasPermission } = useAuth();

    const canViewAllReports =
        hasPermission("REPORT_VIEW_ALL");


    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const {
        data,
        isLoading,
    } = useQuery<DashboardResponse>({
        queryKey: [
            "dashboard",
            format(selectedDate, "yyyy-MM-dd"),
        ],
        queryFn: async () => {
            const response = await getDashboard(
                format(selectedDate, "yyyy-MM-dd")
            );

            return response.data;
        },
    });

    const [description, setDescription] =
        useState("");

    const [now, setNow] = useState(new Date());

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // The selected date is the single source of truth for the whole page.
    // Only "today" is editable — past dates are read-only snapshots.
    const isToday =
        format(selectedDate, "yyyy-MM-dd") ===
        format(new Date(), "yyyy-MM-dd");

    useEffect(() => {
        if (data?.myReport) {
            setDescription(data.myReport.description);
        } else {
            setDescription("");
        }
    }, [data?.myReport]);

    useEffect(() => {
        if (!canViewAllReports) {
            setSelectedDate(new Date());
        }
    }, [canViewAllReports]);

    // Presentational only — autosizes the textarea to its content.
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [description]);

    useEffect(() => {
        const updateTime = () => setNow(new Date());

        // Initial update
        updateTime();

        // Milliseconds until the next :00 or :30
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        const delay =
            seconds < 30
                ? (30 - seconds) * 1000 - milliseconds
                : (60 - seconds) * 1000 - milliseconds;

        let interval: ReturnType<typeof setInterval>;

        const timeout = setTimeout(() => {
            updateTime();

            // Update every 30 seconds exactly
            interval = setInterval(updateTime, 30000);
        }, delay);

        return () => {
            clearTimeout(timeout);
            if (interval) clearInterval(interval);
        };
    }, []);

    const reportMutation = useMutation({
        mutationFn: saveReport,

        onSuccess: (response) => {
            setDescription(response.data.description);

            queryClient.invalidateQueries({
                queryKey: [
                    "dashboard",
                    format(selectedDate, "yyyy-MM-dd"),
                ],
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

    async function handleSave() {

        const text = description.trim();

        if (!text) {
            toast.warning(
                "Please enter today's work."
            );
            return;
        }

        reportMutation.mutate({
            description: text,
            reportDate: format(
                selectedDate,
                "yyyy-MM-dd"
            ),
        });
    }


    const handleReportSummary = async () => {
        try {
            const summary = description;

            await navigator.clipboard.writeText(summary)

            toast.success("Summary copied successfully.")


        } catch (error) {
            toast.error("Unable to copy summary.")
        }
    }

    const handleCopyReports = async () => {
        if (!data?.reports.length) {
            toast.warning("No reports to copy.");
            return;
        }

        const text = data.reports
            .map(
                report =>
                    `${report.user.name}
${report.description}`
            )
            .join("\n\n");

        await navigator.clipboard.writeText(text);

        toast.success("Team reports copied successfully.");
    };

    if (isLoading) {
        return <DashboardSkeleton canViewAllReports={canViewAllReports} />;
    }

    const shouldShowReminder =
        isToday &&
        !data?.myReport &&
        now.getDay() !== 0 &&
        (
            now.getHours() > 13 ||
            (now.getHours() === 13 && now.getMinutes() >= 0)
        );

    const submitted =
        data?.stats.submitted ?? 0;

    const total =
        data?.stats.totalMembers ?? 0;

    const progress =
        total === 0
            ? 0
            : Math.round(
                (submitted / total) * 100
            );

    const ringOffset =
        RING_CIRCUMFERENCE * (1 - progress / 100);

    return (
        <div className="mx-auto max-w-5xl space-y-5 px-3 py-2 sm:space-y-6 sm:px-4 sm:py-4 lg:space-y-8 lg:px-0 animate-[dashFadeIn_0.35s_ease-out]">
            <style>{`
                @keyframes dashFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .dash-fade { animation: none !important; opacity: 1 !important; }
                }
            `}</style>

            {/* Page context — greeting/date already live in the app header,
                so this only carries what the header can't: page identity
                and (when relevant) which date's data is on screen. */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 sm:text-[11px]">
                        Overview
                    </p>
                    <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl md:text-[28px]">
                        {canViewAllReports
                            ? isToday
                                ? "Team activity"
                                : format(selectedDate, "EEEE, d MMMM")
                            : "Your workspace"}
                    </h1>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-500 sm:text-xs">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                        </span>
                        {canViewAllReports
                            ? isToday
                                ? `${submitted} of ${total} submitted so far`
                                : `Viewing reports for ${format(selectedDate, "dd MMM yyyy")}`
                            : data?.myReport
                                ? "Your report is submitted"
                                : "Your report is pending"}
                    </p>
                </div>

                {canViewAllReports && (
                    <div className="w-full sm:w-auto">
                        <DayPickerInput
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>
                )}
            </div>

            {shouldShowReminder && (
                <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-950/20 dark:bg-rose-950/10 sm:p-5">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-rose-400/5 blur-2xl dark:bg-rose-400/2 pointer-events-none" />
                    <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="flex items-start gap-3">
                            <span className="relative flex h-2.5 w-2.5 mt-1.5 shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                            </span>
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-400">
                                    Daily Report Reminder
                                </h3>
                                <p className="mt-1 text-xs text-rose-600 dark:text-rose-500/80">
                                    Please submit today's work report before leaving.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                textareaRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                });
                                setTimeout(() => textareaRef.current?.focus(), 400);
                            }}
                            className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95 relative z-10 sm:w-auto"
                        >
                            Write Report
                        </button>
                    </div>
                </div>
            )}

            {/* Overview — circular progress as the page's signature element,
                paired with a quiet, divided stat row. Team-wide, so only
                visible to people who can see everyone's reports. */}
            {canViewAllReports && (
                <section className="card p-5 sm:p-6 md:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                        <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center sm:mx-0 sm:h-32 sm:w-32 md:h-36 md:w-36">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={RING_RADIUS}
                                    fill="none"
                                    strokeWidth="8"
                                    className="stroke-slate-100 dark:stroke-zinc-800"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r={RING_RADIUS}
                                    fill="none"
                                    stroke="url(#dashProgressGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={RING_CIRCUMFERENCE}
                                    strokeDashoffset={ringOffset}
                                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                                />
                                <defs>
                                    <linearGradient
                                        id="dashProgressGradient"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#2563eb" />
                                        <stop offset="100%" stopColor="#4f46e5" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                                    {progress}%
                                </span>
                                <span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[9px]">
                                    Complete
                                </span>
                            </div>
                        </div>

                        <div className="grid flex-1 grid-cols-3 gap-x-2 gap-y-5 sm:gap-x-6 sm:divide-x sm:divide-slate-100 sm:dark:divide-zinc-800/60">
                            <StatWidget
                                icon={<HiOutlineDocumentCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                label="Submitted"
                                value={data?.stats.submitted}
                                iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                first
                            />

                            <StatWidget
                                icon={<HiOutlineClock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                label="Pending"
                                value={data?.stats.pending}
                                iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                            />

                            <StatWidget
                                icon={<HiOutlineUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                label="Members"
                                value={data?.stats.totalMembers}
                                iconBg="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Report editor — the page's primary action, given a proper header */}
            <section className="card relative overflow-hidden p-4 sm:p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800/60">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                            <HiOutlinePencilSquare className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Your Report
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-zinc-400">
                                {isToday
                                    ? "Editable until you sign off for the day"
                                    : "Read-only snapshot for this date"}
                            </p>
                        </div>
                    </div>

                    {data?.myReport && (
                        <span className="badge-success shrink-0 font-semibold">
                            Submitted
                        </span>
                    )}
                </div>

                <div className="mt-4 rounded-xl border border-transparent bg-slate-50/60 p-3 transition-colors focus-within:border-blue-200 focus-within:bg-white dark:bg-zinc-900/40 dark:focus-within:border-blue-900/50 dark:focus-within:bg-zinc-900/70 sm:p-4">
                    <textarea
                        ref={textareaRef}
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={
                            isToday
                                ? "What did you work on today?"
                                : "No report submitted for this date."
                        }
                        className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-none outline-none ring-0 focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-100 dark:placeholder:text-zinc-650"
                        style={{ minHeight: "120px", outline: "none", boxShadow: "none" }}
                    />
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800/60 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
                        {description.length} characters
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReportSummary}
                            disabled={!description.trim()}
                            className="btn-secondary flex-1 py-1.5 px-3.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed sm:flex-none"
                        >
                            <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                            Copy report
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="btn-primary flex-1 py-1.5 px-3.5 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed sm:flex-none"
                        >
                            {reportMutation.isPending ? (
                                <>
                                    <HiOutlineArrowPath className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                "Save report"
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* Team status + Activity feed */}
            <section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                {/* Team status */}
                <div className="card flex flex-col overflow-hidden">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-zinc-800/50 sm:px-5 sm:py-4">
                        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            <HiOutlineUserGroup className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Team Status
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
                                {submitted} of {total} checked in
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800/40">
                        {data?.teamStatus.map((member, idx) => (
                            <div
                                key={member.id}
                                className="dash-fade group flex items-center justify-between gap-3 px-4 py-3 opacity-0 transition-colors hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 sm:px-5 sm:py-3.5"
                                style={{
                                    animation: "dashFadeIn 0.3s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 30}ms`,
                                }}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/5 ${avatarClasses(
                                            member.name
                                        )}`}
                                    >
                                        {member.name.charAt(0).toUpperCase()}

                                        {member.submitted && (
                                            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 dark:border-[#09090b]" />
                                            </span>
                                        )}
                                    </div>

                                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {member.name}
                                    </p>
                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${member.submitted
                                        ? "badge-success"
                                        : "badge"
                                        }`}
                                >
                                    {member.submitted ? "Submitted" : "Pending"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity feed */}
                <div className="card flex flex-col overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 px-4 py-3.5 dark:border-zinc-800/50 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                                <HiOutlineBolt className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                    Activity Feed
                                </p>
                                {data?.reports && data.reports.length > 0 && (
                                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                                        {data.reports.length}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleCopyReports}
                            className="btn-secondary shrink-0 py-1.5 px-3 text-xs font-semibold"
                        >
                            <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                            Copy Reports
                        </button>
                    </div>

                    <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800/40">
                        {data?.reports.length === 0 && (
                            <div className="px-4 py-10 text-center text-xs font-medium text-slate-400 dark:text-zinc-500 sm:px-5 sm:py-12">
                                No reports found for {format(selectedDate, "dd MMM yyyy")}.
                            </div>
                        )}

                        {data?.reports.map((report, idx) => (
                            <div
                                key={report.id}
                                className="dash-fade group px-4 py-3.5 opacity-0 transition-colors hover:bg-slate-50/40 dark:hover:bg-zinc-900/20 sm:px-5 sm:py-4"
                                style={{
                                    animation: "dashFadeIn 0.3s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 30}ms`,
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ring-black/5 dark:ring-white/5 ${avatarClasses(
                                            report.user.name
                                        )}`}
                                    >
                                        {report.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                                            <span className="truncate text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                {report.user.name}
                                            </span>
                                            <span className="shrink-0 text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                                                {new Date(
                                                    report.createdAt
                                                ).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-650 dark:text-zinc-350">
                                            {report.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatWidget({
    icon,
    label,
    value,
    iconBg,
    first,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    iconBg: string;
    first?: boolean;
}) {
    return (
        <div className={`flex min-w-0 items-start gap-2 sm:gap-3 ${first ? "" : "sm:pl-6"}`}>
            <div className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconBg} sm:h-9 sm:w-9`}>
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-base font-bold leading-none tracking-tight text-slate-900 dark:text-white tabular-nums sm:text-lg md:text-xl">
                    {value}
                </p>
                <p className="mt-1.5 truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[10px]">
                    {label}
                </p>
            </div>
        </div>
    );
}

function DashboardSkeleton({
    canViewAllReports,
}: {
    canViewAllReports: boolean;
}) {
    return (
        <div className="mx-auto max-w-5xl space-y-5 px-3 py-2 sm:space-y-6 sm:px-4 sm:py-4 lg:space-y-8 lg:px-0 animate-pulse">
            {/* Page context Skeleton */}
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                    <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-6 w-40 rounded bg-slate-200 dark:bg-zinc-800 sm:h-7 sm:w-44" />
                    <div className="h-3 w-32 rounded bg-slate-100 dark:bg-zinc-900 sm:w-36" />
                </div>
                <div className="h-9 w-full rounded-lg bg-slate-200 dark:bg-zinc-800 sm:w-32" />
            </div>

            {/* Overview Skeleton — only for admins, matches live gating */}
            {canViewAllReports && (
                <div className="card p-5 sm:p-6 md:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                        <div className="mx-auto h-28 w-28 shrink-0 rounded-full bg-slate-100 dark:bg-zinc-900 sm:mx-0 sm:h-32 sm:w-32 md:h-36 md:w-36" />
                        <div className="grid flex-1 grid-cols-3 gap-4 sm:gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-2 sm:gap-3">
                                    <div className="h-7 w-7 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800 sm:h-9 sm:w-9" />
                                    <div className="min-w-0 space-y-2">
                                        <div className="h-4 w-8 rounded bg-slate-250 dark:bg-zinc-800 sm:h-5 sm:w-10" />
                                        <div className="h-2.5 w-12 rounded bg-slate-200 dark:bg-zinc-900 sm:w-14" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Skeleton */}
            <div className="card p-4 sm:p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800/60">
                    <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                    <div className="min-w-0 space-y-1.5">
                        <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-2.5 w-32 rounded bg-slate-100 dark:bg-zinc-900" />
                    </div>
                </div>
                <div className="space-y-2 rounded-xl bg-slate-50/60 p-3 dark:bg-zinc-900/40 sm:p-4">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3.5 w-5/6 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800/60 sm:flex-row sm:items-center sm:justify-between">
                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-zinc-900" />
                    <div className="flex gap-2">
                        <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-zinc-800 sm:w-24 sm:flex-none" />
                        <div className="h-8 flex-1 rounded-lg bg-slate-200 dark:bg-zinc-800 sm:w-24 sm:flex-none" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
                <div className="card p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-3 w-24 rounded bg-slate-250 dark:bg-zinc-800" />
                    </div>
                    <div className="space-y-3 pt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-1">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-800" />
                                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                                </div>
                                <div className="h-5 w-16 shrink-0 rounded-full bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-4 sm:p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-3 w-24 rounded bg-slate-250 dark:bg-zinc-800" />
                    </div>
                    <div className="space-y-4 pt-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-3.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                                    <div className="h-2.5 w-10 rounded bg-slate-100 dark:bg-zinc-900" />
                                </div>
                                <div className="h-3 w-full rounded bg-slate-100 dark:bg-zinc-900" />
                                <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-zinc-900" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}