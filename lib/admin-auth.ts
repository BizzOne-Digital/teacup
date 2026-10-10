import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "teacup_admin_session";

function signToken(password: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "change-me-in-production";
  return crypto
    .createHmac("sha256", secret)
    .update(password)
    .digest("hex");
}

export async function setAdminSession() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const token = signToken(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === signToken(password);
}

export function verifyAdminCredentials(
  email: string,
  password: string
): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;
  return (
    email.trim().toLowerCase() === expectedEmail && password === expectedPassword
  );
}
