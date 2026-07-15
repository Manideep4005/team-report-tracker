import api from "./api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export async function login(payload: LoginRequest) {
  const { data } = await api.post<LoginResponse>(
    "/auth/login",
    payload
  );

  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function me() {
  const { data } = await api.get<User>("/auth/me");

  return data;
}