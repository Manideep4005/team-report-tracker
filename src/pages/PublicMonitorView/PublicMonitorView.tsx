import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    HiOutlineArrowPath,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineDocumentText,
    HiOutlineUsers,
    HiOutlineXCircle,
} from "react-icons/hi2";

import DayPickerInput from "../../components/DayPickerInput";

import {
    getPublicMonitor,
    type PublicMonitorData,
    type PublicMonitorReport,
} from "../../services/publicMonitor";

type PublicMonitorReportWithUser = PublicMonitorReport & {
    user: {
        name: string;
    };
};

const AVATAR_HUES = [
    {
        bg: "bg-emerald-400/10",
        text: "text-emerald-300",
        border: "border-emerald-400/20",
    },
    {
        bg: "bg-sky-400/10",
        text: "text-sky-300",
        border: "border-sky-400/20",
    },
    {
        bg: "bg-violet-400/10",
        text: "text-violet-300",
        border: "border-violet-400/20",
    },
    {
        bg: "bg-amber-400/10",
        text: "text-amber-300",
        border: "border-amber-400/20",
    },
    {
        bg: "bg-rose-400/10",
        text: "text-rose-300",
        border: "border-rose-400/20",
    },
];

function hueFor(name: string) {
    const sum = name
        .split("")
        .reduce((total, char) => total + char.charCodeAt(0), 0);

    return AVATAR_HUES[sum % AVATAR_HUES.length];
}

function toDateStr(date: Date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

function toDateObj(dateStr: string) {
    return new Date(`${dateStr}T00:00:00`);
}

function getToday() {
    return toDateStr(new Date());
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(toDateObj(date));
}

function formatReportTime(date: string) {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(date));
}

function formatReportDescription(description: string) {
    return description
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
}

function getInitials(name: string) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0])
        .join("")
        .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Live indicator                                                            */
/* -------------------------------------------------------------------------- */

