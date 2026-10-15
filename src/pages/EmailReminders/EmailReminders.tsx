
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    HiOutlineArrowPath,
    HiOutlineCalendarDays,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineEnvelope,
    HiOutlineExclamationTriangle,
    HiOutlinePaperAirplane,
    HiOutlineQueueList,
    HiOutlineUsers,
    HiOutlineXMark,
    HiOutlineNoSymbol,
} from "react-icons/hi2";
import { toast } from "sonner";

import PageTitle from "../../components/PageTitle";
import {
    cancelEmailReminder,
    deliverEmailReminder,
    getEmailReminderJobs,
    getPendingReminderUsers,
    queueEmailReminder,
    skipEmailReminder,
    type EmailReminderJob,
    type EmailReminderJobStatus,
} from "../../services/emailReminder";

/* =========================================================
   CONFIGURATION
========================================================= */

const AUTOMATIC_REMINDER_SLOTS = ["12:00", "16:00", "20:00"];
const SLOT_LABELS = ["Morning", "Afternoon", "Evening"];

type ModalMode = "queue" | "deliver" | "cancel" | "skip" | null;
type TabKey = "jobs" | "users" | "schedule";

/* =========================================================
   HELPERS
========================================================= */

function getCurrentTime(): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date());

    const hour = parts.find((part) => part.type === "hour")?.value ?? "09";
    const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

    return `${hour}:${minute}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
    const apiError = error as {
        response?: { data?: { message?: string } };
        message?: string;
    };

    return apiError?.response?.data?.message || apiError?.message || fallback;
}

function formatSlot(value: string): string {
    const [hourString, minute] = value.split(":");
    const hour = Number(hourString);

    if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
        return value;
    }

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute || "00"} ${suffix}`;
}

function formatDate(value: string | null | undefined): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
    }).format(date);
}

function initials(name: string): string {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "?"
    );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }: { status: EmailReminderJobStatus }) {
    const styles: Record<EmailReminderJobStatus, string> = {
        PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        COMPLETED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        SKIPPED: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
        CANCELLED: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        FAILED: "bg-red-500/10 text-red-600 dark:text-red-400",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {status.toLowerCase()}
        </span>
    );
}

/* =========================================================
   STAT CARD
========================================================= */

function Stat({
    label,
    value,
    hint,
    icon,
    tone,
}: {
    label: string;
    value: number | string;
    hint: string;
    icon: ReactNode;
    tone: string;
}) {
    return (
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6">
            <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text-muted)]">
                    {label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {value}
                </p>
                <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                    {hint}
                </p>
            </div>

            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
            >
                {icon}
            </div>
        </div>
    );
}

/* =========================================================
   EMPTY AND LOADING STATES
========================================================= */

function EmptyState({
    title,
    description,
    icon,
}: {
    title: string;
    description: string;
    icon?: ReactNode;
}) {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--border)]/30 text-[var(--text-muted)]">
                {icon ?? <HiOutlineEnvelope size={24} />}
            </div>

            <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                {title}
            </h3>

            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
                {description}
            </p>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center gap-3 px-4 py-16 text-sm text-[var(--text-muted)]">
            <HiOutlineArrowPath
                className="animate-spin text-indigo-500"
                size={19}
            />
            Loading reminder data...
        </div>
    );
}

/* =========================================================
   CONFIRMATION MODAL
========================================================= */

