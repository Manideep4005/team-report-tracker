import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    HiOutlineClipboardDocument,
    HiOutlineDocumentMagnifyingGlass,
    HiOutlineXMark,
} from "react-icons/hi2";
import { format } from "date-fns";
import { toast } from "sonner";

import { getAllReports } from "../../services/report";
import DayPickerInput from "../../components/DayPickerInput";

interface ReportItem {
    id: string;
    reportDate: string;
    description: string;
    userId: string;
    user: {
        name: string;
        email: string;
    };
}

interface DateGroup {
    date: string;
    reports: ReportItem[];
}

export default function Reports() {
    const [date, setDate] = useState<Date | null>(null);

    const dateParam = date
        ? format(date, "yyyy-MM-dd")
        : undefined;

    const { data, isLoading } = useQuery<ReportItem[]>({
        queryKey: ["all-reports", dateParam],

        queryFn: async () => {
            const response = await getAllReports(dateParam);
            return response.data;
        },
    });

    const groupedReports = useMemo<DateGroup[]>(() => {
        if (!data?.length) {
            return [];
        }

        const groups = new Map<string, ReportItem[]>();

        for (const report of data) {
            const key = format(
                new Date(report.reportDate),
                "yyyy-MM-dd"
            );

            if (!groups.has(key)) {
                groups.set(key, []);
            }

            groups.get(key)!.push(report);
        }

        return Array.from(groups.entries())
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, reports]) => ({
                date,
                reports: reports.sort((a, b) =>
                    a.user.name.localeCompare(b.user.name)
                ),
            }));
    }, [data]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Report copied successfully.");
        } catch {
            toast.error("Unable to copy report.");
        }
    };

    const totalReports = data?.length ?? 0;

    return (
        <div className="mx-auto max-w-4xl py-2 sm:py-4">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        Team Reports
                    </h1>

                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                        Browse the team's daily work reports.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">

                    {!isLoading && totalReports > 0 && (
                        <span className="badge-primary font-semibold">
                            {totalReports}{" "}
                            {totalReports === 1
                                ? "Report"
                                : "Reports"}
                        </span>
                    )}

                    <DayPickerInput
                        value={date}
                        onChange={setDate}
                        placeholder="Filter by date"
                    />

                    <button
                        onClick={() => setDate(null)}
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
                ) : groupedReports.length ? (
                    <div className="space-y-10">

                        {groupedReports.map((group) => (
                            <DateSection
                                key={group.date}
                                date={group.date}
                                reports={group.reports}
                                onCopy={handleCopy}
                            />
                        ))}

                    </div>
                ) : (
                    <EmptyState />
                )}

            </div>
        </div>
    );
}

function DateSection({
    date,
    reports,
    onCopy,
}: {
    date: string;
    reports: ReportItem[];
    onCopy: (text: string) => void;
}) {
    const parsedDate = new Date(`${date}T00:00:00`);

    const formattedDate = parsedDate.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        }
    );

    return (
        <section>

            {/* Date Header */}

            <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm dark:bg-white dark:text-zinc-900">
                    {parsedDate.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        timeZone: "Asia/Kolkata",
                    })}
                </div>

                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {formattedDate}
                    </h2>

                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        {reports.length}{" "}
                        {reports.length === 1
                            ? "report"
                            : "reports"}{" "}
                        submitted
                    </p>
                </div>

                <div className="h-px flex-1 bg-slate-200/70 dark:bg-zinc-800/70" />

            </div>

            {/* Reports */}

            <div className="relative ml-5 space-y-4 border-l border-slate-200 pl-7 dark:border-zinc-800">

                {reports.map((report) => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        onCopy={onCopy}
                    />
                ))}

            </div>

        </section>
    );
}

function ReportCard({
    report,
    onCopy,
}: {
    report: ReportItem;
    onCopy: (text: string) => void;
}) {
    const initials = report.user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    return (
        <article className="relative">

            {/* Timeline dot */}

            <span className="absolute -left-[35px] top-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 dark:border-zinc-950 dark:bg-blue-400" />

            <div className="card overflow-hidden">

                {/* User */}

                <div className="flex items-center justify-between gap-3 border-b border-slate-200/50 px-4 py-3 dark:border-zinc-800/60 sm:px-5">

                    <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-[10px] font-bold text-white shadow-sm">
                            {initials}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                {report.user.name}
                            </p>

                            <p className="truncate text-[10px] text-slate-400 dark:text-zinc-500">
                                {report.user.email}
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() =>
                            onCopy(report.description)
                        }
                        className="btn-secondary shrink-0 px-2.5 py-1.5 text-[10px] font-semibold"
                    >
                        <HiOutlineClipboardDocument
                            className="mr-1 h-3.5 w-3.5"
                        />
                        Copy
                    </button>

                </div>

                {/* Report */}

                <div className="px-4 py-4 sm:px-5">

                    <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-650 dark:text-zinc-350">
                        {report.description}
                    </p>

                </div>

            </div>
        </article>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-8">

            {Array.from({ length: 2 }).map((_, sectionIndex) => (
                <div key={sectionIndex}>

                    <div className="mb-5 flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-zinc-800" />

                        <div className="space-y-2">
                            <div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-2.5 w-20 animate-pulse rounded bg-slate-100 dark:bg-zinc-900" />
                        </div>
                    </div>

                    <div className="ml-5 space-y-4 border-l border-slate-200 pl-7 dark:border-zinc-800">

                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="card animate-pulse p-5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-zinc-800" />

                                    <div className="space-y-2">
                                        <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                                        <div className="h-2.5 w-32 rounded bg-slate-100 dark:bg-zinc-900" />
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2">
                                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-zinc-900" />
                                    <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-zinc-900" />
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            ))}

        </div>
    );
}
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/80 px-6 py-16 text-center dark:border-zinc-800">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineDocumentMagnifyingGlass size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                No team reports found
            </h3>

            <p className="mt-1 max-w-xs text-xs text-slate-400 dark:text-zinc-500">
                There are no reports available for the selected date.
            </p>

        </div>
    );
}