import { useEffect, useRef, useState } from "react";
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
    HiOutlineChartBarSquare,
    HiOutlineClipboardDocument,
    HiOutlineArrowPath,
    HiOutlineCalendarDays,
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



export default function Dashboard() {
    const queryClient = useQueryClient();

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
        return <DashboardSkeleton />;
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

    return (
        <div className="mx-auto max-w-5xl space-y-6 py-2 sm:py-4 lg:space-y-8 animate-[dashFadeIn_0.35s_ease-out]">
            {shouldShowReminder && (
                <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/40 p-5 dark:border-rose-950/20 dark:bg-rose-950/10">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-rose-400/5 blur-2xl dark:bg-rose-400/2 pointer-events-none" />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                            className="inline-flex h-8 items-center justify-center rounded-lg bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95 relative z-10"
                        >
                            Write Report
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes dashFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .dash-fade { animation: none !important; opacity: 1 !important; }
                }
            `}</style>

            {/* Global dashboard date filter — single source of truth for the whole page */}
            <section className="card relative z-20 overflow-visible flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
                <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <HiOutlineCalendarDays className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Dashboard Date
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                            {isToday
                                ? "Viewing today's activity"
                                : `Viewing reports for ${format(selectedDate, "dd MMM yyyy")}`}
                        </p>
                    </div>
                </div>

                <DayPickerInput
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
            </section>

            {/* Overview — progress + stats, one connected panel */}
            <section className="card p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-zinc-400">
                        {submitted} of {total} team members have submitted
                    </p>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {progress}%
                    </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                        style={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-out dark:from-blue-500 dark:to-indigo-500"
                    />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatWidget
                        icon={<HiOutlineDocumentCheck className="h-4 w-4" />}
                        label="Submitted"
                        value={data?.stats.submitted}
                        iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                    />

                    <StatWidget
                        icon={<HiOutlineClock className="h-4 w-4" />}
                        label="Pending"
                        value={data?.stats.pending}
                        iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                    />

                    <StatWidget
                        icon={<HiOutlineUsers className="h-4 w-4" />}
                        label="Members"
                        value={data?.stats.totalMembers}
                        iconBg="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
                    />

                    <StatWidget
                        icon={<HiOutlineChartBarSquare className="h-4 w-4" />}
                        label="Completion"
                        value={`${data?.stats.completion}%`}
                        iconBg="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    />
                </div>
            </section>

            {/* Report editor */}
            <section className="card p-5 relative overflow-hidden transition-colors focus-within:border-slate-300 dark:focus-within:border-zinc-700">
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
                    style={{ minHeight: "140px", outline: "none", boxShadow: "none" }}
                />

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800/60">
                    <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
                        {description.length} characters
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReportSummary}
                            disabled={!description.trim()}
                            className="btn-secondary py-1.5 px-3.5 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                            Copy report
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="btn-primary py-1.5 px-3.5 text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
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
            <section className="grid gap-6 lg:grid-cols-2">
                {/* Team status */}
                <div className="card flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Team Status
                        </p>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800/40">
                        {data?.teamStatus.map((member, idx) => (
                            <div
                                key={member.id}
                                className="dash-fade group flex items-center justify-between gap-3 px-5 py-3.5 opacity-0 transition-colors hover:bg-slate-50/40 dark:hover:bg-zinc-900/20"
                                style={{
                                    animation: "dashFadeIn 0.3s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 30}ms`,
                                }}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-150 text-[11px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-black/5 dark:ring-white/5">
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
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800/50">
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

                        <button
                            onClick={handleCopyReports}
                            className="btn-secondary py-1.5 px-3 text-xs font-semibold"
                        >
                            <HiOutlineClipboardDocument className="mr-1.5 h-3.5 w-3.5" />
                            Copy Reports
                        </button>
                    </div>

                    <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800/40">
                        {data?.reports.length === 0 && (
                            <div className="px-5 py-12 text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
                                No reports found for {format(selectedDate, "dd MMM yyyy")}.
                            </div>
                        )}

                        {data?.reports.map((report, idx) => (
                            <div
                                key={report.id}
                                className="dash-fade group px-5 py-4 opacity-0 transition-colors hover:bg-slate-50/40 dark:hover:bg-zinc-900/20"
                                style={{
                                    animation: "dashFadeIn 0.3s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 30}ms`,
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-black/5 dark:ring-white/5">
                                        {report.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                {report.user.name}
                                            </span>
                                            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
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
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    iconBg: string;
}) {
    return (
        <div className="group rounded-xl border border-slate-100 bg-slate-50/20 p-4 transition-all duration-200 hover:border-slate-200 dark:border-zinc-800/40 dark:bg-zinc-900/10">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} shadow-sm`}>
                {icon}
            </div>

            <p className="mt-3 text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl md:text-2xl">
                {value}
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {label}
            </p>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6 py-2 sm:py-4 lg:space-y-8 animate-pulse">
            {/* Date filter Skeleton */}
            <div className="card flex items-center justify-between p-5 md:p-6">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                    <div className="space-y-1.5">
                        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-3 w-32 rounded bg-slate-100 dark:bg-zinc-900" />
                    </div>
                </div>
                <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-zinc-800" />
            </div>

            {/* Overview Skeleton */}
            <div className="card p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-3 w-64 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3 w-10 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-900" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 pt-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/20 p-4 dark:border-zinc-800/40 dark:bg-zinc-900/10 space-y-2">
                            <div className="h-8 w-8 rounded bg-slate-250 dark:bg-zinc-800" />
                            <div className="h-6 w-12 rounded bg-slate-250 dark:bg-zinc-800" />
                            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-zinc-900" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Skeleton */}
            <div className="card p-5 space-y-6">
                <div className="space-y-2">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3.5 w-5/6 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 pt-4 dark:border-zinc-800/60">
                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-zinc-900" />
                    <div className="flex gap-2">
                        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="card p-5 space-y-4">
                    <div className="h-3.5 w-24 rounded bg-slate-250 dark:bg-zinc-800" />
                    <div className="space-y-3 pt-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-1">
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-zinc-800" />
                                    <div className="h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800" />
                                </div>
                                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-5 space-y-4">
                    <div className="h-3.5 w-24 rounded bg-slate-250 dark:bg-zinc-800" />
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