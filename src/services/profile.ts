import api from "./api";

export interface Profile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileResponse {
    success: boolean;
    data: Profile;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: Profile;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

export async function getProfile() {
    const { data } = await api.get<ProfileResponse>(
        "/api/profile"
    );

    return data;
}

export async function updateProfile(name: string) {
    const { data } =
        await api.put<UpdateProfileResponse>(
            "/api/profile",
            { name }
        );

    return data;
}

export async function changePassword(
    payload: ChangePasswordPayload
) {
    const { data } =
        await api.put<ChangePasswordResponse>(
            "/api/profile/password",
            payload
        );

    return data;
}