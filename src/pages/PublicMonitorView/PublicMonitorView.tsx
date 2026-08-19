import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineExclamationCircle,
    HiOutlineDocumentText,
    HiOutlineArrowPath,
    HiOutlineUsers,
    HiOutlineXCircle,
} from "react-icons/hi2";

import {
    getPublicMonitor,
    type PublicMonitorData,
    type PublicMonitorReport,
} from "../../services/publicMonitor";


/* =========================================================
   HELPERS
========================================================= */

function getToday() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(
    date: string
) {
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }
    ).format(
        new Date(date)
    );
}


function formatReportTime(
    date: string
) {
    return new Intl.DateTimeFormat(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }
    ).format(
        new Date(date)
    );
}


function formatReportDescription(
    description: string
) {
    return description
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);
}


/* =========================================================
   REPORT CARD
========================================================= */

function ReportCard({
    report,
}: {
    report: PublicMonitorReport;
}) {

    const lines =
        formatReportDescription(
            report.description
        );


    return (
        <article
            className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
                dark:border-zinc-800
                dark:bg-zinc-950
            "
        >

            {/* Header */}

            <div className="
                flex
                flex-col
                gap-3
                border-b
                border-slate-100
                px-5
                py-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                dark:border-zinc-800
            ">

                <div className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                ">

                    <div className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                        dark:bg-blue-950/40
                        dark:text-blue-400
                    ">

                        <HiOutlineDocumentText
                            size={20}
                        />

                    </div>


                    <div className="min-w-0">

                        <h3 className="
                            truncate
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                        ">
                            {report.user.name}
                        </h3>


                        <p className="
                            mt-0.5
                            text-[11px]
                            text-slate-400
                            dark:text-zinc-500
                        ">
                            Submitted at{" "}
                            {formatReportTime(
                                report.createdAt
                            )}
                        </p>

                    </div>

                </div>


                <span className="
                    inline-flex
                    w-fit
                    items-center
                    gap-1.5
                    rounded-full
                    bg-emerald-50
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    text-emerald-700
                    dark:bg-emerald-950/30
                    dark:text-emerald-400
                ">

                    <HiOutlineCheckCircle
                        size={13}
                    />

                    Submitted

                </span>

            </div>


            {/* Report */}

            <div className="
                px-5
                py-5
            ">

                <div className="
                    space-y-2
                ">

                    {lines.map(
                        (line, index) => (

                            <p
                                key={`${report.id}-${index}`}
                                className="
                                    text-xs
                                    leading-6
                                    text-slate-600
                                    dark:text-zinc-300
                                "
                            >
                                {line}
                            </p>

                        )
                    )}

                </div>

            </div>


            {/* Footer */}

            <div className="
                border-t
                border-slate-100
                px-5
                py-3
                dark:border-zinc-800
            ">

                <p className="
                    text-[10px]
                    text-slate-400
                    dark:text-zinc-500
                ">
                    Last updated{" "}
                    {formatReportTime(
                        report.updatedAt
                    )}
                </p>

            </div>

        </article>
    );
}


/* =========================================================
   PUBLIC MONITOR
========================================================= */

