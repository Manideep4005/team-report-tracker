import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    HiOutlineCalendarDays,
    HiOutlineXMark,
    HiOutlineDocumentMagnifyingGlass,
} from "react-icons/hi2";
import { getHistory } from "../../services/report";
import { HiOutlineClipboardDocument } from "react-icons/hi2";
import { toast } from "sonner";

interface ReportItem {
    id: string;
    reportDate: string;
    description: string;
}

export default function History() {
    const [date, setDate] = useState("");

    const { data, isLoading } = useQuery<ReportItem[]>({
        queryKey: ["history", date],
        queryFn: async () => {
            const response = await getHistory(date || undefined);
            return response.data;
        },
    });


    return (
        <div className="mx-auto max-w-3xl py-2 sm:py-4">
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
            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        History
                    </h1>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        Browse your daily work reports.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {!isLoading && data?.length ? (
                        <span className="badge-primary font-semibold">
                            {data.length} {data.length === 1 ? "Report" : "Reports"}
                        </span>
                    ) : null}

                    <div className="relative">
                        <HiOutlineCalendarDays
                            size={14}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-9 rounded-xl border border-slate-200 bg-white/50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/5 dark:border-zinc-800 dark:bg-zinc-900/55 dark:text-zinc-200 dark:[color-scheme:dark]"
                        />
                    </div>

                    <button
                        onClick={() => setDate("")}
                        disabled={!date}
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white/50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900/55 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                        <HiOutlineXMark size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-6 sm:mt-8">
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

function TimelineEntry({ report, index, isLast }: { report: ReportItem; index: number; isLast: boolean }) {
    const handleCopyReport = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Report copied successfully.");
        } catch {
            toast.error("Unable to copy report.");
        }
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

    return (
        <li
            className="history-entry group relative flex gap-4 pb-6 opacity-0"
            style={{
                animation: "historyFadeIn 0.35s ease-out forwards",
                animationDelay: `${Math.min(index, 10) * 35}ms`,
            }}
        >
            {/* Connecting rail */}
            {!isLast && (
                <span className="absolute left-[23px] top-12 h-[calc(100%-1.75rem)] w-px bg-slate-200 transition-colors dark:bg-zinc-800" />
            )}

            {/* Date badge */}
            <div className="relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors duration-200 group-hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:group-hover:border-zinc-700">
                <span className="text-sm font-bold leading-none">{day}</span>
                <span className="mt-1 text-[8px] font-bold tracking-wider text-slate-400 dark:text-zinc-500">
                    {month}
                </span>
            </div>

            {/* Entry card */}
            <div className="card flex-1 p-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-slate-350 dark:group-hover:border-zinc-700">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
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
                            {full}
                        </h3>
                    </div>

                    <button
                        onClick={() => handleCopyReport(report.description)}
                        className="btn-secondary py-1 px-2.5 text-[10px] font-semibold"
                        title="Copy report"
                    >
                        <HiOutlineClipboardDocument className="mr-1 h-3.5 w-3.5" />
                        Copy
                    </button>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-650 dark:text-zinc-350">
                    {report.description}
                </p>
            </div>
        </li>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200 dark:bg-zinc-800" />
                    <div className="card flex-1 p-5 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-6 w-14 rounded-lg bg-slate-200 dark:bg-zinc-800" />
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 px-6 py-16 text-center dark:border-zinc-850">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineDocumentMagnifyingGlass size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
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