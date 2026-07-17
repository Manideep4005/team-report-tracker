import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post<LoginResponse>(
    "/api/auth/login",
    payload
  );

  return data;
}

export async function logout() {
  await api.post("/api/auth/logout");
}

export async function me() {
  const { data } = await api.get<MeResponse>("/api/auth/me");

  return data;
}