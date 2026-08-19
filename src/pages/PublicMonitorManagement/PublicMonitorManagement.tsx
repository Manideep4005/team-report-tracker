import { useState } from "react";

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
} from "react-icons/hi2";

import {
    createMonitorLink,
    getMonitorLinks,
    revokeMonitorLink,
    type ExpirationType,
} from "../../services/publicMonitor";

import { useAuth } from "../../context/AuthContext";


/* =========================================================
   TYPES
========================================================= */

interface PermissionItem {
    id?: string;
    code: string;
    name?: string;
}


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
): "Active" | "Expired" | "Revoked" {

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
    status:
        | "Active"
        | "Expired"
        | "Revoked"
): string {

    if (status === "Active") {

        return `
            bg-emerald-50
            text-emerald-700
            dark:bg-emerald-950/30
            dark:text-emerald-400
        `;
    }

    if (status === "Expired") {

        return `
            bg-amber-50
            text-amber-700
            dark:bg-amber-950/30
            dark:text-amber-400
        `;
    }

    return `
        bg-red-50
        text-red-700
        dark:bg-red-950/30
        dark:text-red-400
    `;
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

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
            ">

                <div className="
                    min-w-0
                ">

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
                            bg-blue-50
                            text-blue-600
                            dark:bg-blue-950/40
                            dark:text-blue-400
                        ">

                            <HiOutlineShieldCheck
                                size={21}
                            />

                        </div>


                        <div className="
                            min-w-0
                        ">

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
                                mt-1
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

                </div>


                {/* =================================================
                    HEADER ACTIONS
                ================================================= */}

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
                            transition
                            hover:bg-slate-50
                            disabled:opacity-50
                            dark:border-zinc-800
                            dark:bg-zinc-900
                            dark:text-zinc-400
                            dark:hover:bg-zinc-800
                        "
                        title="Refresh"
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


                    {/* CREATE PERMISSION */}

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
                                sm:flex-none
                            "
                        >

                            <HiOutlinePlus
                                size={17}
                            />

                            <span className="
                                hidden
                                sm:inline
                            ">
                                Generate Monitor Link
                            </span>

                            <span className="
                                sm:hidden
                            ">
                                Generate
                            </span>

                        </button>

                    )}

                </div>

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="
                rounded-2xl
                border
                border-blue-100
                bg-blue-50
                p-4
                dark:border-blue-950
                dark:bg-blue-950/20
            ">

                <div className="
                    flex
                    gap-3
                ">

                    <HiOutlineLink
                        size={19}
                        className="
                            mt-0.5
                            shrink-0
                            text-blue-600
                            dark:text-blue-400
                        "
                    />


                    <div className="
                        min-w-0
                    ">

                        <p className="
                            text-xs
                            font-semibold
                            text-blue-800
                            dark:text-blue-300
                        ">
                            Public monitoring links
                        </p>


                        <p className="
                            mt-1
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
                        dark:border-emerald-950
                        dark:bg-zinc-950
                    ">

                        <div className="
                            border-b
                            border-emerald-100
                            bg-emerald-50/60
                            px-4
                            py-4
                            sm:px-5
                            dark:border-emerald-950
                            dark:bg-emerald-950/20
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
                                    bg-emerald-100
                                    text-emerald-600
                                    dark:bg-emerald-950/50
                                    dark:text-emerald-400
                                ">

                                    <HiOutlineCheck
                                        size={18}
                                    />

                                </div>


                                <div className="
                                    min-w-0
                                ">

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
                                    min-w-0
                                    flex-1
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    py-3
                                    dark:border-zinc-800
                                    dark:bg-zinc-900
                                ">

                                    <p className="
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
                                        transition
                                        hover:bg-emerald-700
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
                dark:border-zinc-800
                dark:bg-zinc-950
            ">

                {/* Header */}

                <div className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-slate-100
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
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
                            text-[10px]
                            text-slate-400
                            dark:text-zinc-500
                        ">
                            Refreshing...
                        </span>

                    )}

                </div>


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
                                        h-24
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


                                    const statusClasses =
                                        getStatusClasses(
                                            status
                                        );


                                    return (
                                        <div
                                            key={
                                                link.id
                                            }
                                            className="
                                                p-4
                                                sm:p-5
                                            "
                                        >

                                            <div className="
                                                flex
                                                flex-col
                                                gap-4
                                                lg:flex-row
                                                lg:items-center
                                                lg:justify-between
                                            ">

                                                {/* LINK INFO */}

                                                <div className="
                                                    min-w-0
                                                    flex-1
                                                ">

                                                    <div className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-2
                                                    ">

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
                                                                ${statusClasses}
                                                            `}
                                                        >

                                                            <span className="
                                                                h-1.5
                                                                w-1.5
                                                                rounded-full
                                                                bg-current
                                                            " />

                                                            {status}

                                                        </span>


                                                        <span className="
                                                            text-[11px]
                                                            text-slate-400
                                                            dark:text-zinc-500
                                                        ">
                                                            Created by{" "}
                                                            {
                                                                link.createdBy.name
                                                            }
                                                        </span>

                                                    </div>


                                                    <div className="
                                                        mt-2
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-x-4
                                                        gap-y-1
                                                        text-[11px]
                                                        text-slate-500
                                                        dark:text-zinc-500
                                                    ">

                                                        <span className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                        ">

                                                            <HiOutlineClock
                                                                size={14}
                                                            />

                                                            {
                                                                getExpirationText(
                                                                    link.expiresAt
                                                                )
                                                            }

                                                        </span>


                                                        <span>
                                                            Created{" "}
                                                            {
                                                                formatDate(
                                                                    link.createdAt
                                                                )
                                                            }
                                                        </span>

                                                    </div>


                                                    {link.revokedAt && (

                                                        <p className="
                                                            mt-1.5
                                                            text-[10px]
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


                                                {/* =================================================
                                                    REVOKE ACTION
                                                ================================================= */}

                                                {active &&
                                                    canRevokeMonitor && (

                                                        <div className="
                                                            flex
                                                            w-full
                                                            shrink-0
                                                            lg:w-auto
                                                        ">

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

                                                        </div>

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

                    <div
                        className="
                            fixed
                            inset-0
                            z-[100]
                            flex
                            items-center
                            justify-center
                            overflow-y-auto
                            bg-black/60
                            p-4
                            backdrop-blur-sm
                        "
                        onMouseDown={event => {

                            if (
                                event.target ===
                                event.currentTarget &&
                                !createMutation.isPending
                            ) {

                                setShowGenerateModal(
                                    false
                                );
                            }

                        }}
                    >

                        <div
                            className="
                                my-auto
                                w-full
                                max-w-md
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-2xl
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            "
                            onMouseDown={event =>
                                event.stopPropagation()
                            }
                        >

                            <div className="
                                border-b
                                border-slate-100
                                px-5
                                py-4
                                dark:border-zinc-800
                            ">

                                <h2 className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                ">
                                    Generate Monitor Link
                                </h2>


                                <p className="
                                    mt-1
                                    text-[11px]
                                    text-slate-400
                                    dark:text-zinc-500
                                ">
                                    Configure how long this
                                    link should remain active.
                                </p>

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
                                        gap-2
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
                                                            rounded-xl
                                                            border
                                                            px-2
                                                            py-3
                                                            text-[11px]
                                                            font-semibold
                                                            transition
                                                            sm:px-3
                                                            sm:text-xs
                                                            ${selected
                                                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400"
                                                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
                                                focus:ring-2
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
                                            This link will remain active
                                            until it is manually revoked.
                                        </div>

                                    )}

                            </div>


                            <div className="
                                flex
                                flex-col-reverse
                                gap-2
                                border-t
                                border-slate-100
                                px-5
                                py-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-end
                                dark:border-zinc-800
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
                                        transition
                                        hover:bg-blue-700
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

                        </div>

                    </div>

                )}


            {/* =================================================
                REVOKE CONFIRMATION MODAL
            ================================================= */}

            {revokeLinkId &&
                canRevokeMonitor && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-[110]
                            flex
                            items-center
                            justify-center
                            overflow-y-auto
                            bg-black/60
                            p-4
                            backdrop-blur-sm
                        "
                        onMouseDown={event => {

                            if (
                                event.target ===
                                event.currentTarget &&
                                !revokeMutation.isPending
                            ) {

                                setRevokeLinkId(
                                    null
                                );
                            }

                        }}
                    >

                        <div
                            className="
                                my-auto
                                w-full
                                max-w-sm
                                overflow-hidden
                                rounded-2xl
                                border
                                border-slate-200
                                bg-white
                                shadow-2xl
                                dark:border-zinc-800
                                dark:bg-zinc-950
                            "
                            onMouseDown={event =>
                                event.stopPropagation()
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
                                px-5
                                py-4
                                sm:flex-row
                                sm:justify-end
                                dark:border-zinc-800
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
                                        transition
                                        hover:bg-red-700
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

                        </div>

                    </div>

                )}

        </div>
    );
}