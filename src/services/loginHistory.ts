import api from "./api";

export interface LoginHistoryUser {
    id: string;
    name: string;
    email: string;
}

export interface LoginHistoryItem {
    id: string;
    userId: string | null;
    email: string;
    status: "SUCCESS" | "FAILED";
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user: LoginHistoryUser | null;
}

export interface LoginHistoryResponse {
    success: boolean;
    data: LoginHistoryItem[];
}

export async function getLoginHistory() {
    const { data } =
        await api.get<LoginHistoryResponse>(
            "/api/login-history"
        );

    return data;
}