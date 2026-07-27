import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    HiOutlineCalendarDays,
    HiOutlineXMark,
    HiOutlineDocumentMagnifyingGlass,
} from "react-icons/hi2";
import { getHistory } from "../../services/report";

export default function History() {
    const [date, setDate] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["history", date],
        queryFn: async () => {
            const response = await getHistory(date || undefined);
            return response.data;
        },
    });

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        History
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Browse your daily work reports.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                    {!isLoading && data?.length ? (
                        <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            {data.length} {data.length === 1 ? "Report" : "Reports"}
                        </span>
                    ) : null}

                    <div className="relative">
                        <HiOutlineCalendarDays
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:[color-scheme:dark]"
                        />
                    </div>

                    <button
                        onClick={() => setDate("")}
                        disabled={!date}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:disabled:hover:bg-slate-900"
                    >
                        <HiOutlineXMark size={14} />
                        Clear
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="mt-8">
                {isLoading ? (
                    <SkeletonList />
                ) : data?.length ? (
                    <ol className="relative">
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

function TimelineEntry({ report, index, isLast }) {
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
                animation: "historyFadeIn 0.45s ease-out forwards",
                animationDelay: `${Math.min(index, 10) * 45}ms`,
            }}
        >
            {/* Connecting rail */}
            {!isLast && (
                <span className="absolute left-[27px] top-14 h-[calc(100%-2.25rem)] w-px bg-slate-200 transition-colors dark:bg-slate-800" />
            )}

            {/* Date badge */}
            <div className="relative z-10 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors duration-200 group-hover:border-blue-300 group-hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:group-hover:border-blue-800 dark:group-hover:bg-blue-500/10">
                <span className="text-base font-semibold leading-none">{day}</span>
                <span className="mt-1 text-[10px] font-medium tracking-wider text-slate-400 dark:text-slate-500">
                    {month}
                </span>
            </div>

            {/* Entry card */}
            <div className="min-w-0 flex-1 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-blue-900/60">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                        <span
                            className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                            style={{ animation: "historyPing 2s cubic-bezier(0,0,0.2,1) infinite" }}
                        />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {full}
                    </h3>
                </div>

                <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                    {report.description}
                </p>
            </div>
        </li>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="flex-1 space-y-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
                        <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800/70" />
                        <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800/70" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ hasDateFilter }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-20 text-center dark:border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                <HiOutlineDocumentMagnifyingGlass size={28} />
            </div>

            <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                No reports found
            </h3>

            <p className="mt-1.5 max-w-xs text-sm text-slate-500 dark:text-slate-400">
                {hasDateFilter
                    ? "There are no reports for the selected date."
                    : "You haven't submitted any reports yet."}
            </p>
        </div>
    );
}