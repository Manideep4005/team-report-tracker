import { useEffect, useState, type ReactNode } from "react";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import {
    HiOutlineArrowPath,
    HiOutlineCheck,
    HiOutlineClipboardDocument,
    HiOutlineClock,
    HiOutlineLink,
    HiOutlinePlus,
    HiOutlineShieldCheck,
    HiOutlineTrash,
    HiOutlineExclamationTriangle,
    HiOutlineXMark,
    HiOutlineSignal,
    HiOutlineNoSymbol,
} from "react-icons/hi2";

import {
    createMonitorLink,
    getMonitorLinks,
    revokeMonitorLink,
    type ExpirationType,
} from "../../services/publicMonitor";

import { useAuth } from "../../context/AuthContext";
import PageTitle from "../../components/PageTitle";


/* =========================================================
   TYPES
========================================================= */

interface PermissionItem {
    id?: string;
    code: string;
    name?: string;
}

type LinkStatus = "Active" | "Expired" | "Revoked";


/* =========================================================
   HELPERS
========================================================= */

function formatDate(
    date: string | null
): string {

    if (!date) {
        return "Never";
    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }
    ).format(new Date(date));
}


function isExpired(
    expiresAt: string | null
): boolean {

    if (!expiresAt) {
        return false;
    }

    return (
        new Date(expiresAt).getTime() <=
        Date.now()
    );
}


function getLinkStatus(
    isActive: boolean,
    expiresAt: string | null
): LinkStatus {

    if (!isActive) {
        return "Revoked";
    }

    if (
        expiresAt &&
        new Date(expiresAt).getTime() <=
        Date.now()
    ) {
        return "Expired";
    }

    return "Active";
}


function getExpirationText(
    expiresAt: string | null
): string {

    if (!expiresAt) {
        return "Never expires";
    }

    const expiry =
        new Date(expiresAt).getTime();

    const difference =
        expiry - Date.now();

    if (difference <= 0) {
        return "Expired";
    }

    const totalMinutes =
        Math.floor(
            difference /
            (1000 * 60)
        );

    if (totalMinutes < 60) {
        return `Expires in ${totalMinutes} min`;
    }

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;

    if (hours < 24) {

        if (minutes === 0) {
            return `Expires in ${hours} hr`;
        }

        return `Expires in ${hours}h ${minutes}m`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    return `Expires in ${days} day${days === 1 ? "" : "s"}`;
}


/* =========================================================
   STATUS COLORS
========================================================= */

function getStatusClasses(
    status: LinkStatus
): string {

    if (status === "Active") {

        return `
            bg-emerald-50
            text-emerald-700
            ring-emerald-600/15
            dark:bg-emerald-950/30
            dark:text-emerald-400
            dark:ring-emerald-400/20
        `;
    }

    if (status === "Expired") {

        return `
            bg-amber-50
            text-amber-700
            ring-amber-600/15
            dark:bg-amber-950/30
            dark:text-amber-400
            dark:ring-amber-400/20
        `;
    }

    return `
        bg-red-50
        text-red-700
        ring-red-600/15
        dark:bg-red-950/30
        dark:text-red-400
        dark:ring-red-400/20
    `;
}


/* =========================================================
   SMALL UI PIECES
========================================================= */

function StatusBadge({
    status,
}: {
    status: LinkStatus;
}) {

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                px-2.5
                py-1
                text-[10px]
                font-semibold
                ring-1
                ring-inset
                ${getStatusClasses(status)}
            `}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status}
        </span>
    );
}


function StatCard({
    label,
    value,
    icon,
    tone,
}: {
    label: string;
    value: number;
    icon: ReactNode;
    tone: "blue" | "emerald" | "amber" | "red";
}) {

    const tones = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        red: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400",
    };

    return (
        <div className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-3.5
            shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            dark:border-zinc-800
            dark:bg-zinc-950
            sm:p-4
        ">
            <div className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                sm:h-10
                sm:w-10
                ${tones[tone]}
            `}>
                {icon}
            </div>

            <div className="min-w-0">
                <p className="
                    text-xl
                    font-bold
                    leading-none
                    tabular-nums
                    text-slate-900
                    dark:text-white
                    sm:text-2xl
                ">
                    {value}
                </p>

                <p className="
                    mt-1.5
                    truncate
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-slate-400
                    dark:text-zinc-500
                ">
                    {label}
                </p>
            </div>
        </div>
    );
}


