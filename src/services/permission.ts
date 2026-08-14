import api from "./api";

export interface Permission {
    id: string;
    code: string;
    name: string;
    description: string | null;
    createdAt?: string;
    updatedAt?: string;
    _count?: {
        roles: number;
    };
}

export async function getPermissions() {
    const { data } = await api.get("/api/permissions");

    return data;
}

export async function getPermissionById(id: string) {
    const { data } = await api.get(
        `/api/permissions/${id}`
    );

    return data;
}

export async function createPermission(payload: {
    code: string;
    name: string;
    description?: string;
}) {
    const { data } = await api.post(
        "/api/permissions",
        payload
    );

    return data;
}

export async function updatePermission(
    id: string,
    payload: {
        code?: string;
        name?: string;
        description?: string;
    }
) {
    const { data } = await api.put(
        `/api/permissions/${id}`,
        payload
    );

    return data;
}

export async function deletePermission(id: string) {
    const { data } = await api.delete(
        `/api/permissions/${id}`
    );

    return data;
}