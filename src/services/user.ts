import api from "./api";


/* ================================================================
   ROLE
================================================================ */

export interface UserRole {
    id: string;
    name: string;
    description?: string | null;
}


/* ================================================================
   USER
================================================================ */

export interface ManagedUser {
    id: string;
    name: string;
    email: string;

    roleId: string;

    role: UserRole;

    createdAt: string;
    updatedAt: string;

    deletedAt?: string | null;
}


/* ================================================================
   CREATE USER
================================================================ */

export interface CreateUserPayload {
    name: string;
    email: string;
    roleId: string;
}


/* ================================================================
   UPDATE USER
================================================================ */

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    roleId?: string;
}


/* ================================================================
   RESPONSES
================================================================ */

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


export interface RestoreUserResponse {
    success: boolean;
    message: string;
    data: ManagedUser;
}


export interface ResetUserPasswordResponse {
    success: boolean;
    message: string;
}


/* ================================================================
   GET ACTIVE USERS
================================================================ */

export async function getUsers() {

    const { data } =
        await api.get<UsersResponse>(
            "/api/users"
        );

    return data;
}


/* ================================================================
   GET INACTIVE USERS
================================================================ */

export async function getInactiveUsers() {

    const { data } =
        await api.get<UsersResponse>(
            "/api/users/inactive"
        );

    return data;
}


/* ================================================================
   GET USER
================================================================ */

export async function getUser(
    id: string
) {

    const { data } =
        await api.get<UserResponse>(
            `/api/users/${id}`
        );

    return data;
}


/* ================================================================
   CREATE USER
================================================================ */

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


/* ================================================================
   UPDATE USER
================================================================ */

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


/* ================================================================
   DELETE USER
================================================================ */

export async function deleteUser(
    id: string
) {

    const { data } =
        await api.delete<DeleteUserResponse>(
            `/api/users/${id}`
        );

    return data;
}


/* ================================================================
   RESTORE USER
================================================================ */

export async function restoreUser(
    id: string
) {

    const { data } =
        await api.post<RestoreUserResponse>(
            `/api/users/${id}/restore`
        );

    return data;
}


/* ================================================================
   RESET PASSWORD
================================================================ */

export async function resetUserPassword(
    id: string
) {

    const { data } =
        await api.post<ResetUserPasswordResponse>(
            `/api/users/${id}/reset-password`
        );

    return data;
}