function ModalShell({
    onClose,
    locked,
    maxWidth,
    zIndex,
    children,
}: {
    onClose: () => void;
    locked: boolean;
    maxWidth: string;
    zIndex: string;
    children: ReactNode;
}) {

    useEffect(() => {

        const handleKey = (
            event: KeyboardEvent
        ) => {
            if (
                event.key === "Escape" &&
                !locked
            ) {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKey
        );

        return () =>
            document.removeEventListener(
                "keydown",
                handleKey
            );

    }, [onClose, locked]);

    return (
        <div
            className={`
                fixed
                inset-0
                ${zIndex}
                flex
                items-center
                justify-center
                overflow-y-auto
                bg-slate-900/50
                p-4
                backdrop-blur-sm
                dark:bg-black/70
            `}
            onMouseDown={event => {

                if (
                    event.target ===
                    event.currentTarget &&
                    !locked
                ) {
                    onClose();
                }

            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                className={`
                    my-auto
                    w-full
                    ${maxWidth}
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-2xl
                    dark:border-zinc-800
                    dark:bg-zinc-950
                `}
                onMouseDown={event =>
                    event.stopPropagation()
                }
            >
                {children}
            </div>
        </div>
    );
}


/* =========================================================
   COMPONENT
========================================================= */

export default function PublicMonitorManagement() {

    const queryClient =
        useQueryClient();


    /* =====================================================
       AUTH / PERMISSIONS
    ===================================================== */

    const { user } =
        useAuth();


    /*
     * Your authenticated user is expected to contain:
     *
     * user.role.permissions
     *
     * Each permission contains:
     *
     * {
     *     code: "PUBLIC_MONITOR_CREATE"
     * }
     *
     * The cast keeps this component compatible with
     * your existing AuthContext TypeScript definition.
     */

    const userPermissions =
        (
            user as
            | {
                role?: {
                    permissions?: PermissionItem[];
                };
            }
            | null
            | undefined
        )?.role?.permissions ?? [];


    const hasPermission = (
        code: string
    ): boolean => {

        return userPermissions.some(
            permission =>
                permission.code === code
        );
    };


    const canCreateMonitor =
        hasPermission(
            "PUBLIC_MONITOR_CREATE"
        );


    const canViewMonitor =
        hasPermission(
            "PUBLIC_MONITOR_VIEW"
        );


    const canRevokeMonitor =
        hasPermission(
            "PUBLIC_MONITOR_REVOKE"
        );


    /* =====================================================
       GENERATE MODAL
    ===================================================== */

    const [
        showGenerateModal,
        setShowGenerateModal,
    ] = useState(false);


    /* =====================================================
       REVOKE MODAL
    ===================================================== */

    const [
        revokeLinkId,
        setRevokeLinkId,
    ] = useState<string | null>(null);


    /* =====================================================
       EXPIRATION
    ===================================================== */

    const [
        expirationType,
        setExpirationType,
    ] = useState<ExpirationType>(
        "MINUTES"
    );


    const [
        expirationValue,
        setExpirationValue,
    ] = useState("30");


    /* =====================================================
       GENERATED LINK
    ===================================================== */

    const [
        generatedLink,
        setGeneratedLink,
    ] = useState<string | null>(
        null
    );


    /* =====================================================
       GET LINKS
    ===================================================== */

    const {
        data,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: [
            "public-monitor-links",
        ],
        queryFn:
            getMonitorLinks,
        enabled:
            canViewMonitor ||
            canCreateMonitor ||
            canRevokeMonitor,
    });


    const links =
        data?.data ?? [];


    /* =====================================================
       STATS
    ===================================================== */

    const stats = links.reduce(
        (
            acc,
            link
        ) => {

            const status =
                getLinkStatus(
                    link.isActive,
                    link.expiresAt
                );

            acc[status] += 1;

            return acc;
        },
        {
            Active: 0,
            Expired: 0,
            Revoked: 0,
        } as Record<LinkStatus, number>
    );


    /* =====================================================
       CREATE LINK
    ===================================================== */

    const createMutation =
        useMutation({

            mutationFn:
                createMonitorLink,

            onSuccess: (
                response
            ) => {

                setShowGenerateModal(
                    false
                );

                setGeneratedLink(
                    response.data.url
                );

                setExpirationType(
                    "MINUTES"
                );

                setExpirationValue(
                    "30"
                );

                queryClient.invalidateQueries({
                    queryKey: [
                        "public-monitor-links",
                    ],
                });

                toast.success(
                    response.message ??
                    "Monitoring link created successfully."
                );
            },

            onError: (
                error: any
            ) => {

                toast.error(
                    error?.response?.data?.message ??
                    "Unable to generate monitoring link."
                );
            },
        });


    /* =====================================================
       REVOKE LINK
    ===================================================== */

    const revokeMutation =
        useMutation({

            mutationFn:
                revokeMonitorLink,

            onSuccess: (
                response
            ) => {

                queryClient.invalidateQueries({
                    queryKey: [
                        "public-monitor-links",
                    ],
                });

                setRevokeLinkId(
                    null
                );

                toast.success(
                    response.message ??
                    "Monitoring link revoked."
                );
            },

            onError: (
                error: any
            ) => {

                toast.error(
                    error?.response?.data?.message ??
                    "Unable to revoke monitoring link."
                );
            },
        });


    /* =====================================================
       GENERATE
    ===================================================== */

    function handleGenerate() {

        if (!canCreateMonitor) {

            toast.error(
                "You do not have permission to create monitoring links."
            );

            return;
        }


        if (
            expirationType !==
            "NEVER"
        ) {

            const value =
                Number(
                    expirationValue
                );

            if (
                !Number.isInteger(value) ||
                value <= 0
            ) {

                toast.warning(
                    "Enter a valid expiration value."
                );

                return;
            }

            createMutation.mutate({
                expirationType,
                expirationValue:
                    value,
            });

            return;
        }

        createMutation.mutate({
            expirationType:
                "NEVER",
        });
    }


    /* =====================================================
       COPY
    ===================================================== */

    async function copyLink(
        url: string
    ) {

        try {

            await navigator.clipboard.writeText(
                url
            );

            /*
             * Close generated link section
             * after successful copy.
             */

            setGeneratedLink(
                null
            );

            toast.success(
                "Monitoring link copied successfully."
            );

        } catch {

            toast.error(
                "Unable to copy the link."
            );
        }
    }


    /* =====================================================
       OPEN REVOKE MODAL
    ===================================================== */

    function handleRevoke(
        id: string
    ) {

        if (!canRevokeMonitor) {

            toast.error(
                "You do not have permission to revoke monitoring links."
            );

            return;
        }

        setRevokeLinkId(
            id
        );
    }


    /* =====================================================
       CONFIRM REVOKE
    ===================================================== */

    function confirmRevoke() {

        if (!canRevokeMonitor) {

            toast.error(
                "You do not have permission to revoke monitoring links."
            );

            return;
        }


        if (!revokeLinkId) {
            return;
        }

        revokeMutation.mutate(
            revokeLinkId
        );
    }


    /* =====================================================
       NO VIEW PERMISSION
    ===================================================== */

    if (!canViewMonitor) {

        return (
            <div className="
                mx-auto
                flex
                min-h-[60vh]
                w-full
                max-w-6xl
                items-center
                justify-center
                px-4
                py-8
            ">

                <div className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    text-center
                    shadow-sm
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
                        bg-red-50
                        text-red-600
                        dark:bg-red-950/30
                        dark:text-red-400
                    ">

                        <HiOutlineShieldCheck
                            size={24}
                        />

                    </div>


                    <h1 className="
                        mt-4
                        text-sm
                        font-bold
                        text-slate-900
                        dark:text-white
                    ">
                        Permission required
                    </h1>


                    <p className="
                        mt-2
                        text-xs
                        leading-5
                        text-slate-500
                        dark:text-zinc-500
                    ">
                        You do not have permission to
                        view public monitoring links.
                    </p>

                </div>

            </div>
        );
    }


    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="
            mx-auto
            w-full
            max-w-6xl
            space-y-5
            py-1
            sm:space-y-6
            sm:py-4
        ">

            <PageTitle title="Public Links Monitoring" />

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                flex-col
                gap-4
                border-b
                border-slate-200/80
                pb-5
                dark:border-zinc-800/80
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:pb-6
            ">

                <div className="
                    flex
                    min-w-0
                    items-center
                    gap-3.5
                ">

                    <div className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-600
                        text-white
                        shadow-sm
                        shadow-blue-600/25
                    ">

                        <HiOutlineShieldCheck
                            size={22}
                        />

                    </div>


                    <div className="min-w-0">

                        <h1 className="
                            text-xl
                            font-bold
                            tracking-tight
                            text-slate-900
                            dark:text-white
                            sm:text-2xl
                        ">
                            Public Monitor
                        </h1>


                        <p className="
                            mt-0.5
                            text-xs
                            leading-5
                            text-slate-500
                            dark:text-zinc-500
                        ">
                            Share your team's report
                            status with a secure link.
                        </p>

                    </div>

                </div>


                {/* HEADER ACTIONS */}

                <div className="
                    flex
                    w-full
                    items-center
                    gap-2
                    sm:w-auto
                ">

                    <button
                        type="button"
                        onClick={() =>
                            refetch()
                        }
                        disabled={
                            isFetching
                        }
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            text-slate-500
                            shadow-sm
                            transition
                            hover:bg-slate-50
                            hover:text-slate-700
                            active:scale-[0.97]
                            disabled:opacity-50
                            dark:border-zinc-800
                            dark:bg-zinc-900
                            dark:text-zinc-400
                            dark:hover:bg-zinc-800
                        "
                        title="Refresh"
                        aria-label="Refresh"
                    >

                        <HiOutlineArrowPath
                            size={18}
                            className={
                                isFetching
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                    </button>


                    {canCreateMonitor && (

                        <button
                            type="button"
                            onClick={() =>
                                setShowGenerateModal(
                                    true
                                )
                            }
                            className="
                                inline-flex
                                h-10
                                min-w-0
                                flex-1
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-600
                                px-4
                                text-xs
                                font-semibold
                                text-white
                                shadow-sm
                                shadow-blue-600/20
                                transition
                                hover:bg-blue-700
                                active:scale-[0.97]
                                sm:flex-none
                            "
                        >

                            <HiOutlinePlus
                                size={17}
                            />

                            <span className="hidden sm:inline">
                                Generate Monitor Link
                            </span>

                            <span className="sm:hidden">
                                Generate
                            </span>

                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="
                grid
                grid-cols-2
                gap-3
                lg:grid-cols-4
            ">

                <StatCard
                    label="Total links"
                    value={links.length}
                    tone="blue"
                    icon={<HiOutlineLink size={19} />}
                />

                <StatCard
                    label="Active"
                    value={stats.Active}
                    tone="emerald"
                    icon={<HiOutlineSignal size={19} />}
                />

                <StatCard
                    label="Expired"
                    value={stats.Expired}
                    tone="amber"
                    icon={<HiOutlineClock size={19} />}
                />

                <StatCard
                    label="Revoked"
                    value={stats.Revoked}
                    tone="red"
                    icon={<HiOutlineNoSymbol size={19} />}
                />

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/70
                p-4
                dark:border-blue-950
                dark:bg-blue-950/20
            ">

                <HiOutlineLink
                    size={18}
                    className="
                        mt-0.5
                        shrink-0
                        text-blue-600
                        dark:text-blue-400
                    "
                />

                <div className="min-w-0">

                    <p className="
                        text-xs
                        font-semibold
                        text-blue-800
                        dark:text-blue-300
                    ">
                        Public monitoring links
                    </p>

                    <p className="
                        mt-0.5
                        text-[11px]
                        leading-5
                        text-blue-600
                        dark:text-blue-400
                    ">
                        Generate a link that allows
                        others to view your team's
                        report status without logging in.
                    </p>

                </div>

            </div>


            {/* =================================================
                GENERATED LINK
            ================================================= */}

            {generatedLink &&
                canCreateMonitor && (

                    <section className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-emerald-200
                        bg-white
                        shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                        dark:border-emerald-950
                        dark:bg-zinc-950
                    ">

                        <div className="
                            flex
                            items-center
                            gap-3
                            border-b
                            border-emerald-100
                            bg-emerald-50/60
                            px-4
                            py-3.5
                            sm:px-5
                            dark:border-emerald-950
                            dark:bg-emerald-950/20
                        ">

                            <div className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-100
                                text-emerald-600
                                dark:bg-emerald-950/50
                                dark:text-emerald-400
                            ">

                                <HiOutlineCheck
                                    size={18}
                                />

                            </div>


                            <div className="min-w-0 flex-1">

                                <h2 className="
                                    text-sm
                                    font-bold
                                    text-emerald-800
                                    dark:text-emerald-300
                                ">
                                    Monitor link generated
                                </h2>

                                <p className="
                                    mt-0.5
                                    text-[11px]
                                    text-emerald-600
                                    dark:text-emerald-400
                                ">
                                    Copy this link and share it.
                                </p>

                            </div>

                        </div>


                        <div className="
                            p-4
                            sm:p-5
                        ">

                            <div className="
                                flex
                                flex-col
                                gap-2
                                sm:flex-row
                            ">

                                <div className="
                                    flex
                                    min-w-0
                                    flex-1
                                    items-center
                                    gap-2.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    py-3
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                ">

                                    <HiOutlineLink
                                        size={16}
                                        className="
                                            shrink-0
                                            text-slate-400
                                            dark:text-zinc-500
                                        "
                                    />

                                    <p className="
                                        min-w-0
                                        break-all
                                        text-[11px]
                                        leading-5
                                        text-slate-600
                                        dark:text-zinc-300
                                    ">
                                        {generatedLink}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        copyLink(
                                            generatedLink
                                        )
                                    }
                                    className="
                                        inline-flex
                                        h-11
                                        w-full
                                        shrink-0
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-emerald-600
                                        px-4
                                        text-xs
                                        font-semibold
                                        text-white
                                        shadow-sm
                                        shadow-emerald-600/20
                                        transition
                                        hover:bg-emerald-700
                                        active:scale-[0.97]
                                        sm:w-auto
                                    "
                                >

                                    <HiOutlineClipboardDocument
                                        size={17}
                                    />

                                    Copy Link

                                </button>

                            </div>

                        </div>

                    </section>

                )}


            {/* =================================================
                MONITORING LINKS
            ================================================= */}

            <section className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                dark:border-zinc-800
                dark:bg-zinc-950
            ">

                {/* Header */}

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-b
                    border-slate-100
                    px-4
                    py-4
                    sm:px-5
                    dark:border-zinc-800
                ">

                    <div>

                        <h2 className="
                            text-sm
                            font-bold
                            text-slate-900
                            dark:text-white
                        ">
                            Monitoring Links
                        </h2>

                        <p className="
                            mt-0.5
                            text-[11px]
                            text-slate-400
                            dark:text-zinc-500
                        ">
                            {links.length} link
                            {links.length === 1
                                ? ""
                                : "s"} generated
                        </p>

                    </div>


                    {isFetching && (

                        <span className="
                            inline-flex
                            items-center
                            gap-1.5
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-500
                        ">
                            <HiOutlineArrowPath
                                size={12}
                                className="animate-spin"
                            />
                            Refreshing...
                        </span>

                    )}

                </div>


                {/* Column headings (desktop) */}

                {!isLoading &&
                    links.length > 0 && (

                        <div className="
                            hidden
                            grid-cols-[130px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_110px]
                            items-center
                            gap-4
                            border-b
                            border-slate-100
                            bg-slate-50/70
                            px-5
                            py-2.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-slate-400
                            dark:border-zinc-800
                            dark:bg-zinc-900/50
                            dark:text-zinc-500
                            lg:grid
                        ">
                            <span>Status</span>
                            <span>Created by</span>
                            <span>Created</span>
                            <span>Expiration</span>
                            <span className="text-right">
                                {canRevokeMonitor ? "Action" : ""}
                            </span>
                        </div>

                    )}


                {/* Loading */}

                {isLoading && (

                    <div className="
                        space-y-3
                        p-4
                        sm:p-5
                    ">

                        {[1, 2, 3].map(
                            item => (

                                <div
                                    key={item}
                                    className="
                                        h-20
                                        animate-pulse
                                        rounded-xl
                                        bg-slate-100
                                        dark:bg-zinc-900
                                    "
                                />

                            )
                        )}

                    </div>

                )}


                {/* Empty */}

                {!isLoading &&
                    links.length === 0 && (

                        <div className="
                            px-5
                            py-16
                            text-center
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
                                dark:text-zinc-500
                            ">

                                <HiOutlineLink
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
                                No monitoring links
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
                                Generate a link to share
                                your team's current
                                report status.
                            </p>

                            {canCreateMonitor && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowGenerateModal(
                                            true
                                        )
                                    }
                                    className="
                                        mt-5
                                        inline-flex
                                        h-9
                                        items-center
                                        justify-center
                                        gap-1.5
                                        rounded-xl
                                        bg-blue-600
                                        px-3.5
                                        text-[11px]
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-blue-700
                                        active:scale-[0.97]
                                    "
                                >
                                    <HiOutlinePlus size={15} />
                                    Generate Monitor Link
                                </button>

                            )}

                        </div>

                    )}


                {/* Links */}

                {!isLoading &&
                    links.length > 0 && (

                        <div className="
                            divide-y
                            divide-slate-100
                            dark:divide-zinc-800
                        ">

                            {links.map(
                                link => {

                                    const expired =
                                        isExpired(
                                            link.expiresAt
                                        );


                                    const active =
                                        link.isActive &&
                                        !expired;


                                    const status =
                                        getLinkStatus(
                                            link.isActive,
                                            link.expiresAt
                                        );


                                    return (
                                        <div
                                            key={
                                                link.id
                                            }
                                            className="
                                                p-4
                                                transition-colors
                                                hover:bg-slate-50/60
                                                dark:hover:bg-zinc-900/40
                                                sm:px-5
                                                lg:grid
                                                lg:grid-cols-[130px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_110px]
                                                lg:items-center
                                                lg:gap-4
                                                lg:py-3.5
                                            "
                                        >

                                            {/* STATUS */}

                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                                lg:block
                                            ">

                                                <StatusBadge
                                                    status={status}
                                                />

                                                {/* mobile-only revoke shortcut spacing handled below */}

                                            </div>


                                            {/* CREATED BY */}

                                            <div className="
                                                mt-3
                                                flex
                                                min-w-0
                                                items-center
                                                gap-2.5
                                                lg:mt-0
                                            ">

                                                <div className="
                                                    flex
                                                    h-7
                                                    w-7
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-full
                                                    bg-slate-100
                                                    text-[10px]
                                                    font-bold
                                                    text-slate-500
                                                    dark:bg-zinc-900
                                                    dark:text-zinc-400
                                                ">
                                                    {link.createdBy.name
                                                        ?.trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="
                                                        truncate
                                                        text-xs
                                                        font-semibold
                                                        text-slate-700
                                                        dark:text-zinc-200
                                                    ">
                                                        {link.createdBy.name}
                                                    </p>
                                                    <p className="
                                                        text-[10px]
                                                        text-slate-400
                                                        dark:text-zinc-500
                                                    ">
                                                        Creator
                                                    </p>
                                                </div>

                                            </div>


                                            {/* CREATED */}

                                            <div className="
                                                mt-3
                                                text-[11px]
                                                text-slate-500
                                                dark:text-zinc-500
                                                lg:mt-0
                                            ">
                                                <span className="
                                                    mr-1.5
                                                    text-slate-400
                                                    dark:text-zinc-600
                                                    lg:hidden
                                                ">
                                                    Created
                                                </span>
                                                {formatDate(
                                                    link.createdAt
                                                )}
                                            </div>


                                            {/* EXPIRATION */}

                                            <div className="
                                                mt-1.5
                                                min-w-0
                                                text-[11px]
                                                text-slate-500
                                                dark:text-zinc-500
                                                lg:mt-0
                                            ">

                                                <span className="
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                ">

                                                    <HiOutlineClock
                                                        size={14}
                                                        className="shrink-0"
                                                    />

                                                    {
                                                        getExpirationText(
                                                            link.expiresAt
                                                        )
                                                    }

                                                </span>


                                                {link.revokedAt && (

                                                    <p className="
                                                        mt-1
                                                        text-[10px]
                                                        leading-4
                                                        text-red-500
                                                    ">

                                                        Revoked{" "}
                                                        {
                                                            formatDate(
                                                                link.revokedAt
                                                            )
                                                        }

                                                        {link.revokedBy
                                                            ? ` by ${link.revokedBy.name}`
                                                            : ""}

                                                    </p>

                                                )}

                                            </div>


                                            {/* REVOKE ACTION */}

                                            <div className="
                                                mt-3
                                                flex
                                                lg:mt-0
                                                lg:justify-end
                                            ">

                                                {active &&
                                                    canRevokeMonitor && (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRevoke(
                                                                    link.id
                                                                )
                                                            }
                                                            disabled={
                                                                revokeMutation.isPending
                                                            }
                                                            className="
                                                                inline-flex
                                                                h-9
                                                                w-full
                                                                items-center
                                                                justify-center
                                                                gap-1.5
                                                                rounded-xl
                                                                border
                                                                border-red-200
                                                                bg-white
                                                                px-3
                                                                text-[11px]
                                                                font-semibold
                                                                text-red-600
                                                                transition
                                                                hover:bg-red-50
                                                                active:scale-[0.97]
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-50
                                                                dark:border-red-950
                                                                dark:bg-zinc-950
                                                                dark:text-red-400
                                                                dark:hover:bg-red-950/30
                                                                lg:w-auto
                                                            "
                                                        >

                                                            <HiOutlineTrash
                                                                size={15}
                                                            />

                                                            Revoke

                                                        </button>

                                                    )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

            </section>


            {/* =================================================
                GENERATE MODAL
            ================================================= */}

            {showGenerateModal &&
                canCreateMonitor && (

                    <ModalShell
                        zIndex="z-[100]"
                        maxWidth="max-w-md"
                        locked={createMutation.isPending}
                        onClose={() =>
                            setShowGenerateModal(
                                false
                            )
                        }
                    >

                        <div className="
                            flex
                            items-start
                            justify-between
                            gap-3
                            border-b
                            border-slate-100
                            px-5
                            py-4
                            dark:border-zinc-800
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    h-9
                                    w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                    dark:bg-blue-950/40
                                    dark:text-blue-400
                                ">
                                    <HiOutlineLink size={18} />
                                </div>

                                <div>

                                    <h2 className="
                                        text-sm
                                        font-bold
                                        text-slate-900
                                        dark:text-white
                                    ">
                                        Generate Monitor Link
                                    </h2>

                                    <p className="
                                        mt-0.5
                                        text-[11px]
                                        text-slate-400
                                        dark:text-zinc-500
                                    ">
                                        Configure how long this
                                        link should remain active.
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                disabled={createMutation.isPending}
                                onClick={() =>
                                    setShowGenerateModal(
                                        false
                                    )
                                }
                                aria-label="Close"
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-700
                                    disabled:opacity-50
                                    dark:text-zinc-500
                                    dark:hover:bg-zinc-900
                                    dark:hover:text-zinc-200
                                "
                            >
                                <HiOutlineXMark size={18} />
                            </button>

                        </div>


                        <div className="
                            space-y-5
                            p-5
                        ">

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-[11px]
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                    dark:text-zinc-400
                                ">
                                    Link expiration
                                </label>


                                <div className="
                                    grid
                                    grid-cols-3
                                    gap-1
                                    rounded-xl
                                    bg-slate-100
                                    p-1
                                    dark:bg-zinc-900
                                ">

                                    {(
                                        [
                                            "MINUTES",
                                            "HOURS",
                                            "NEVER",
                                        ] as ExpirationType[]
                                    ).map(
                                        type => {

                                            const selected =
                                                expirationType ===
                                                type;

                                            let label =
                                                "Never";

                                            if (
                                                type ===
                                                "MINUTES"
                                            ) {
                                                label =
                                                    "Minutes";
                                            }

                                            if (
                                                type ===
                                                "HOURS"
                                            ) {
                                                label =
                                                    "Hours";
                                            }

                                            return (
                                                <button
                                                    key={
                                                        type
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        setExpirationType(
                                                            type
                                                        )
                                                    }
                                                    className={`
                                                        rounded-lg
                                                        px-2
                                                        py-2.5
                                                        text-[11px]
                                                        font-semibold
                                                        transition
                                                        sm:text-xs
                                                        ${selected
                                                            ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-500/30 dark:bg-zinc-800 dark:text-blue-400 dark:ring-blue-500/40"
                                                            : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                        }
                                                    `}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                            </div>


                            {expirationType !==
                                "NEVER" && (

                                    <div>

                                        <label className="
                                            mb-2
                                            block
                                            text-[11px]
                                            font-semibold
                                            uppercase
                                            tracking-wide
                                            text-slate-500
                                            dark:text-zinc-400
                                        ">
                                            {expirationType ===
                                                "MINUTES"
                                                ? "Duration in minutes"
                                                : "Duration in hours"}
                                        </label>


                                        <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                expirationValue
                                            }
                                            onChange={event =>
                                                setExpirationValue(
                                                    event.target.value
                                                )
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-slate-200
                                                bg-white
                                                px-3
                                                py-2.5
                                                text-sm
                                                text-slate-900
                                                outline-none
                                                transition
                                                focus:border-blue-500
                                                focus:ring-4
                                                focus:ring-blue-500/10
                                                dark:border-zinc-800
                                                dark:bg-zinc-900
                                                dark:text-white
                                            "
                                            placeholder={
                                                expirationType ===
                                                    "MINUTES"
                                                    ? "30"
                                                    : "2"
                                            }
                                        />

                                    </div>

                                )}


                            {expirationType ===
                                "NEVER" && (

                                    <div className="
                                        flex
                                        items-start
                                        gap-2.5
                                        rounded-xl
                                        border
                                        border-amber-200
                                        bg-amber-50
                                        px-4
                                        py-3
                                        text-[11px]
                                        leading-5
                                        text-amber-700
                                        dark:border-amber-950
                                        dark:bg-amber-950/20
                                        dark:text-amber-400
                                    ">
                                        <HiOutlineExclamationTriangle
                                            size={16}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <span>
                                            This link will remain active
                                            until it is manually revoked.
                                        </span>
                                    </div>

                                )}

                        </div>


                        <div className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-slate-100
                            bg-slate-50/60
                            px-5
                            py-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-end
                            dark:border-zinc-800
                            dark:bg-zinc-900/30
                        ">

                            <button
                                type="button"
                                disabled={
                                    createMutation.isPending
                                }
                                onClick={() =>
                                    setShowGenerateModal(
                                        false
                                    )
                                }
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                    sm:w-auto
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-300
                                    dark:hover:bg-zinc-800
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={
                                    createMutation.isPending
                                }
                                onClick={
                                    handleGenerate
                                }
                                className="
                                    inline-flex
                                    h-10
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-blue-600
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    shadow-blue-600/20
                                    transition
                                    hover:bg-blue-700
                                    active:scale-[0.97]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    sm:w-auto
                                "
                            >

                                <HiOutlinePlus
                                    size={15}
                                />

                                {createMutation.isPending
                                    ? "Generating..."
                                    : "Generate Link"}

                            </button>

                        </div>

                    </ModalShell>

                )}


            {/* =================================================
                REVOKE CONFIRMATION MODAL
            ================================================= */}

            {revokeLinkId &&
                canRevokeMonitor && (

                    <ModalShell
                        zIndex="z-[110]"
                        maxWidth="max-w-sm"
                        locked={revokeMutation.isPending}
                        onClose={() =>
                            setRevokeLinkId(
                                null
                            )
                        }
                    >

                        <div className="
                            flex
                            justify-center
                            px-5
                            pt-6
                        ">

                            <div className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-2xl
                                bg-red-50
                                text-red-600
                                dark:bg-red-950/30
                                dark:text-red-400
                            ">

                                <HiOutlineExclamationTriangle
                                    size={24}
                                />

                            </div>

                        </div>


                        <div className="
                            px-5
                            py-4
                            text-center
                        ">

                            <h2 className="
                                text-sm
                                font-bold
                                text-slate-900
                                dark:text-white
                            ">
                                Revoke monitoring link?
                            </h2>


                            <p className="
                                mx-auto
                                mt-2
                                max-w-xs
                                text-xs
                                leading-5
                                text-slate-500
                                dark:text-zinc-500
                            ">
                                Anyone using this link will
                                immediately lose access to
                                the public monitoring page.
                                This action cannot be undone.
                            </p>

                        </div>


                        <div className="
                            flex
                            flex-col-reverse
                            gap-2
                            border-t
                            border-slate-100
                            bg-slate-50/60
                            px-5
                            py-4
                            sm:flex-row
                            sm:justify-end
                            dark:border-zinc-800
                            dark:bg-zinc-900/30
                        ">

                            <button
                                type="button"
                                disabled={
                                    revokeMutation.isPending
                                }
                                onClick={() =>
                                    setRevokeLinkId(
                                        null
                                    )
                                }
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                    sm:w-auto
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                    dark:text-zinc-300
                                    dark:hover:bg-zinc-800
                                "
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                disabled={
                                    revokeMutation.isPending
                                }
                                onClick={
                                    confirmRevoke
                                }
                                className="
                                    inline-flex
                                    h-10
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-red-600
                                    px-4
                                    text-xs
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    shadow-red-600/20
                                    transition
                                    hover:bg-red-700
                                    active:scale-[0.97]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-60
                                    sm:w-auto
                                "
                            >

                                <HiOutlineTrash
                                    size={15}
                                />

                                {revokeMutation.isPending
                                    ? "Revoking..."
                                    : "Revoke Link"}

                            </button>

                        </div>

                    </ModalShell>

                )}

        </div>
    );
}