function LiveIndicator() {
    return (
        <div className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Live
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Metric                                                                     */
/* -------------------------------------------------------------------------- */

function Metric({
    value,
    label,
    icon,
}: {
    value: string | number;
    label: string;
    icon?: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            {icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
                    {icon}
                </div>
            )}

            <div>
                <p className="text-xl font-semibold tracking-tight text-white">
                    {value}
                </p>

                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">
                    {label}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Report activity                                                           */
/* -------------------------------------------------------------------------- */

function ReportActivity({
    report,
}: {
    report: PublicMonitorReportWithUser;
}) {
    const hue = hueFor(report.user.name);
    const lines = formatReportDescription(report.description);

    return (
        <article className="group relative grid grid-cols-[72px_1fr] gap-4 py-6 sm:grid-cols-[92px_1fr] sm:gap-6">
            <div className="absolute left-[35px] top-0 h-full w-px bg-white/[0.06] sm:left-[45px]" />

            <div className="relative z-10 pt-1">
                <p className="text-xs font-medium text-slate-500">
                    {formatReportTime(report.createdAt)}
                </p>
            </div>

            <div className="relative min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${hue.bg} ${hue.text} ${hue.border} text-[10px] font-bold ring-8 ring-[#0A0B0F]`}
                    >
                        {getInitials(report.user.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="text-sm font-semibold text-white">
                                {report.user.name}
                            </h3>

                            <span className="text-slate-700">·</span>

                            <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-emerald-400/80">
                                Submitted
                            </span>
                        </div>

                        {lines.length > 0 ? (
                            <div className="mt-2 space-y-1">
                                {lines.map((line, index) => (
                                    <p
                                        key={`${report.id}-${index}`}
                                        className={
                                            index === 0
                                                ? "text-sm leading-6 text-slate-300"
                                                : "text-sm leading-6 text-slate-500"
                                        }
                                    >
                                        {line}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm italic text-slate-600">
                                No description provided.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

/* -------------------------------------------------------------------------- */
/* Team row                                                                   */
/* -------------------------------------------------------------------------- */

function TeamMemberRow({
    member,
}: {
    member: PublicMonitorData["teamStatus"][number];
}) {
    const hue = hueFor(member.name);

    return (
        <div className="group flex items-center justify-between gap-4 border-b border-white/[0.055] py-3.5 last:border-b-0">
            <div className="flex min-w-0 items-center gap-3">
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${hue.bg} ${hue.text} text-[10px] font-bold`}
                >
                    {getInitials(member.name)}
                </div>

                <p className="min-w-0 truncate text-sm font-medium text-slate-300">
                    {member.name}
                </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                {member.submitted ? (
                    <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] font-medium text-slate-500">
                            Submitted
                        </span>
                    </>
                ) : (
                    <>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-medium text-slate-500">
                            Waiting
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function LoadingScreen() {
    return (
        <div className="animate-pulse">
            <div className="h-3 w-28 rounded bg-white/[0.05]" />

            <div className="mt-6 h-10 w-52 rounded bg-white/[0.05]" />

            <div className="mt-4 h-4 w-72 max-w-full rounded bg-white/[0.04]" />

            <div className="mt-8 h-2 w-full rounded-full bg-white/[0.05]" />

            <div className="mt-8 flex flex-wrap gap-x-16 gap-y-6 border-y border-white/[0.06] py-6">
                {[1, 2, 3].map(item => (
                    <div key={item}>
                        <div className="h-7 w-12 rounded bg-white/[0.05]" />
                        <div className="mt-2 h-3 w-20 rounded bg-white/[0.04]" />
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <div className="h-4 w-40 rounded bg-white/[0.05]" />

                <div className="mt-4 divide-y divide-white/[0.05]">
                    {[1, 2, 3].map(item => (
                        <div key={item} className="flex gap-6 py-7">
                            <div className="h-4 w-14 rounded bg-white/[0.05]" />

                            <div className="flex-1">
                                <div className="h-4 w-36 rounded bg-white/[0.05]" />
                                <div className="mt-3 h-3 w-3/4 rounded bg-white/[0.04]" />
                                <div className="mt-2 h-3 w-1/2 rounded bg-white/[0.04]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

export default function PublicMonitorView() {
    const { token } = useParams<{ token: string }>();

    const [selectedDate, setSelectedDate] = useState(getToday());
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["public-monitor", token, selectedDate],
        queryFn: () => getPublicMonitor(token!, selectedDate),
        enabled: Boolean(token),
        refetchInterval: 30_000,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            setLastUpdated(new Date());
        }
    }, [data]);

    const monitorData: PublicMonitorData | undefined = data?.data;

    const teamStatus = monitorData?.teamStatus ?? [];

    const reports: PublicMonitorReportWithUser[] = teamStatus
        .filter(member => member.submitted && member.report)
        .map(member => ({
            ...member.report!,
            user: {
                name: member.name,
            },
        }));

    const backendStats = monitorData?.stats ?? {
        submitted: 0,
        totalMembers: 0,
        completion: 0,
    };

    const pending = Math.max(
        backendStats.totalMembers - backendStats.submitted,
        0
    );

    const stats = {
        submitted: backendStats.submitted,
        pending,
        totalMembers: backendStats.totalMembers,
        completion: backendStats.completion,
    };

    const progressWidth = Math.min(
        Math.max(stats.completion, 0),
        100
    );

    const allDone =
        stats.totalMembers > 0 &&
        stats.pending === 0;

    const sortedReports = useMemo(
        () =>
            [...reports].sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            ),
        [reports]
    );

    function getErrorMessage() {
        const axiosError = error as any;

        return (
            axiosError?.response?.data?.message ??
            "This monitoring link is invalid, expired, or has been revoked."
        );
    }

    async function handleRefresh() {
        await refetch();
        setLastUpdated(new Date());
    }

    return (
        <div className="dark min-h-screen bg-[#0A0B0F] text-slate-100">
            {/* ================================================================= */}
            {/* HEADER                                                            */}
            {/* ================================================================= */}

            <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0A0B0F]/90 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center">
                            <img
                                src="/group.png"
                                alt="Team Work"
                                className="h-6 w-6 object-contain"
                            />
                        </div>

                        <div>
                            <p className="text-sm font-semibold tracking-tight text-white">
                                Team Work
                            </p>

                            <p className="hidden text-[10px] uppercase tracking-[0.16em] text-slate-600 sm:block">
                                Report Monitor
                            </p>
                        </div>
                    </div>

                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 sm:pb-16">
                {/* ================================================================= */}
                {/* ERROR                                                             */}
                {/* ================================================================= */}

                {isError && (
                    <div className="flex min-h-[70vh] items-center justify-center">
                        <div className="w-full max-w-md text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20">
                                <HiOutlineXCircle size={26} />
                            </div>

                            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                                Public monitor
                            </p>

                            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                                Link unavailable
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                {getErrorMessage()}
                            </p>
                        </div>
                    </div>
                )}

                {/* ================================================================= */}
                {/* LOADING                                                           */}
                {/* ================================================================= */}

                {isLoading && (
                    <div className="pt-10 sm:pt-14">
                        <LoadingScreen />
                    </div>
                )}

                {/* ================================================================= */}
                {/* DATA                                                              */}
                {/* ================================================================= */}

                {!isLoading && !isError && monitorData && (
                    <div className="pt-9 sm:pt-12">
                        {/* ========================================================= */}
                        {/* NEW HERO                                                     */}
                        {/* ========================================================= */}

                        <section>
                            {/* Small heading row */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                                        Daily report
                                    </p>

                                    <p className="mt-1.5 text-sm text-slate-500">
                                        {formatDate(selectedDate)}
                                    </p>
                                </div>

                                <div className="hidden sm:block">
                                    <LiveIndicator />
                                </div>
                            </div>

                            {/* Main reporting information */}
                            <div className="mt-9 grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-end">
                                <div>
                                    <div className="flex items-end gap-3">
                                        <span className="text-5xl font-semibold tracking-[-0.04em] text-white sm:text-6xl">
                                            {stats.submitted}
                                        </span>

                                        <span className="pb-2 text-xl font-medium text-slate-600 sm:text-2xl">
                                            / {stats.totalMembers}
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm text-slate-500">
                                        team members have submitted today's
                                        report
                                    </p>
                                </div>

                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-semibold tracking-tight text-white">
                                        {stats.completion}%
                                    </span>

                                    <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                                        complete
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-7">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                                        style={{
                                            width: `${progressWidth}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <DayPickerInput
                                        value={toDateObj(selectedDate)}
                                        onChange={date =>
                                            setSelectedDate(
                                                toDateStr(date)
                                            )
                                        }
                                        placeholder="Select date"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleRefresh}
                                        disabled={isFetching}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 text-xs font-semibold text-slate-300 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <HiOutlineArrowPath
                                            size={14}
                                            className={
                                                isFetching
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />

                                        Refresh
                                    </button>
                                </div>

                                <p className="text-[11px] text-slate-700">
                                    {allDone
                                        ? "All reports received"
                                        : `${stats.pending} ${
                                              stats.pending === 1
                                                  ? "report"
                                                  : "reports"
                                          } still pending`}
                                </p>
                            </div>
                        </section>

                        {/* ========================================================= */}
                        {/* METRICS                                                     */}
                        {/* ========================================================= */}

                        <section className="mt-10 border-y border-white/[0.07] py-6 sm:mt-12">
                            <div className="flex flex-wrap items-center gap-x-10 gap-y-6 sm:gap-x-16">
                                <Metric
                                    value={stats.submitted}
                                    label="Submitted"
                                    icon={
                                        <HiOutlineCheckCircle size={17} />
                                    }
                                />

                                <Metric
                                    value={stats.pending}
                                    label="Pending"
                                    icon={
                                        <HiOutlineClock size={17} />
                                    }
                                />

                                <Metric
                                    value={stats.totalMembers}
                                    label="Team members"
                                    icon={<HiOutlineUsers size={17} />}
                                />

                                <div className="hidden h-9 w-px bg-white/[0.07] sm:block" />

                                <div className="ml-auto hidden items-center gap-2 md:flex">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-600">
                                        Auto-syncing every 30 sec
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* ========================================================= */}
                        {/* ACTIVITY + TEAM                                            */}
                        {/* ========================================================= */}

                        <section className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
                            {/* Activity */}
                            <div className="min-w-0">
                                <div className="flex items-end justify-between border-b border-white/[0.07] pb-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                                            Activity
                                        </p>

                                        <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                                            Recent reports
                                        </h2>
                                    </div>

                                    <span className="text-xs text-slate-600">
                                        {sortedReports.length}{" "}
                                        {sortedReports.length === 1
                                            ? "report"
                                            : "reports"}
                                    </span>
                                </div>

                                {sortedReports.length > 0 ? (
                                    <div>
                                        {sortedReports.map(report => (
                                            <ReportActivity
                                                key={report.id}
                                                report={report}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.035] text-slate-600">
                                            <HiOutlineDocumentText size={21} />
                                        </div>

                                        <h3 className="mt-4 text-sm font-semibold text-slate-300">
                                            No reports yet
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                                            Reports will appear here as soon
                                            as team members submit them.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Team */}
                            <aside className="lg:border-l lg:border-white/[0.07] lg:pl-8">
                                <div className="border-b border-white/[0.07] pb-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                                        Team
                                    </p>

                                    <div className="mt-1 flex items-baseline justify-between gap-4">
                                        <h2 className="text-lg font-semibold tracking-tight text-white">
                                            Status
                                        </h2>

                                        <span className="text-xs text-slate-600">
                                            {stats.submitted}/
                                            {stats.totalMembers}
                                        </span>
                                    </div>
                                </div>

                                {teamStatus.length > 0 ? (
                                    <div>
                                        {teamStatus.map(member => (
                                            <TeamMemberRow
                                                key={member.id}
                                                member={member}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <HiOutlineUsers
                                            size={22}
                                            className="mx-auto text-slate-700"
                                        />

                                        <p className="mt-3 text-sm text-slate-600">
                                            No team members linked yet.
                                        </p>
                                    </div>
                                )}

                                {teamStatus.length > 0 && (
                                    <div className="mt-7 border-t border-white/[0.07] pt-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-600">
                                                Submitted
                                            </span>

                                            <span className="text-xs font-semibold text-emerald-400">
                                                {stats.submitted}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-xs text-slate-600">
                                                Waiting
                                            </span>

                                            <span className="text-xs font-semibold text-amber-400">
                                                {stats.pending}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </aside>
                        </section>

                        {/* ========================================================= */}
                        {/* FOOTER                                                      */}
                        {/* ========================================================= */}

                        <footer className="mt-14 flex flex-col gap-2 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-700">
                                Team Work · Public report monitor
                            </p>

                            <p className="text-[11px] text-slate-700">
                                Last synced{" "}
                                {lastUpdated.toLocaleTimeString("en-IN", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    second: "2-digit",
                                    hour12: true,
                                })}
                            </p>
                        </footer>
                    </div>
                )}
            </main>
        </div>
    );
}