import api from "./api";

/* =========================================================
   TYPES
========================================================= */

export type ExpirationType =
    | "MINUTES"
    | "HOURS"
    | "NEVER";


/* =========================================================
   CREATE MONITOR LINK
========================================================= */

export interface CreateMonitorLinkPayload {
    expirationType: ExpirationType;
    expirationValue?: number;
}


export interface CreateMonitorLinkData {
    id: string;
    url: string;
    expiresAt: string | null;
    isActive: boolean;
    createdAt: string;
}


export interface CreateMonitorLinkResponse {
    success: boolean;
    message?: string;
    data: CreateMonitorLinkData;
}


/* =========================================================
   EXISTING MONITOR LINKS
========================================================= */

export interface PublicMonitorLink {
    id: string;

    expiresAt: string | null;

    isActive: boolean;

    createdAt: string;

    createdBy: {
        id: string;
        name: string;
    };

    revokedAt: string | null;

    revokedBy: {
        id: string;
        name: string;
    } | null;
}


export interface GetMonitorLinksResponse {
    success: boolean;
    data: PublicMonitorLink[];
}


/* =========================================================
   REVOKE MONITOR LINK
========================================================= */

export interface RevokeMonitorLinkResponse {
    success: boolean;

    message: string;

    data: {
        id: string;
        isActive: boolean;
        revokedAt: string | null;
    };
}


/* =========================================================
   PUBLIC MONITOR VIEW
========================================================= */

export interface PublicMonitorReport {
    id: string;
    reportDate: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}


export interface PublicMonitorTeamMember {
    id: string;
    name: string;
    submitted: boolean;

    report: PublicMonitorReport | null;
}


export interface PublicMonitorStats {
    submitted: number;
    totalMembers: number;
    completion: number;
}


export interface PublicMonitorData {
    date: string;

    stats: PublicMonitorStats;

    teamStatus: PublicMonitorTeamMember[];
}


export interface PublicMonitorResponse {
    success: boolean;

    data: PublicMonitorData;
}


/* =========================================================
   CREATE
========================================================= */

export async function createMonitorLink(
    payload: CreateMonitorLinkPayload
) {
    const { data } =
        await api.post<CreateMonitorLinkResponse>(
            "/api/public-monitor",
            payload
        );

    return data;
}


/* =========================================================
   GET ALL LINKS
========================================================= */

export async function getMonitorLinks() {
    const { data } =
        await api.get<GetMonitorLinksResponse>(
            "/api/public-monitor"
        );

    return data;
}


/* =========================================================
   REVOKE
========================================================= */

export async function revokeMonitorLink(
    id: string
) {
    const { data } =
        await api.delete<RevokeMonitorLinkResponse>(
            `/api/public-monitor/${id}`
        );

    return data;
}


/* =========================================================
   PUBLIC VIEW
========================================================= */

export async function getPublicMonitor(
    token: string,
    date?: string
) {
    const { data } =
        await api.get<PublicMonitorResponse>(
            `/api/public-monitor/public/${token}`,
            {
                params: date
                    ? { date }
                    : {},
            }
        );

    return data;
}