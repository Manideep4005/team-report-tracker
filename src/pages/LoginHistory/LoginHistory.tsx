import {
    HiOutlineClock,
    HiOutlineComputerDesktop,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
} from "react-icons/hi2";

import { useQuery } from "@tanstack/react-query";

import { getLoginHistory } from "../../services/loginHistory";

export default function LoginHistory() {

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["login-history"],

        queryFn: async () => {
            const response =
                await getLoginHistory();

            return response.data;
        },
    });

    const history = data ?? [];

    return (
        <div className="mx-auto max-w-6xl py-2 sm:py-4">

            {/* Header */}

            <div className="flex flex-col gap-4 border-b border-slate-200/50 pb-5 dark:border-zinc-800/50 sm:flex-row sm:items-end sm:justify-between">

                <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">
                        <HiOutlineClock size={18} />
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
                    <span className="badge-primary">
                        {history.length}{" "}
                        {history.length === 1
                            ? "Entry"
                            : "Entries"}
                    </span>
                )}

            </div>

            {/* Content */}

            <div className="mt-6">

                {isLoading ? (
                    <LoginHistorySkeleton />
                ) : isError ? (
                    <LoginHistoryError
                        onRetry={() => refetch()}
                    />
                ) : history.length === 0 ? (
                    <EmptyLoginHistory />
                ) : (
                    <div className="space-y-3">

                        {history.map((item) => (
                            <LoginHistoryCard
                                key={item.id}
                                item={item}
                            />
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}
function LoginHistoryCard({
    item,
}: {
    item: import("../../services/loginHistory").LoginHistoryItem;
}) {

    const success =
        item.status === "SUCCESS";

    const date = new Date(item.createdAt);

    const formattedDate =
        date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
        });

    const formattedTime =
        date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
        });

    return (
        <div className="card p-4 sm:p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* User */}

                <div className="flex min-w-0 items-center gap-3">

                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${success
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                            }`}
                    >
                        {success ? (
                            <HiOutlineCheckCircle size={19} />
                        ) : (
                            <HiOutlineXCircle size={19} />
                        )}
                    </div>

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                            <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                {item.user?.name ?? "Unknown User"}
                            </h2>

                            <span
                                className={
                                    success
                                        ? "badge-success"
                                        : "inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                }
                            >
                                {success
                                    ? "Successful"
                                    : "Failed"}
                            </span>

                        </div>

                        <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-zinc-500">
                            {item.email}
                        </p>

                    </div>

                </div>

                {/* Date */}

                <div className="shrink-0 text-left sm:text-right">

                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {formattedDate}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
                        {formattedTime}
                    </p>

                </div>

            </div>

            {/* Technical information */}

            <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800/70 sm:grid-cols-2">

                <InfoItem
                    label="IP Address"
                    value={item.ipAddress ?? "Not available"}
                />

                <InfoItem
                    label="Browser / Device"
                    value={formatUserAgent(item.userAgent)}
                    icon
                />

            </div>

        </div>
    );
} function InfoItem({
    label,
    value,
    icon,
}: {
    label: string;
    value: string;
    icon?: boolean;
}) {
    return (
        <div className="min-w-0 rounded-xl bg-slate-50/70 px-3 py-2.5 dark:bg-zinc-900/40">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-600">
                {label}
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-1.5">

                {icon && (
                    <HiOutlineComputerDesktop
                        size={13}
                        className="shrink-0 text-slate-400 dark:text-zinc-600"
                    />
                )}

                <p
                    className="truncate text-[11px] font-medium text-slate-600 dark:text-zinc-400"
                    title={value}
                >
                    {value}
                </p>

            </div>

        </div>
    );
} function formatUserAgent(
    userAgent: string | null
) {
    if (!userAgent) {
        return "Not available";
    }

    if (userAgent.includes("Edg/")) {
        return "Microsoft Edge";
    }

    if (userAgent.includes("Chrome/")) {
        return "Google Chrome";
    }

    if (userAgent.includes("Firefox/")) {
        return "Mozilla Firefox";
    }

    if (userAgent.includes("Safari/")) {
        return "Safari";
    }

    return userAgent;
} function LoginHistorySkeleton() {
    return (
        <div className="space-y-3">

            {Array.from({ length: 5 }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="card animate-pulse p-5"
                    >
                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />

                                <div>
                                    <div className="h-3 w-32 rounded bg-slate-200 dark:bg-zinc-800" />

                                    <div className="mt-2 h-2.5 w-44 rounded bg-slate-100 dark:bg-zinc-900" />
                                </div>

                            </div>

                            <div className="hidden sm:block">
                                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                                <div className="mt-2 h-2.5 w-16 rounded bg-slate-100 dark:bg-zinc-900" />
                            </div>

                        </div>
                    </div>
                )
            )}

        </div>
    );
} function LoginHistoryError({
    onRetry,
}: {
    onRetry: () => void;
}) {
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

            <button
                onClick={onRetry}
                className="btn-secondary mt-5 text-xs"
            >
                Try again
            </button>

        </div>
    );
} function EmptyLoginHistory() {
    return (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-zinc-900 dark:text-zinc-500">
                <HiOutlineClock size={22} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                No login activity
            </h3>

            <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                No login history has been recorded yet.
            </p>

        </div>
    );
}