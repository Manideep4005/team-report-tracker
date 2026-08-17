import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    HiOutlineXMark,
    HiOutlineDocumentMagnifyingGlass,
    HiOutlineClipboardDocument,
    HiOutlinePencilSquare,
    HiOutlineArrowPath,
} from "react-icons/hi2";
import { format } from "date-fns";
import { getHistory, saveReport } from "../../services/report";
import { toast } from "sonner";
import DayPickerInput from "../../components/DayPickerInput";

interface ReportItem {
    id: string;
    reportDate: string;
    description: string;
}

export default function History() {
    const [date, setDate] = useState<Date | null>(null);

    const dateParam = date ? format(date, "yyyy-MM-dd") : "";

    const { data, isLoading } = useQuery<ReportItem[]>({
        queryKey: ["history", dateParam],
        queryFn: async () => {
            const response = await getHistory(dateParam || undefined);
            return response.data;
        },
    });

    return (
        <div className="mx-auto max-w-3xl px-3 py-2 sm:px-4 sm:py-4 lg:px-0">
            {/* Local keyframes — Tailwind utility classes reference these by name */}
            <style>{`
                @keyframes historyFadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes historyPing {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    .history-entry { animation: none !important; opacity: 1 !important; }
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col gap-3 border-b border-slate-200/50 pb-4 dark:border-zinc-800/50 sm:gap-4 sm:pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl md:text-2xl">
                        History
                    </h1>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-500 sm:text-xs">
                        Browse your daily work reports.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {!isLoading && data?.length ? (
                        <span className="badge-primary shrink-0 font-semibold">
                            {data.length} {data.length === 1 ? "Report" : "Reports"}
                        </span>
                    ) : null}

                    <div className="min-w-0 flex-1 sm:flex-none">
                        <DayPickerInput
                            value={date}
                            onChange={setDate}
                            placeholder="Filter by date"
                        />
                    </div>

                    <button
                        onClick={() => setDate(null)}
                        disabled={!date}
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white/50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/55 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <HiOutlineXMark size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-5 sm:mt-6 md:mt-8">
                {isLoading ? (
                    <SkeletonList />
                ) : data?.length ? (
                    <ol className="relative space-y-1">
                        {data.map((report, idx) => (
                            <TimelineEntry
                                key={report.id}
                                report={report}
                                index={idx}
                                isLast={idx === data.length - 1}
                            />
                        ))}
                    </ol>
                ) : (
                    <EmptyState hasDateFilter={!!date} />
                )}
            </div>
        </div>
    );
}

function TimelineEntry({
    report,
    index,
    isLast,
}: {
    report: ReportItem;
    index: number;
    isLast: boolean;
}) {
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(report.description);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Keep local draft in sync if the underlying report data changes
    // (e.g. after a refetch) while not actively editing.
    useEffect(() => {
        if (!isEditing) {
            setDescription(report.description);
        }
    }, [report.description, isEditing]);

    // Autosize the textarea to its content, same as the dashboard editor.
    useEffect(() => {
        if (!isEditing) return;
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [description, isEditing]);

    const reportMutation = useMutation({
        mutationFn: saveReport,

        onSuccess: (response) => {
            setDescription(response.data.description);
            setIsEditing(false);

            // Refresh any history views (all date filters), since this
            // report may appear under more than one cached query.
            queryClient.invalidateQueries({ queryKey: ["history"] });

            toast.success("Report updated successfully.");
        },

        onError: (error: any) => {
            const response = error.response?.data;

            if (response?.errors?.length) {
                response.errors.forEach((err: { message: string }) => {
                    toast.error(err.message);
                });
                return;
            }

            toast.error(response?.message || "Failed to update report.");
        },
    });

    const handleCopyReport = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Report copied successfully.");
        } catch {
            toast.error("Unable to copy report.");
        }
    };

    const handleSave = () => {
        const text = description.trim();

        if (!text) {
            toast.warning("Please enter a report.");
            return;
        }

        reportMutation.mutate({
            description: text,
            reportDate: format(new Date(report.reportDate), "yyyy-MM-dd"),
        });
    };

    const handleCancel = () => {
        setDescription(report.description);
        setIsEditing(false);
    };

    const parsed = new Date(report.reportDate);

    const day = parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        timeZone: "Asia/Kolkata",
    });
    const month = parsed
        .toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })
        .toUpperCase();
    const full = parsed.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
    const fullShort = parsed.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

    return (
        <li
            className="history-entry group relative flex gap-3 pb-5 opacity-0 sm:gap-4 sm:pb-6"
            style={{
                animation: "historyFadeIn 0.35s ease-out forwards",
                animationDelay: `${Math.min(index, 10) * 35}ms`,
            }}
        >
            {/* Connecting rail */}
            {!isLast && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-px bg-slate-200 transition-colors dark:bg-zinc-800 sm:left-[23px] sm:top-12 sm:h-[calc(100%-1.75rem)]" />
            )}

            {/* Date badge */}
            <div className="relative z-10 flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors duration-200 group-hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:group-hover:border-zinc-700 sm:h-12 sm:w-12 sm:rounded-xl">
                <span className="text-xs font-bold leading-none sm:text-sm">{day}</span>
                <span className="mt-1 text-[7px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 sm:text-[8px]">
                    {month}
                </span>
            </div>

            {/* Entry card */}
            <div className="card min-w-0 flex-1 p-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-350 dark:group-hover:border-zinc-700 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap sm:gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span
                                className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                                style={{
                                    animation: "historyPing 2.5s cubic-bezier(0,0,0.2,1) infinite",
                                }}
                            />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                        </span>

                        <h3 className="truncate text-xs font-bold text-slate-800 dark:text-zinc-200">
                            <span className="sm:hidden">{fullShort}</span>
                            <span className="hidden sm:inline">{full}</span>
                        </h3>
                    </div>

                    {!isEditing && (
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-secondary py-1 px-2.5 text-[10px] font-semibold"
                                title="Edit report"
                            >
                                <HiOutlinePencilSquare className="mr-1 h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Edit</span>
                            </button>

                            <button
                                onClick={() => handleCopyReport(report.description)}
                                className="btn-secondary py-1 px-2.5 text-[10px] font-semibold"
                                title="Copy report"
                            >
                                <HiOutlineClipboardDocument className="mr-1 h-3.5 w-3.5" />
                                <span className="hidden xs:inline">Copy</span>
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="mt-3">
                        <textarea
                            ref={textareaRef}
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            autoFocus
                            className="w-full resize-none overflow-hidden rounded-lg border border-slate-200 bg-transparent p-2 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 shadow-none outline-none ring-0 focus:border-slate-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-650 dark:focus:border-zinc-700"
                            style={{ minHeight: "90px" }}
                        />

                        <div className="mt-3 flex flex-col-reverse items-stretch gap-2.5 xs:flex-row xs:items-center xs:justify-between xs:gap-3">
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                                {description.length} characters
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCancel}
                                    disabled={reportMutation.isPending}
                                    className="btn-secondary flex-1 py-1 px-3 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 xs:flex-none"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={reportMutation.isPending}
                                    className="btn-primary flex-1 py-1 px-3 text-[10px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 xs:flex-none"
                                >
                                    {reportMutation.isPending ? (
                                        <>
                                            <HiOutlineArrowPath className="mr-1 h-3.5 w-3.5 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        "Save report"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="mt-2.5 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-650 dark:text-zinc-350 sm:mt-3">
                        {report.description}
                    </p>
                )}
            </div>
        </li>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-4 sm:space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3 sm:gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800 sm:h-12 sm:w-12 sm:rounded-xl" />
                    <div className="card min-w-0 flex-1 space-y-3 p-3.5 sm:p-5">
                        <div className="flex justify-between items-center gap-2">
                            <div className="h-3 w-28 rounded bg-slate-200 dark:bg-zinc-800 sm:w-40" />
                            <div className="h-6 w-14 shrink-0 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        </div>
                        <div className="h-3 w-full rounded bg-slate-100 dark:bg-zinc-900" />
                        <div className="h-3 w-4/6 rounded bg-slate-100 dark:bg-zinc-900" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasDateFilter }: { hasDateFilter: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 px-4 py-12 text-center dark:border-zinc-850 sm:px-6 sm:py-16">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500 sm:h-12 sm:w-12">
                <HiOutlineDocumentMagnifyingGlass size={20} className="sm:hidden" />
                <HiOutlineDocumentMagnifyingGlass size={22} className="hidden sm:block" />
            </div>

            <h3 className="mt-3.5 text-sm font-bold text-slate-900 dark:text-white sm:mt-4">
                No reports found
            </h3>

            <p className="mt-1 max-w-xs text-xs text-slate-400 dark:text-zinc-500">
                {hasDateFilter
                    ? "There are no reports matching the selected date."
                    : "You haven't submitted any reports yet."}
            </p>
        </div>
    );
}