function ConfirmationModal({
    mode,
    selectedTime,
    job,
    isLoading,
    onClose,
    onConfirm,
}: {
    mode: ModalMode;
    selectedTime: string;
    job: EmailReminderJob | null;
    isLoading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    useEffect(() => {
        if (!mode) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape" && !isLoading) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [mode, isLoading, onClose]);

    if (!mode) return null;

    const isQueue = mode === "queue";
    const isDelivery = mode === "deliver";
    const isCancel = mode === "cancel";
    const isSkip = mode === "skip";

    const title = isQueue
        ? "Queue reminder job"
        : isDelivery
            ? "Confirm email delivery"
            : isCancel
                ? "Cancel reminder job"
                : "Skip reminder job";

    const description = isQueue
        ? "Review the selected time before creating a reminder job."
        : isDelivery
            ? "Review the job details before sending emails."
            : isCancel
                ? "This will cancel the pending job so it cannot be delivered."
                : "This will mark the pending job as skipped without sending emails.";

    const actionLabel = isQueue
        ? "Confirm & Queue"
        : isDelivery
            ? "Confirm & Send"
            : isCancel
                ? "Confirm Cancellation"
                : "Confirm Skip";

    const loadingLabel = isQueue
        ? "Queuing..."
        : isDelivery
            ? "Sending..."
            : isCancel
                ? "Cancelling..."
                : "Skipping...";

    const actionStyle = isDelivery
        ? "bg-emerald-600 hover:bg-emerald-500"
        : isCancel
            ? "bg-red-600 hover:bg-red-500"
            : isSkip
                ? "bg-amber-600 hover:bg-amber-500"
                : "bg-indigo-600 hover:bg-indigo-500";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isLoading) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reminder-modal-title"
                className="w-full max-w-md overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-3xl"
            >
                <div className="flex items-start gap-4 px-6 pt-6">
                    <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDelivery
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isCancel
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : isSkip
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            }`}
                    >
                        {isDelivery ? (
                            <HiOutlinePaperAirplane size={24} />
                        ) : isCancel ? (
                            <HiOutlineXMark size={24} />
                        ) : isSkip ? (
                            <HiOutlineNoSymbol size={24} />
                        ) : (
                            <HiOutlineQueueList size={24} />
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2
                            id="reminder-modal-title"
                            className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
                        >
                            {title}
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        aria-label="Close modal"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--border)]/40 hover:text-[var(--text-primary)] disabled:opacity-50"
                    >
                        <HiOutlineXMark size={18} />
                    </button>
                </div>

                <div className="space-y-3 px-6 py-5">
                    {isQueue ? (
                        <>
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-4">
                                <div>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Selected time
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                                        {formatSlot(selectedTime)} IST
                                    </p>
                                </div>

                                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                    Manual
                                </span>
                            </div>

                            <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 p-3.5">
                                <HiOutlineExclamationTriangle
                                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                                    size={17}
                                />
                                <p className="text-xs leading-5 text-[var(--text-primary)]">
                                    This creates a reminder job. Check your backend
                                    queueing behavior before using this for real email
                                    delivery.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <dl className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] px-4">
                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-[var(--text-muted)]">
                                        Job date
                                    </dt>
                                    <dd className="text-sm font-semibold text-[var(--text-primary)]">
                                        {formatDate(job?.jobDate)}
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-[var(--text-muted)]">
                                        Scheduled time
                                    </dt>
                                    <dd className="text-sm font-semibold text-[var(--text-primary)]">
                                        {job ? formatSlot(job.slotTime) : "—"} IST
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-[var(--text-muted)]">
                                        Recipients
                                    </dt>
                                    <dd className="text-base font-semibold text-[var(--text-primary)]">
                                        {job?.recipientCount ?? 0}
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <dt className="text-xs text-[var(--text-muted)]">
                                        Action
                                    </dt>
                                    <dd className="text-sm font-semibold text-[var(--text-primary)]">
                                        {isDelivery
                                            ? "Send emails"
                                            : isCancel
                                                ? "Cancel job"
                                                : "Skip job"}
                                    </dd>
                                </div>
                            </dl>

                            <div
                                className={`flex items-start gap-2.5 rounded-xl p-3.5 ${isDelivery
                                        ? "bg-red-500/5 ring-1 ring-red-500/20"
                                        : "bg-amber-500/10"
                                    }`}
                            >
                                <HiOutlineExclamationTriangle
                                    className={`mt-0.5 shrink-0 ${isDelivery ? "text-red-500" : "text-amber-600"
                                        }`}
                                    size={18}
                                />
                                <p className="text-xs leading-5 text-[var(--text-primary)]">
                                    {isDelivery
                                        ? "This sends real emails. Delivery cannot be recalled once accepted by the email provider."
                                        : isCancel
                                            ? "Only pending jobs can be cancelled. This action does not recall emails already sent."
                                            : "Only pending jobs can be skipped. No emails will be sent by this action."}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] px-6 py-4 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--border)]/30 disabled:opacity-50"
                    >
                        Keep Job
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading || (!isQueue && !job)}
                        className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${actionStyle}`}
                    >
                        {isLoading ? (
                            <HiOutlineArrowPath
                                size={16}
                                className="animate-spin"
                            />
                        ) : isDelivery ? (
                            <HiOutlineEnvelope size={16} />
                        ) : isCancel ? (
                            <HiOutlineXMark size={16} />
                        ) : isSkip ? (
                            <HiOutlineNoSymbol size={16} />
                        ) : (
                            <HiOutlineQueueList size={16} />
                        )}

                        {isLoading ? loadingLabel : actionLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function EmailReminders() {
    const queryClient = useQueryClient();

    const [selectedSlot, setSelectedSlot] = useState<string>(getCurrentTime);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedJob, setSelectedJob] = useState<EmailReminderJob | null>(null);
    const [tab, setTab] = useState<TabKey>("jobs");

    const pendingQuery = useQuery({
        queryKey: ["email-reminders", "pending"],
        queryFn: getPendingReminderUsers,
        refetchInterval: 30_000,
    });

    const jobsQuery = useQuery({
        queryKey: ["email-reminders", "jobs"],
        queryFn: () => getEmailReminderJobs(50),
        refetchInterval: 15_000,
    });

    const pendingUsers = pendingQuery.data?.data ?? [];
    const jobs = jobsQuery.data?.data ?? [];

    const refreshReminderData = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ["email-reminders", "pending"],
            }),
            queryClient.invalidateQueries({
                queryKey: ["email-reminders", "jobs"],
            }),
        ]);
    }, [queryClient]);

    /* -------------------- Queue mutation -------------------- */

    const queueMutation = useMutation({
        mutationFn: queueEmailReminder,

        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(response.message || "Unable to queue reminder.");
                return;
            }

            const result = response.data;

            if (result?.alreadyQueued) {
                toast.info("A reminder job already exists for this date and time.");
            } else if (result?.job?.status === "SKIPPED") {
                toast.info("No pending recipients. The job was skipped.");
            } else {
                toast.success(
                    `Reminder queued for ${result?.pendingCount ?? result?.job?.recipientCount ?? 0
                    } recipient(s).`,
                );
            }

            setModalMode(null);
            setSelectedJob(null);
            await refreshReminderData();
        },

        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to queue reminder."));
        },
    });

    /* -------------------- Deliver mutation -------------------- */

    const deliverMutation = useMutation({
        mutationFn: deliverEmailReminder,

        onSuccess: async (response) => {
            const result = response.data;

            if (!response.success) {
                toast.error(response.message || "Email delivery failed.");
                await refreshReminderData();
                return;
            }

            if (result?.skipped) {
                toast.info(result.reason || "Delivery was skipped.");
            } else if (result?.status === "COMPLETED") {
                toast.success(`Brevo accepted ${result.sent ?? 0} email(s).`);
            } else if (result?.status === "FAILED") {
                toast.error(
                    `Delivery failed or was incomplete. ${result.sent ?? 0
                    } accepted, ${result.failed ?? 0} failed.`,
                );
            } else {
                toast.success(
                    result?.message ||
                    "Delivery request finished. Check the job status.",
                );
            }

            setModalMode(null);
            setSelectedJob(null);
            await refreshReminderData();
        },

        onError: async (error) => {
            toast.error(getErrorMessage(error, "Failed to deliver reminder."));
            await refreshReminderData();
        },
    });

    /* -------------------- Cancel mutation -------------------- */

    const cancelMutation = useMutation({
        mutationFn: cancelEmailReminder,

        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(response.message || "Failed to cancel reminder job.");
                await refreshReminderData();
                return;
            }

            const result = response.data;

            if (result?.updated) {
                toast.success(result.message || "Reminder job cancelled.");
            } else {
                toast.info(
                    result?.message ||
                    "The job was not cancelled. It may no longer be pending.",
                );
            }

            setModalMode(null);
            setSelectedJob(null);
            await refreshReminderData();
        },

        onError: async (error) => {
            toast.error(getErrorMessage(error, "Failed to cancel reminder job."));
            await refreshReminderData();
        },
    });

    /* -------------------- Skip mutation -------------------- */

    const skipMutation = useMutation({
        mutationFn: skipEmailReminder,

        onSuccess: async (response) => {
            if (!response.success) {
                toast.error(response.message || "Failed to skip reminder job.");
                await refreshReminderData();
                return;
            }

            const result = response.data;

            if (result?.updated) {
                toast.success(result.message || "Reminder job skipped.");
            } else {
                toast.info(
                    result?.message ||
                    "The job was not skipped. It may no longer be pending.",
                );
            }

            setModalMode(null);
            setSelectedJob(null);
            await refreshReminderData();
        },

        onError: async (error) => {
            toast.error(getErrorMessage(error, "Failed to skip reminder job."));
            await refreshReminderData();
        },
    });

    /* -------------------- Modal handlers -------------------- */

    function openQueueModal() {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(selectedSlot)) {
            toast.error("Please select a valid time.");
            return;
        }

        setSelectedJob(null);
        setModalMode("queue");
    }

    function openDeliveryModal(job: EmailReminderJob) {
        if (job.status !== "PENDING") {
            toast.warning("Only pending jobs can be delivered.");
            return;
        }

        if (job.recipientCount <= 0) {
            toast.info("This job has no recipients.");
            return;
        }

        setSelectedJob(job);
        setModalMode("deliver");
    }

    function openJobActionModal(
        job: EmailReminderJob,
        action: "cancel" | "skip",
    ) {
        if (job.status !== "PENDING") {
            toast.warning("Only pending jobs can be changed.");
            return;
        }

        setSelectedJob(job);
        setModalMode(action);
    }

    function confirmModalAction() {
        if (modalMode === "queue") {
            queueMutation.mutate(selectedSlot);
            return;
        }

        if (!selectedJob) return;

        if (modalMode === "deliver") {
            deliverMutation.mutate(selectedJob.id);
        } else if (modalMode === "cancel") {
            cancelMutation.mutate(selectedJob.id);
        } else if (modalMode === "skip") {
            skipMutation.mutate(selectedJob.id);
        }
    }

    const isMutating =
        queueMutation.isPending ||
        deliverMutation.isPending ||
        cancelMutation.isPending ||
        skipMutation.isPending;

    const closeModal = useCallback(() => {
        if (isMutating) return;

        setModalMode(null);
        setSelectedJob(null);
    }, [isMutating]);

    /* -------------------- Statistics -------------------- */

    const completedCount = jobs.filter(
        (job) => job.status === "COMPLETED",
    ).length;

    const failedCount = jobs.filter(
        (job) => job.status === "FAILED",
    ).length;

    const pendingJobCount = jobs.filter(
        (job) => job.status === "PENDING",
    ).length;

    const hasError = pendingQuery.isError || jobsQuery.isError;
    const isRefreshing = pendingQuery.isFetching || jobsQuery.isFetching;

    /* -------------------- Job action buttons -------------------- */

    function renderJobActions(job: EmailReminderJob) {
        const rowIsDelivering =
            deliverMutation.isPending &&
            deliverMutation.variables === job.id;

        const rowIsCancelling =
            cancelMutation.isPending &&
            cancelMutation.variables === job.id;

        const rowIsSkipping =
            skipMutation.isPending &&
            skipMutation.variables === job.id;

        const rowIsBusy =
            isMutating ||
            rowIsDelivering ||
            rowIsCancelling ||
            rowIsSkipping;

        if (job.status !== "PENDING") {
            return (
                <span className="text-xs text-[var(--text-muted)]">—</span>
            );
        }

        return (
            <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => openDeliveryModal(job)}
                    disabled={rowIsBusy || job.recipientCount <= 0}
                    title="Deliver reminder emails"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {rowIsDelivering ? (
                        <HiOutlineArrowPath
                            size={14}
                            className="animate-spin"
                        />
                    ) : (
                        <HiOutlinePaperAirplane size={14} />
                    )}
                    {rowIsDelivering ? "Sending..." : "Deliver"}
                </button>

                <button
                    type="button"
                    onClick={() => openJobActionModal(job, "skip")}
                    disabled={rowIsBusy}
                    title="Skip this reminder job"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-medium text-amber-700 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-amber-400"
                >
                    {rowIsSkipping ? (
                        <HiOutlineArrowPath
                            size={14}
                            className="animate-spin"
                        />
                    ) : (
                        <HiOutlineNoSymbol size={14} />
                    )}
                    {rowIsSkipping ? "Skipping..." : "Skip"}
                </button>

                <button
                    type="button"
                    onClick={() => openJobActionModal(job, "cancel")}
                    disabled={rowIsBusy}
                    title="Cancel this reminder job"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 text-xs font-medium text-red-600 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400"
                >
                    {rowIsCancelling ? (
                        <HiOutlineArrowPath
                            size={14}
                            className="animate-spin"
                        />
                    ) : (
                        <HiOutlineXMark size={14} />
                    )}
                    {rowIsCancelling ? "Cancelling..." : "Cancel"}
                </button>
            </div>
        );
    }

    const tabs: {
        key: TabKey;
        label: string;
        count?: number;
        icon: ReactNode;
    }[] = [
            {
                key: "jobs",
                label: "Job history",
                count: jobs.length,
                icon: <HiOutlineEnvelope size={16} />,
            },
            {
                key: "users",
                label: "Missing reports",
                count: pendingUsers.length,
                icon: <HiOutlineUsers size={16} />,
            },
            {
                key: "schedule",
                label: "Schedule",
                icon: <HiOutlineCalendarDays size={16} />,
            },
        ];

    const th = "px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)]";

    /* =====================================================
       PAGE RENDER
    ===================================================== */

    return (
        <>
            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
                <PageTitle title="Email Reminders" />

                {/* Header and toolbar */}
                <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                            Email Reminders
                        </h1>

                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                            Track missing daily reports and manage reminder
                            delivery. All times are in IST.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-sm">
                            <label
                                htmlFor="reminder-test-time"
                                className="pl-2.5 text-xs font-medium text-[var(--text-muted)]"
                            >
                                Test time
                            </label>

                            <input
                                id="reminder-test-time"
                                type="time"
                                required
                                value={selectedSlot}
                                onChange={(event) =>
                                    setSelectedSlot(event.target.value)
                                }
                                className="h-9 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-sm font-semibold text-[var(--text-primary)] outline-none focus:bg-indigo-500/5 sm:flex-none"
                            />

                            <button
                                type="button"
                                disabled={isMutating || !selectedSlot}
                                onClick={openQueueModal}
                                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {queueMutation.isPending ? (
                                    <HiOutlineArrowPath
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <HiOutlineQueueList size={16} />
                                )}
                                Queue reminder
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => void refreshReminderData()}
                            disabled={isRefreshing}
                            aria-label="Refresh dashboard"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-[var(--border)]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <HiOutlineArrowPath
                                size={16}
                                className={isRefreshing ? "animate-spin" : ""}
                            />
                            <span className="sm:hidden lg:inline">
                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </span>
                        </button>
                    </div>
                </header>

                {/* Error state */}
                {hasError && (
                    <div className="flex flex-col gap-3 rounded-xl bg-red-500/5 p-4 ring-1 ring-red-500/20 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <HiOutlineExclamationTriangle
                                className="mt-0.5 shrink-0 text-red-500"
                                size={20}
                            />

                            <div>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">
                                    Unable to load all reminder data
                                </p>

                                <p className="mt-0.5 text-xs leading-5 text-[var(--text-muted)]">
                                    Check the backend connection and your
                                    EMAIL_REMINDER_VIEW permission.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                void pendingQuery.refetch();
                                void jobsQuery.refetch();
                            }}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--surface)] px-3 text-xs font-medium text-red-600 ring-1 ring-red-500/20 transition hover:bg-red-500/5"
                        >
                            <HiOutlineArrowPath size={14} />
                            Retry
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="grid grid-cols-1 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                    <Stat
                        label="Missing reports"
                        value={pendingUsers.length}
                        hint="Users yet to submit today"
                        icon={<HiOutlineUsers size={20} />}
                        tone="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />

                    <Stat
                        label="Pending jobs"
                        value={pendingJobCount}
                        hint="Waiting for delivery"
                        icon={<HiOutlineClock size={20} />}
                        tone="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    />

                    <Stat
                        label="Completed"
                        value={completedCount}
                        hint="Delivered successfully"
                        icon={<HiOutlineCheckCircle size={20} />}
                        tone="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />

                    <Stat
                        label="Failed"
                        value={failedCount}
                        hint="Need investigation"
                        icon={<HiOutlineExclamationTriangle size={20} />}
                        tone="bg-red-500/10 text-red-600 dark:text-red-400"
                    />
                </section>

                {/* Tabs */}
                <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-2 sm:px-4">
                        <nav
                            className="-mb-px flex overflow-x-auto"
                            role="tablist"
                        >
                            {tabs.map((item) => {
                                const active = tab === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={active}
                                        onClick={() => setTab(item.key)}
                                        className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-medium transition sm:px-4 ${active
                                                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                            }`}
                                    >
                                        {item.icon}
                                        {item.label}

                                        {item.count !== undefined && (
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${active
                                                        ? "bg-indigo-500/10"
                                                        : "bg-[var(--border)]/40"
                                                    }`}
                                            >
                                                {item.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {tab !== "schedule" && (
                            <button
                                type="button"
                                onClick={() =>
                                    void (
                                        tab === "jobs"
                                            ? jobsQuery.refetch()
                                            : pendingQuery.refetch()
                                    )
                                }
                                disabled={
                                    tab === "jobs"
                                        ? jobsQuery.isFetching
                                        : pendingQuery.isFetching
                                }
                                aria-label="Refresh list"
                                className="my-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--border)]/30 hover:text-[var(--text-primary)] disabled:opacity-50"
                            >
                                <HiOutlineArrowPath
                                    size={17}
                                    className={
                                        (
                                            tab === "jobs"
                                                ? jobsQuery.isFetching
                                                : pendingQuery.isFetching
                                        )
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                            </button>
                        )}
                    </div>

                    {/* JOB HISTORY */}
                    {tab === "jobs" &&
                        (jobsQuery.isLoading ? (
                            <LoadingState />
                        ) : jobs.length === 0 ? (
                            <EmptyState
                                title="No reminder jobs yet"
                                description="Pick a test time above and queue a reminder to create your first job."
                                icon={<HiOutlineQueueList size={25} />}
                            />
                        ) : (
                            <>
                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[var(--border)] bg-[var(--border)]/10">
                                                <th className={th}>Date</th>
                                                <th className={th}>Time</th>
                                                <th className={th}>Recipients</th>
                                                <th className={th}>Status</th>
                                                <th className={th}>Attempts</th>
                                                <th className={th}>Processed</th>
                                                <th className={`${th} text-right`}>
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[var(--border)]">
                                            {jobs.map((job) => (
                                                <tr
                                                    key={job.id}
                                                    className="transition hover:bg-[var(--border)]/10"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                                                        {formatDate(job.jobDate)}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-primary)]">
                                                        {formatSlot(job.slotTime)}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-[var(--text-primary)]">
                                                        {job.recipientCount}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <StatusBadge
                                                            status={job.status}
                                                        />
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                                                        {job.attempts}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--text-muted)]">
                                                        {formatDateTime(
                                                            job.processedAt,
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {renderJobActions(job)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile cards */}
                                <ul className="divide-y divide-[var(--border)] md:hidden">
                                    {jobs.map((job) => (
                                        <li
                                            key={job.id}
                                            className="space-y-3 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                        {formatDate(job.jobDate)}{" "}
                                                        · {formatSlot(job.slotTime)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                        {job.recipientCount} recipient(s)
                                                        {" · "}
                                                        {job.attempts} attempt(s)
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                                        Processed:{" "}
                                                        {formatDateTime(
                                                            job.processedAt,
                                                        )}
                                                    </p>
                                                </div>

                                                <StatusBadge status={job.status} />
                                            </div>

                                            {job.status === "PENDING" && (
                                                <div className="flex flex-wrap gap-2 [&>button]:min-h-9">
                                                    {renderJobActions(job)}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ))}

                    {/* USERS MISSING REPORTS */}
                    {tab === "users" &&
                        (pendingQuery.isLoading ? (
                            <LoadingState />
                        ) : pendingUsers.length === 0 ? (
                            <EmptyState
                                title="Everyone is up to date"
                                description="No active users are missing today's report."
                                icon={<HiOutlineCheckCircle size={25} />}
                            />
                        ) : (
                            <ul className="divide-y divide-[var(--border)]">
                                {pendingUsers.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-[var(--border)]/10 sm:gap-4 sm:px-6"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                            {initials(user.name)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-[var(--text-muted)]">
                                                {user.email}
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                            Not submitted
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ))}

                    {/* AUTOMATIC SCHEDULE */}
                    {tab === "schedule" && (
                        <div className="p-5 sm:p-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                    Automatic reminder schedule
                                </h2>

                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Active
                                </span>
                            </div>

                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                Reminders are configured for these times. Use the
                                test time above to create a one-off job.
                            </p>

                            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                {AUTOMATIC_REMINDER_SLOTS.map((slot, index) => (
                                    <div
                                        key={slot}
                                        className="rounded-2xl border border-[var(--border)] p-5"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                                            <HiOutlineClock size={20} />
                                        </div>

                                        <p className="mt-4 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                                            {formatSlot(slot)}
                                        </p>

                                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                            {SLOT_LABELS[index] ?? "Scheduled"} · IST
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            <ConfirmationModal
                mode={modalMode}
                selectedTime={selectedSlot}
                job={selectedJob}
                isLoading={isMutating}
                onClose={closeModal}
                onConfirm={confirmModalAction}
            />
        </>
    );
}
