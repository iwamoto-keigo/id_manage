"use server";

import { revalidatePath } from "next/cache";

import {
  assignRole,
  createUser as apiCreateUser,
  disableUser,
  revokeRole,
  toggleUser,
} from "@/lib/api";

type ActionResult = { ok: true } | { ok: false; error: string };

function fail(err: unknown): ActionResult {
  return {
    ok: false,
    error: err instanceof Error ? err.message : String(err),
  };
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();

  if (!username || !email || !password) {
    return { ok: false, error: "username, email, password are required" };
  }

  try {
    await apiCreateUser({
      username,
      email,
      password,
      enabled: true,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    });
    revalidatePath("/users");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function toggleUserAction(userId: string): Promise<ActionResult> {
  try {
    await toggleUser(userId);
    revalidatePath("/users");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function disableUserAction(userId: string): Promise<ActionResult> {
  try {
    await disableUser(userId);
    revalidatePath("/users");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function assignRoleAction(
  userId: string,
  roleName: string,
): Promise<ActionResult> {
  try {
    await assignRole(userId, roleName);
    revalidatePath("/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function revokeRoleAction(
  userId: string,
  roleName: string,
): Promise<ActionResult> {
  try {
    await revokeRole(userId, roleName);
    revalidatePath("/users");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}
