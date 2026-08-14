import api from "./api";

export interface UserRole {
    id: string;
    name: string;
    description?: string | null;
}

export interface ManagedUser {
    id: string;
    name: string;
    email: string;
    roleId: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    roleId: string;
}

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    roleId?: string;
}

export interface UsersResponse {
    success: boolean;
    data: ManagedUser[];
}

export interface UserResponse {
    success: boolean;
    data: ManagedUser;
}

export interface CreateUserResponse {
    success: boolean;
    message: string;
    data: ManagedUser;
}

export interface UpdateUserResponse {
    success: boolean;
    message: string;
    data: ManagedUser;
}

export interface DeleteUserResponse {
    success: boolean;
    message: string;
}

export async function getUsers() {
    const { data } =
        await api.get<UsersResponse>("/api/users");

    return data;
}

export async function getUser(id: string) {
    const { data } =
        await api.get<UserResponse>(
            `/api/users/${id}`
        );

    return data;
}

export async function createUser(
    payload: CreateUserPayload
) {
    const { data } =
        await api.post<CreateUserResponse>(
            "/api/users",
            payload
        );

    return data;
}

export async function updateUser(
    id: string,
    payload: UpdateUserPayload
) {
    const { data } =
        await api.put<UpdateUserResponse>(
            `/api/users/${id}`,
            payload
        );

    return data;
}

export async function deleteUser(id: string) {
    const { data } =
        await api.delete<DeleteUserResponse>(
            `/api/users/${id}`
        );

    return data;
}