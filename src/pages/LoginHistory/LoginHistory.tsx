import {
    HiOutlineClock,
    HiOutlineComputerDesktop,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineMapPin,
} from "react-icons/hi2";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getLoginHistory } from "../../services/loginHistory";

import type { LoginHistoryItem } from "../../services/loginHistory";

export default function LoginHistory() {

    const [page, setPage] = useState(1);

    const limit = 10;

    const {
        data,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: ["login-history", page, limit],

        queryFn: async () => {
            const response = await getLoginHistory(page, limit);
            return response.data;
        },

        placeholderData: (previousData) => previousData,
    });

    const history: LoginHistoryItem[] = data?.items ?? [];

    const pagination = data?.pagination;

    const total = pagination?.total ?? 0;
    const totalPages = pagination?.totalPages ?? 1;

    function goToPage(nextPage: number) {
        if (nextPage < 1 || nextPage > totalPages) return;
        setPage(nextPage);
    }

    return (
        <div className="mx-auto max-w-6xl py-2 sm:py-4">

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <HiOutlineClock size={19} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                            Login History
                        </h1>
                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            View account login activity and access attempts.
                        </p>
                    </div>

                </div>

                {!isLoading && (
                    <div className="flex items-center gap-2">
                        <SuccessFailSummary history={history} />
                        <span className="badge-primary">
                            {total} {total === 1 ? "Entry" : "Entries"}
                        </span>
                    </div>
                )}

            </div>

            {/* Content */}
            <div
                className="relative mt-5"
                style={
                    !isLoading && !isError && history.length > 0
                        ? { minHeight: `${limit * 52 + 90}px` }
                        : undefined
                }
            >

                {/* subtle overlay while paginating, keeps old rows visible instead of full skeleton flash */}
                {isFetching && !isLoading && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-2xl bg-white/50 pt-24 backdrop-blur-[1px] dark:bg-black/30">
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-zinc-700 dark:border-t-zinc-300" />
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                                Loading…
                            </span>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <LoginHistorySkeleton />
                ) : isError ? (
                    <LoginHistoryError onRetry={() => refetch()} />
                ) : history.length === 0 ? (
                    <EmptyLoginHistory />
                ) : (
                    <>
                        {/* Desktop */}
                        <div className="card hidden overflow-hidden md:block">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200/70 dark:border-zinc-800">
                                            <th className="px-5 py-3 text-left table-heading">Status</th>
                                            <th className="px-5 py-3 text-left table-heading">User</th>
                                            <th className="px-5 py-3 text-left table-heading">Date &amp; Time</th>
                                            <th className="px-5 py-3 text-left table-heading">IP Address</th>
                                            <th className="px-5 py-3 text-left table-heading">Browser</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((item) => (
                                            <LoginHistoryRow key={item.id} item={item} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile */}
                        <div className="space-y-2 md:hidden">
                            {history.map((item) => (
                                <MobileLoginHistoryCard key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                total={total}
                                limit={limit}
                                onPageChange={goToPage}
                            />
                        )}
                    </>
                )}

            </div>

        </div>
    );
}

function SuccessFailSummary({ history }: { history: LoginHistoryItem[] }) {
    const successCount = history.filter((h) => h.status === "SUCCESS").length;
    const failCount = history.length - successCount;

    return (
        <div className="hidden items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 sm:flex">
            <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {successCount} success
            </span>
            <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {failCount} failed
            </span>
        </div>
    );
}

function formatDateParts(createdAt: string) {
    const date = new Date(createdAt);

    const formattedDate = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

    const formattedTime = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    });

    return { formattedDate, formattedTime };
}

