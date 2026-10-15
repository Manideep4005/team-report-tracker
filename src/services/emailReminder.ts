
import api from "./api";

export interface PendingReminderUser {
    id: string;
    name: string;
    email: string;
}

export type EmailReminderJobStatus =
    | "PENDING"
    | "PROCESSING"
    | "COMPLETED"
    | "SKIPPED"
    | "CANCELLED"
    | "FAILED";

export interface EmailReminderJob {
    id: string;
    jobDate: string;
    slotTime: string;
    status: EmailReminderJobStatus;
    recipientUserIds: unknown;
    recipientCount: number;
    attempts: number;
    lastError: string | null;
    scheduledFor: string;
    processedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    count?: number;
    data: T;
    message?: string;
}

export interface QueueReminderResult {
    alreadyQueued?: boolean;
    pendingCount?: number;
    recipients?: PendingReminderUser[];
    job?: EmailReminderJob;
}

export interface DeliverReminderResult {
    status?: EmailReminderJobStatus;
    sent?: number;
    failed?: number;
    skipped?: boolean;
    reason?: string;
    message?: string;
}

export type ReminderJobAction = "CANCEL" | "SKIP";

export interface CancelSkipReminderResult {
    updated: boolean;
    job: EmailReminderJob;
    message: string;
}

export async function getPendingReminderUsers() {
    const { data } = await api.get<ApiResponse<PendingReminderUser[]>>(
        "/api/email-reminders/pending",
    );

    return data;
}

export async function getEmailReminderJobs(limit = 50) {
    const { data } = await api.get<ApiResponse<EmailReminderJob[]>>(
        "/api/email-reminders/jobs",
        { params: { limit } },
    );

    return data;
}

export async function queueEmailReminder(slotTime: string) {
    const { data } = await api.post<ApiResponse<QueueReminderResult>>(
        "/api/email-reminders/queue",
        { slotTime },
    );

    return data;
}

export async function deliverEmailReminder(jobId: string) {
    const { data } = await api.post<ApiResponse<DeliverReminderResult>>(
        `/api/email-reminders/jobs/${encodeURIComponent(jobId)}/deliver`,
    );

    return data;
}

/**
 * Cancel a pending reminder job.
 * Endpoint: POST /api/email-reminders/jobs/:jobId/cancel
 */
export async function cancelEmailReminder(jobId: string) {
    const { data } = await api.post<ApiResponse<CancelSkipReminderResult>>(
        `/api/email-reminders/jobs/${encodeURIComponent(jobId)}/cancel`,
    );

    return data;
}

/**
 * Skip a pending reminder job.
 * Endpoint: POST /api/email-reminders/jobs/:jobId/skip
 */
export async function skipEmailReminder(jobId: string) {
    const { data } = await api.post<ApiResponse<CancelSkipReminderResult>>(
        `/api/email-reminders/jobs/${encodeURIComponent(jobId)}/skip`,
    );

    return data;
}

/**
 * Use one function when the action is selected dynamically.
 */
export async function updateEmailReminderJob(
    jobId: string,
    action: ReminderJobAction,
) {
    return action === "CANCEL"
        ? cancelEmailReminder(jobId)
        : skipEmailReminder(jobId);
}
