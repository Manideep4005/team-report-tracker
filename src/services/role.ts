import api from "./api";

export interface Permission {
    id: string;
    code: string;
    name: string;
    description?: string | null;
}

interface RoleApiResponse {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;

    permissions: {
        permission: Permission;
    }[];

    _count?: {
        users: number;
    };
}

export interface Role {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;

    permissions: Permission[];

    _count?: {
        users: number;
    };
}

export interface CreateRolePayload {
    name: string;
    description?: string;
    permissionIds: string[];
}

export interface UpdateRolePayload {
    name: string;
    description?: string;
    permissionIds: string[];
}

function mapRole(role: RoleApiResponse): Role {
    return {
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,

        permissions: role.permissions.map(
            ({ permission }) => permission
        ),

        _count: role._count,
    };
}

export async function getRoles() {
    const { data } =
        await api.get<{
            success: boolean;
            data: RoleApiResponse[];
        }>("/api/roles");

    return {
        ...data,
        data: data.data.map(mapRole),
    };
}

export async function getRole(id: string) {
    const { data } =
        await api.get<{
            success: boolean;
            data: RoleApiResponse;
        }>(`/api/roles/${id}`);

    return {
        ...data,
        data: mapRole(data.data),
    };
}

export async function createRole(
    payload: CreateRolePayload
) {
    const { data } =
        await api.post<{
            success: boolean;
            message: string;
            data: RoleApiResponse;
        }>("/api/roles", payload);

    return {
        ...data,
        data: mapRole(data.data),
    };
}

export async function updateRole(
    id: string,
    payload: UpdateRolePayload
) {
    const { data } =
        await api.put<{
            success: boolean;
            message: string;
            data: RoleApiResponse;
        }>(`/api/roles/${id}`, payload);

    return {
        ...data,
        data: mapRole(data.data),
    };
}

export async function deleteRole(id: string) {
    const { data } =
        await api.delete<{
            success: boolean;
            message: string;
        }>(`/api/roles/${id}`);

    return data;
}

export async function getPermissions() {
    const { data } =
        await api.get<{
            success: boolean;
            data: Permission[];
        }>("/api/permissions");

    return data;
}