export default function PublicMonitorView() {

    const {
        token,
    } = useParams<{
        token: string;
    }>();


    /* =====================================================
       DATE
    ===================================================== */

    const [
        selectedDate,
        setSelectedDate,
    ] = useState(
        getToday()
    );


    /* =====================================================
       CURRENT TIME
    ===================================================== */

    const [
        lastUpdated,
        setLastUpdated,
    ] = useState(
        new Date()
    );


    /* =====================================================
       API
    ===================================================== */

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery({

        queryKey: [
            "public-monitor",
            token,
            selectedDate,
        ],

        queryFn: () =>
            getPublicMonitor(
                token!,
                selectedDate
            ),

        enabled: Boolean(token),

        refetchInterval: 30_000,

        retry: false,

    });


    /* =====================================================
       UPDATE LAST REFRESH TIME
    ===================================================== */

    useEffect(() => {

        if (data) {
            setLastUpdated(
                new Date()
            );
        }

    }, [data]);


    /* =====================================================
       DATA
    ===================================================== */

    const monitorData:
        | PublicMonitorData
        | undefined =
        data?.data;


    const reports =
        monitorData?.reports ?? [];


    const teamStatus =
        monitorData?.teamStatus ?? [];


    const stats =
        monitorData?.stats ?? {
            submitted: 0,
            pending: 0,
            totalMembers: 0,
            completion: 0,
        };


    /* =====================================================
       SORT REPORTS
    ===================================================== */

    const sortedReports =
        useMemo(() => {

            return [
                ...reports,
            ].sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ).getTime() -
                    new Date(
                        a.createdAt
                    ).getTime()
            );

        }, [reports]);


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    function getErrorMessage() {

        const axiosError =
            error as any;


        return (
            axiosError?.response?.data?.message ??
            "This monitoring link is invalid, expired, or has been revoked."
        );
    }


    /* =====================================================
       MANUAL REFRESH
    ===================================================== */

    async function handleRefresh() {

        await refetch();

        setLastUpdated(
            new Date()
        );
    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (
        <div className="
            min-h-screen
            bg-slate-50
            text-slate-900
            dark:bg-[#020617]
            dark:text-white
        ">

            {/* =================================================
                TOP BAR
            ================================================= */}

            <header className="
                sticky
                top-0
                z-30
                border-b
                border-slate-200/80
                bg-white/90
                backdrop-blur-xl
                dark:border-zinc-800
                dark:bg-[#020617]/90
            ">

                <div className="
                    mx-auto
                    flex
                    max-w-7xl
                    items-center
                    justify-between
                    gap-4
                    px-4
                    py-3
                    sm:px-6
                    lg:px-8
                ">

                    {/* Brand */}

                    {/* Brand */}

                    <div className="
    flex
    min-w-0
    items-center
    gap-3
">

                        <div className="
        flex
        h-11
        w-11
        shrink-0
        items-center
        justify-center
    ">
                            <img
                                src="/group.png"
                                alt="Team Work"
                                className="
                h-10
                w-10
                object-contain
            "
                            />
                        </div>


                        <div className="
        min-w-0
        leading-none
    ">

                            <h1 className="
            text-sm
            font-bold
            tracking-tight
            text-slate-900
            dark:text-white
            sm:text-base
        ">
                                Team Work
                            </h1>

                            <p className="
            mt-1
            text-[9px]
            font-medium
            tracking-wide
            text-slate-400
            dark:text-zinc-500
        ">
                                Public Report Monitor
                            </p>

                        </div>

                    </div>

                    {/* Live indicator */}

                    {!isError && !isLoading && (
                        <div
                            className="
            flex
            shrink-0
            items-center
            gap-2
            rounded-full
            border
            border-emerald-200
            bg-emerald-50
            px-2.5
            py-1.5
            dark:border-emerald-950
            dark:bg-emerald-950/20
        "
                        >
                            <span
                                className="
                relative
                flex
                h-2
                w-2
            "
                            >
                                <span
                                    className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-emerald-400
                    opacity-75
                "
                                />

                                <span
                                    className="
                    relative
                    inline-flex
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-500
                "
                                />
                            </span>

                            <span
                                className="
                hidden
                text-[10px]
                font-semibold
                text-emerald-700
                sm:inline
                dark:text-emerald-400
            "
                            >
                                Live
                            </span>
                        </div>
                    )}

                </div>

            </header>


            {/* =================================================
                CONTENT
            ================================================= */}

            <main className="
                mx-auto
                max-w-7xl
                px-4
                py-6
                sm:px-6
                sm:py-8
                lg:px-8
            ">

                {/* =================================================
                    ERROR / INVALID LINK
                ================================================= */}

                {isError && (

                    <div className="
                        flex
                        min-h-[70vh]
                        items-center
                        justify-center
                    ">

                        <div className="
                            w-full
                            max-w-md
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-8
                            text-center
                            shadow-sm
                            dark:border-zinc-800
                            dark:bg-zinc-950
                        ">

                            <div className="
                                mx-auto
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-red-50
                                text-red-500
                                dark:bg-red-950/30
                                dark:text-red-400
                            ">

                                <HiOutlineXCircle
                                    size={28}
                                />

                            </div>


                            <h2 className="
                                mt-5
                                text-base
                                font-bold
                                text-slate-900
                                dark:text-white
                            ">
                                Monitoring link unavailable
                            </h2>


                            <p className="
                                mt-2
                                text-xs
                                leading-5
                                text-slate-500
                                dark:text-zinc-500
                            ">
                                {getErrorMessage()}
                            </p>

                        </div>

                    </div>

                )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {isLoading && (

                    <div className="
                        space-y-6
                    ">

                        {/* Header skeleton */}

                        <div className="
                            h-28
                            animate-pulse
                            rounded-2xl
                            bg-slate-200
                            dark:bg-zinc-900
                        " />


                        {/* Stats skeleton */}

                        <div className="
                            grid
                            grid-cols-2
                            gap-3
                            lg:grid-cols-4
                        ">

                            {[1, 2, 3, 4].map(
                                item => (

                                    <div
                                        key={item}
                                        className="
                                            h-28
                                            animate-pulse
                                            rounded-2xl
                                            bg-slate-200
                                            dark:bg-zinc-900
                                        "
                                    />

                                )
                            )}

                        </div>


                        {/* Reports skeleton */}

                        <div className="
                            space-y-3
                        ">

                            {[1, 2, 3].map(
                                item => (

                                    <div
                                        key={item}
                                        className="
                                            h-40
                                            animate-pulse
                                            rounded-2xl
                                            bg-slate-200
                                            dark:bg-zinc-900
                                        "
                                    />

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    DATA
                ================================================= */}

                {!isLoading &&
                    !isError &&
                    monitorData && (

                        <div className="
                        space-y-6
                    ">

                            {/* =================================================
                            PAGE TITLE
                        ================================================= */}

                            <section className="
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            p-5
                            shadow-sm
                            dark:border-zinc-800
                            dark:bg-zinc-950
                            sm:p-6
                        ">

                                <div className="
                                flex
                                flex-col
                                gap-5
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                            ">

                                    {/* Title */}

                                    <div>

                                        <div className="
                                        flex
                                        items-center
                                        gap-2
                                    ">

                                            <span className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            bg-blue-50
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-semibold
                                            text-blue-700
                                            dark:bg-blue-950/30
                                            dark:text-blue-400
                                        ">

                                                <HiOutlineUsers
                                                    size={13}
                                                />

                                                Team Status

                                            </span>

                                        </div>


                                        <h2 className="
                                        mt-3
                                        text-xl
                                        font-bold
                                        tracking-tight
                                        text-slate-900
                                        dark:text-white
                                        sm:text-2xl
                                    ">
                                            Daily Team Reports
                                        </h2>


                                        <p className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                        dark:text-zinc-500
                                    ">
                                            {formatDate(
                                                selectedDate
                                            )}
                                        </p>

                                    </div>


                                    {/* Date + refresh */}

                                    <div className="
                                    flex
                                    flex-col
                                    gap-2
                                    sm:flex-row
                                    sm:items-center
                                ">

                                        <div className="
                                        flex
                                        h-10
                                        items-center
                                        gap-2
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-3
                                        dark:border-zinc-800
                                        dark:bg-zinc-900
                                    ">

                                            <HiOutlineCalendarDays
                                                size={17}
                                                className="
                                                shrink-0
                                                text-slate-400
                                                dark:text-zinc-500
                                            "
                                            />


                                            <input
                                                type="date"
                                                value={
                                                    selectedDate
                                                }
                                                onChange={event =>
                                                    setSelectedDate(
                                                        event.target.value
                                                    )
                                                }
                                                className="
                                                min-w-0
                                                border-0
                                                bg-transparent
                                                text-xs
                                                font-medium
                                                text-slate-700
                                                outline-none
                                                dark:text-zinc-200
                                            "
                                            />

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                handleRefresh
                                            }
                                            disabled={
                                                isFetching
                                            }
                                            className="
                                            flex
                                            h-10
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-3
                                            text-xs
                                            font-semibold
                                            text-slate-600
                                            transition
                                            hover:bg-slate-50
                                            disabled:opacity-50
                                            dark:border-zinc-800
                                            dark:bg-zinc-900
                                            dark:text-zinc-300
                                            dark:hover:bg-zinc-800
                                        "
                                        >

                                            <HiOutlineArrowPath
                                                size={16}
                                                className={
                                                    isFetching
                                                        ? "animate-spin"
                                                        : ""
                                                }
                                            />

                                            Refresh

                                        </button>

                                    </div>

                                </div>

                            </section>


                            {/* =================================================
                            STATS
                        ================================================= */}

                            <section className="
                            grid
                            grid-cols-2
                            gap-3
                            lg:grid-cols-4
                        ">

                                {/* Submitted */}

                                <div className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                shadow-sm
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            ">

                                    <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                ">

                                        <div>

                                            <p className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                            dark:text-zinc-500
                                        ">
                                                Submitted
                                            </p>


                                            <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                            text-slate-900
                                            dark:text-white
                                        ">
                                                {
                                                    stats.submitted
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-emerald-50
                                        text-emerald-600
                                        dark:bg-emerald-950/30
                                        dark:text-emerald-400
                                    ">

                                            <HiOutlineCheckCircle
                                                size={21}
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* Pending */}

                                <div className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                shadow-sm
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            ">

                                    <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                ">

                                        <div>

                                            <p className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                            dark:text-zinc-500
                                        ">
                                                Pending
                                            </p>


                                            <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                            text-slate-900
                                            dark:text-white
                                        ">
                                                {
                                                    stats.pending
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-amber-50
                                        text-amber-600
                                        dark:bg-amber-950/30
                                        dark:text-amber-400
                                    ">

                                            <HiOutlineClock
                                                size={21}
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* Total */}

                                <div className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                shadow-sm
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            ">

                                    <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                ">

                                        <div>

                                            <p className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                            dark:text-zinc-500
                                        ">
                                                Team Members
                                            </p>


                                            <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                            text-slate-900
                                            dark:text-white
                                        ">
                                                {
                                                    stats.totalMembers
                                                }
                                            </p>

                                        </div>


                                        <div className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-50
                                        text-blue-600
                                        dark:bg-blue-950/30
                                        dark:text-blue-400
                                    ">

                                            <HiOutlineUsers
                                                size={21}
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* Completion */}

                                <div className="
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                p-4
                                shadow-sm
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            ">

                                    <div className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                ">

                                        <div>

                                            <p className="
                                            text-[10px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                            dark:text-zinc-500
                                        ">
                                                Completion
                                            </p>


                                            <p className="
                                            mt-2
                                            text-2xl
                                            font-bold
                                            text-slate-900
                                            dark:text-white
                                        ">
                                                {
                                                    stats.completion
                                                }%
                                            </p>

                                        </div>


                                        <div className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-violet-50
                                        text-violet-600
                                        dark:bg-violet-950/30
                                        dark:text-violet-400
                                    ">

                                            <HiOutlineCheckCircle
                                                size={21}
                                            />

                                        </div>

                                    </div>


                                    {/* Progress */}

                                    <div className="
                                    mt-3
                                    h-1.5
                                    overflow-hidden
                                    rounded-full
                                    bg-slate-100
                                    dark:bg-zinc-800
                                ">

                                        <div
                                            className="
                                            h-full
                                            rounded-full
                                            bg-violet-500
                                            transition-all
                                            duration-700
                                        "
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(
                                                        stats.completion,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                </div>

                            </section>


                            {/* =================================================
                            TEAM STATUS
                        ================================================= */}

                            <section>

                                <div className="
                                mb-3
                                flex
                                items-center
                                justify-between
                                gap-3
                            ">

                                    <div>

                                        <h2 className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                        dark:text-white
                                    ">
                                            Team Status
                                        </h2>


                                        <p className="
                                        mt-0.5
                                        text-[10px]
                                        text-slate-400
                                        dark:text-zinc-500
                                    ">
                                            Submission status for the
                                            selected date
                                        </p>

                                    </div>

                                </div>


                                {teamStatus.length > 0 ? (

                                    <div className="
                                    grid
                                    gap-3
                                    sm:grid-cols-2
                                    lg:grid-cols-4
                                ">

                                        {teamStatus.map(
                                            member => (

                                                <div
                                                    key={
                                                        member.id
                                                    }
                                                    className="
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    p-4
                                                    shadow-sm
                                                    dark:border-zinc-800
                                                    dark:bg-zinc-950
                                                "
                                                >

                                                    <div className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                ">

                                                        <div className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        bg-slate-100
                                                        text-xs
                                                        font-bold
                                                        text-slate-600
                                                        dark:bg-zinc-900
                                                        dark:text-zinc-300
                                                    ">

                                                            {member.name
                                                                .trim()
                                                                .split(
                                                                    /\s+/
                                                                )
                                                                .slice(
                                                                    0,
                                                                    2
                                                                )
                                                                .map(
                                                                    part =>
                                                                        part[0]
                                                                )
                                                                .join("")
                                                                .toUpperCase()}

                                                        </div>


                                                        <div className="
                                                        min-w-0
                                                        flex-1
                                                    ">

                                                            <p className="
                                                            truncate
                                                            text-xs
                                                            font-semibold
                                                            text-slate-800
                                                            dark:text-zinc-200
                                                        ">
                                                                {
                                                                    member.name
                                                                }
                                                            </p>


                                                            {member.submitted ? (

                                                                <p className="
                                                                mt-1
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-[10px]
                                                                font-medium
                                                                text-emerald-600
                                                                dark:text-emerald-400
                                                            ">

                                                                    <HiOutlineCheckCircle
                                                                        size={12}
                                                                    />

                                                                    Submitted

                                                                </p>

                                                            ) : (

                                                                <p className="
                                                                mt-1
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-[10px]
                                                                font-medium
                                                                text-amber-600
                                                                dark:text-amber-400
                                                            ">

                                                                    <HiOutlineExclamationCircle
                                                                        size={12}
                                                                    />

                                                                    Pending

                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-5
                                    py-8
                                    text-center
                                    dark:border-zinc-800
                                    dark:bg-zinc-950
                                ">

                                        <HiOutlineUsers
                                            size={24}
                                            className="
                                            mx-auto
                                            text-slate-300
                                            dark:text-zinc-700
                                        "
                                        />


                                        <p className="
                                        mt-2
                                        text-xs
                                        text-slate-400
                                        dark:text-zinc-500
                                    ">
                                            No team status available.
                                        </p>

                                    </div>

                                )}

                            </section>


                            {/* =================================================
                            REPORTS
                        ================================================= */}

                            <section>

                                <div className="
                                mb-3
                                flex
                                items-end
                                justify-between
                                gap-3
                            ">

                                    <div>

                                        <h2 className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                        dark:text-white
                                    ">
                                            Submitted Reports
                                        </h2>


                                        <p className="
                                        mt-0.5
                                        text-[10px]
                                        text-slate-400
                                        dark:text-zinc-500
                                    ">
                                            {reports.length} report
                                            {reports.length === 1
                                                ? ""
                                                : "s"} submitted
                                        </p>

                                    </div>


                                    <span className="
                                    text-[10px]
                                    text-slate-400
                                    dark:text-zinc-500
                                ">
                                        Auto-refreshes every 30 sec
                                    </span>

                                </div>


                                {sortedReports.length > 0 ? (

                                    <div className="
                                    space-y-3
                                ">

                                        {sortedReports.map(
                                            report => (

                                                <ReportCard
                                                    key={
                                                        report.id
                                                    }
                                                    report={
                                                        report
                                                    }
                                                />

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-5
                                    py-14
                                    text-center
                                    dark:border-zinc-800
                                    dark:bg-zinc-950
                                ">

                                        <div className="
                                        mx-auto
                                        flex
                                        h-12
                                        w-12
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-slate-100
                                        text-slate-400
                                        dark:bg-zinc-900
                                        dark:text-zinc-600
                                    ">

                                            <HiOutlineDocumentText
                                                size={23}
                                            />

                                        </div>


                                        <h3 className="
                                        mt-4
                                        text-sm
                                        font-semibold
                                        text-slate-800
                                        dark:text-zinc-200
                                    ">
                                            No reports submitted
                                        </h3>


                                        <p className="
                                        mx-auto
                                        mt-1
                                        max-w-sm
                                        text-xs
                                        leading-5
                                        text-slate-400
                                        dark:text-zinc-500
                                    ">
                                            No team member has submitted
                                            a report for the selected date.
                                        </p>

                                    </div>

                                )}

                            </section>


                            {/* =================================================
                            FOOTER
                        ================================================= */}

                            <footer className="
                            border-t
                            border-slate-200
                            pt-5
                            dark:border-zinc-800
                        ">

                                <div className="
                                flex
                                flex-col
                                gap-2
                                text-center
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:text-left
                            ">

                                    <p className="
                                    text-[10px]
                                    text-slate-400
                                    dark:text-zinc-600
                                ">
                                        Team Work · Public Report Monitor
                                    </p>


                                    <p className="
                                    text-[10px]
                                    text-slate-400
                                    dark:text-zinc-600
                                ">
                                        Last updated{" "}
                                        {lastUpdated.toLocaleTimeString(
                                            "en-IN",
                                            {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: true,
                                            }
                                        )}
                                    </p>

                                </div>

                            </footer>

                        </div>

                    )}

            </main>

        </div>
    );
}