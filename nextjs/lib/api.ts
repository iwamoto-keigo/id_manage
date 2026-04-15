import "server-only";

import type { KcEvent, Role, Session, User } from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://fastapi:8000";

interface FetchOptions extends RequestInit {
  parseError?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${options.method ?? "GET"} ${path} -> ${res.status}: ${body}`);
  }

  // DELETE responses may be empty on some endpoints; guard parse.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ---------- reads ----------

export async function listUsers(params: { search?: string; first?: number; max?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.first !== undefined) qs.set("first", String(params.first));
  if (params.max !== undefined) qs.set("max", String(params.max));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<User[]>(`/api/users${suffix}`);
}

export async function getUser(userId: string) {
  return apiFetch<User>(`/api/users/${userId}`);
}

export async function listUserRoles(userId: string) {
  return apiFetch<Role[]>(`/api/users/${userId}/roles`);
}

export async function listRoles() {
  return apiFetch<Role[]>("/api/roles");
}

export async function listSessions() {
  return apiFetch<Session[]>("/api/sessions");
}

export async function listEvents(params: { max?: number; type?: string } = {}) {
  const qs = new URLSearchParams();
  if (params.max !== undefined) qs.set("max", String(params.max));
  if (params.type) qs.set("type", params.type);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<KcEvent[]>(`/api/events${suffix}`);
}

// ---------- mutations ----------

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  enabled: boolean;
  first_name?: string;
  last_name?: string;
}

export async function createUser(input: CreateUserInput) {
  return apiFetch<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function toggleUser(userId: string) {
  return apiFetch<User>(`/api/users/${userId}/toggle`, { method: "PUT" });
}

export async function disableUser(userId: string) {
  return apiFetch<{ message: string }>(`/api/users/${userId}`, { method: "DELETE" });
}

export async function assignRole(userId: string, roleName: string) {
  return apiFetch<{ message: string }>(`/api/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ role_name: roleName }),
  });
}

export async function revokeRole(userId: string, roleName: string) {
  return apiFetch<{ message: string }>(
    `/api/users/${userId}/roles/${encodeURIComponent(roleName)}`,
    { method: "DELETE" },
  );
}
