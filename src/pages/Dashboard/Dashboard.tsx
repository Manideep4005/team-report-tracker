import { useEffect, useRef, useState } from "react";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import {
    getDashboard,
    getSummary,
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
} from "react-icons/hi2";

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

interface SummaryItem {
    name: string;
    description: string;
}

export default function Dashboard() {
    const queryClient = useQueryClient();

    const { data, isLoading } =
        useQuery<DashboardResponse>({
            queryKey: ["dashboard"],
            queryFn: async () => {
                const response =
                    await getDashboard();

                return response.data;
            },
        });

    const [description, setDescription] =
        useState("");

    const [summaryLoading, setSummaryLoading] =
        useState(false);

    const [now, setNow] = useState(new Date());

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (
            data?.myReport &&
            description === ""
        ) {
            setDescription(
                data.myReport.description
            );
        }
    }, [data, description]);

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
                queryKey: ["dashboard"],
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

        reportMutation.mutate(text);
    }


    const handleReportSummary = async () => {
        try {
            const summary = description;

            navigator.clipboard.writeText(summary)

            toast.success("Summary copied successfully.")


        } catch (error) {
            toast.error("Unable to copy summary.")
        }
    }

    const handleSummary = async () => {
        setSummaryLoading(true);

        try {
            const response = await getSummary();

            const summary: SummaryItem[] = response.data;

            const text = summary
                .map(
                    (item) =>
                        `${item.name}:\n${item.description}`
                )
                .join("\n\n");

            await navigator.clipboard.writeText(text);

            toast.success("Summary copied successfully.");
        } catch {
            toast.error("Unable to generate summary.");
        } finally {
            setSummaryLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading dashboard…
                </p>
            </div>
        );
    }

    const shouldShowReminder =
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
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:space-y-6">
            {shouldShowReminder && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-950/30">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-500">
                                Daily Report Reminder
                            </h3>

                            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                Please submit today's work report before leaving.
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                textareaRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                })
                            }
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            Write Report
                        </button>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes dashFadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .dash-fade { animation: none !important; opacity: 1 !important; }
                }
            `}</style>

            {/* Overview — progress + stats, one connected panel */}
            <section className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/60 p-4 dark:border-slate-800/60 dark:from-slate-900/50 dark:to-slate-900/20 sm:p-6">

                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {submitted} of {total} team members have submitted today
                    </p>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {progress}%
                    </span>
                </div>

                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                    <div
                        style={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out"
                    />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 lg:grid-cols-4 lg:gap-4">

                    <StatWidget
                        icon={<HiOutlineDocumentCheck className="h-4 w-4" />}
                        label="Submitted"
                        value={data?.stats.submitted}
                        iconBg="bg-emerald-50 dark:bg-emerald-500/10"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />

                    <StatWidget
                        icon={<HiOutlineClock className="h-4 w-4" />}
                        label="Pending"
                        value={data?.stats.pending}
                        iconBg="bg-amber-50 dark:bg-amber-500/10"
                        iconColor="text-amber-600 dark:text-amber-400"
                    />

                    <StatWidget
                        icon={<HiOutlineUsers className="h-4 w-4" />}
                        label="Members"
                        value={data?.stats.totalMembers}
                        iconBg="bg-violet-50 dark:bg-violet-500/10"
                        iconColor="text-violet-600 dark:text-violet-400"
                    />

                    <StatWidget
                        icon={<HiOutlineChartBarSquare className="h-4 w-4" />}
                        label="Completion"
                        value={`${data?.stats.completion}%`}
                        iconBg="bg-blue-50 dark:bg-blue-500/10"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />

                </div>

            </section>

            {/* Report editor */}
            <section className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40 sm:p-6">

                <textarea
                    ref={textareaRef}
                    rows={5}
                    value={description}
                    onChange={(e) =>
                        setDescription(e.target.value)
                    }
                    placeholder="What did you work on today?"
                    className="w-full resize-none overflow-hidden border-0 bg-transparent text-[15px] leading-7 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-600"
                    style={{ minHeight: "140px" }}
                />

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/70">

                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {description.length} characters
                    </span>

                    <div className="flex items-center gap-2">

                        <button
                            onClick={handleReportSummary}
                            disabled={!description.trim()}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <HiOutlineClipboardDocument className="h-4 w-4" />
                            Copy report
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={reportMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        >
                            {reportMutation.isPending ? (
                                <>
                                    <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
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
            <section className="grid gap-5 lg:grid-cols-2 lg:gap-6">

                {/* Team status */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">

                    <p className="px-5 pt-5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:px-6">
                        Team
                    </p>

                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/60">

                        {data?.teamStatus.map((member, idx) => (
                            <div
                                key={member.id}
                                className="dash-fade group flex items-center justify-between gap-3 px-5 py-3.5 opacity-0 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 sm:px-6"
                                style={{
                                    animation: "dashFadeIn 0.4s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 35}ms`,
                                }}
                            >
                                <div className="flex min-w-0 items-center gap-3">

                                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-semibold text-white dark:from-slate-500 dark:to-slate-700">
                                        {member.name.charAt(0).toUpperCase()}

                                        {member.submitted && (
                                            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                                            </span>
                                        )}
                                    </div>

                                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                        {member.name}
                                    </p>

                                </div>

                                <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${member.submitted
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                        : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                                        }`}
                                >
                                    {member.submitted ? "Submitted" : "Pending"}
                                </span>

                            </div>
                        ))}

                    </div>

                </div>

                {/* Activity feed */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">

                    <p className="px-5 pt-5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 sm:px-6">
                        Activity
                    </p>

                    <div className="mt-2 max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800/60">

                        {data?.reports.length === 0 && (
                            <div className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500 sm:px-6">
                                No reports submitted today.
                            </div>
                        )}

                        {data?.reports.map((report, idx) => (
                            <div
                                key={report.id}
                                className="dash-fade group px-5 py-4 opacity-0 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30 sm:px-6"
                                style={{
                                    animation: "dashFadeIn 0.4s ease-out forwards",
                                    animationDelay: `${Math.min(idx, 8) * 35}ms`,
                                }}
                            >
                                <div className="flex items-start gap-3">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
                                        {report.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex flex-wrap items-baseline gap-x-2">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                {report.user.name}
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                {new Date(
                                                    report.createdAt
                                                ).toLocaleTimeString("en-IN", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {report.description}
                                        </p>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>

                </div>

            </section>

            {/* Summary action panel */}
            <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40 sm:flex-row sm:items-center sm:p-6">

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Copy a formatted summary of today's reports to share with the team.
                </p>

                <button
                    onClick={handleSummary}
                    disabled={summaryLoading}
                    className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                >
                    {summaryLoading ? (
                        <>
                            <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <HiOutlineClipboardDocument className="h-4 w-4" />
                            Copy Team Report
                        </>
                    )}
                </button>

            </section>

        </div>
    );
}

function StatWidget({
    icon,
    label,
    value,
    iconBg,
    iconColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="group rounded-xl border border-slate-200/50 bg-white/60 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md hover:shadow-slate-200/60 dark:border-slate-800/50 dark:bg-slate-900/30 dark:hover:border-slate-700 dark:hover:shadow-none sm:p-4">

            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
                {icon}
            </div>

            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {value}
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {label}
            </p>

        </div>
    );
}