function LoginHistoryRow({ item }: { item: LoginHistoryItem }) {

    const success = item.status === "SUCCESS";
    const { formattedDate, formattedTime } = formatDateParts(item.createdAt);

    return (
        <tr className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-zinc-800/60 dark:hover:bg-zinc-900/40">

            {/* Status */}
            <td className="px-5 py-3">
                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${success
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                >
                    {success ? <HiOutlineCheckCircle size={15} /> : <HiOutlineXCircle size={15} />}
                </div>
            </td>

            {/* User */}
            <td className="px-5 py-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {item.user?.name ?? "Unknown User"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-600">
                        {item.email}
                    </p>
                </div>
            </td>

            {/* Date */}
            <td className="px-5 py-3">
                <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">{formattedDate}</p>
                <p className="text-[10px] text-slate-400 dark:text-zinc-600">{formattedTime}</p>
            </td>

            {/* IP */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                    <HiOutlineMapPin size={12} className="text-slate-300 dark:text-zinc-700" />
                    <code className="text-[10px] text-slate-500 dark:text-zinc-500">
                        {item.ipAddress ?? "Not available"}
                    </code>
                </div>
            </td>

            {/* Browser */}
            <td className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                    <HiOutlineComputerDesktop size={13} className="text-slate-400 dark:text-zinc-600" />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                        {formatUserAgent(item.userAgent)}
                    </span>
                </div>
            </td>

        </tr>
    );
}

function MobileLoginHistoryCard({ item }: { item: LoginHistoryItem }) {

    const success = item.status === "SUCCESS";
    const { formattedDate, formattedTime } = formatDateParts(item.createdAt);

    return (
        <div className="card px-4 py-3">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${success
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                        }`}
                >
                    {success ? <HiOutlineCheckCircle size={16} /> : <HiOutlineXCircle size={16} />}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {item.user?.name ?? "Unknown User"}
                        </p>
                        <span
                            className={
                                success
                                    ? "badge-success"
                                    : "rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            }
                        >
                            {success ? "Success" : "Failed"}
                        </span>
                    </div>
                    <p className="truncate text-[10px] text-slate-400 dark:text-zinc-600">{item.email}</p>
                </div>

                <div className="shrink-0 text-right">
                    <p className="text-[10px] font-semibold text-slate-600 dark:text-zinc-400">{formattedDate}</p>
                    <p className="text-[9px] text-slate-400 dark:text-zinc-600">{formattedTime}</p>
                </div>

            </div>

            <div className="mt-2 flex items-center gap-4 border-t border-slate-100 pt-2 dark:border-zinc-800/60">
                <span className="text-[9px] text-slate-400 dark:text-zinc-600">
                    IP: {item.ipAddress ?? "Not available"}
                </span>
                <span className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-zinc-600">
                    <HiOutlineComputerDesktop size={11} />
                    {formatUserAgent(item.userAgent)}
                </span>
            </div>

        </div>
    );
}

/**
 * Windowed pagination: shows first page, last page, current page +/-1,
 * and "…" gaps in between instead of rendering every page number.
 * (The original rendered one button per page, which breaks down once
 * totalPages gets large.)
 */
function getPageWindow(page: number, totalPages: number): (number | "gap")[] {
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

    const sorted = Array.from(pages)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b);

    const result: (number | "gap")[] = [];

    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            result.push("gap");
        }
        result.push(sorted[i]);
    }

    return result;
}

function Pagination({
    page,
    totalPages,
    total,
    limit,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
}) {

    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    const pageWindow = getPageWindow(page, totalPages);

    return (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-200/60 pt-5 dark:border-zinc-800/60 sm:flex-row sm:justify-between">

            <p className="order-2 text-[11px] text-slate-400 dark:text-zinc-600 sm:order-1">
                Showing{" "}
                <span className="font-semibold text-slate-600 dark:text-zinc-400">
                    {start}-{end}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600 dark:text-zinc-400">{total}</span>{" "}
                entries
            </p>

            <div className="order-1 flex items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-50/60 p-1 dark:border-zinc-800 dark:bg-zinc-900/40 sm:order-2">

                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="pagination-btn !border-0 !bg-transparent"
                    aria-label="Previous page"
                >
                    <HiOutlineChevronLeft size={14} />
                </button>

                <div className="flex items-center gap-1">
                    {pageWindow.map((entry, index) =>
                        entry === "gap" ? (
                            <span
                                key={`gap-${index}`}
                                className="flex h-7 w-5 items-center justify-center text-[11px] text-slate-300 dark:text-zinc-700"
                            >
                                …
                            </span>
                        ) : (
                            <button
                                key={entry}
                                onClick={() => onPageChange(entry)}
                                aria-current={entry === page ? "page" : undefined}
                                className={`flex h-7 min-w-7 items-center justify-center rounded-lg px-2 text-[11px] font-medium transition-colors ${entry === page
                                        ? "pagination-btn-active"
                                        : "text-slate-500 hover:bg-white hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                    }`}
                            >
                                {entry}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="pagination-btn !border-0 !bg-transparent"
                    aria-label="Next page"
                >
                    <HiOutlineChevronRight size={14} />
                </button>

            </div>

        </div>
    );
}

function LoginHistorySkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="animate-pulse">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-zinc-800/60"
                    >
                        <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-zinc-800" />
                        <div className="w-32 space-y-2">
                            <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-2 w-28 rounded bg-slate-100 dark:bg-zinc-900" />
                        </div>
                        <div className="ml-auto hidden w-24 space-y-2 sm:block">
                            <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-zinc-800" />
                            <div className="h-2 w-12 rounded bg-slate-100 dark:bg-zinc-900" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatUserAgent(userAgent: string | null) {
    if (!userAgent) return "Not available";
    if (userAgent.includes("Edg/")) return "Microsoft Edge";
    if (userAgent.includes("Chrome/")) return "Google Chrome";
    if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
    if (userAgent.includes("Safari/")) return "Safari";
    return userAgent;
}

function LoginHistoryError({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                <HiOutlineXCircle size={22} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                Unable to load login history
            </h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                Something went wrong while loading login activity.
            </p>
            <button onClick={onRetry} className="btn-secondary mt-5 text-xs">
                Try again
            </button>
        </div>
    );
}

function EmptyLoginHistory() {
    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineClock size={22} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">No login activity</h3>
            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                No login history has been recorded yet.
            </p>
        </div>
    );
}