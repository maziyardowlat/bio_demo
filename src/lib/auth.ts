import { cookies } from "next/headers";

const SESSION_COOKIE = "bio_admin_session";
const SESSION_VALUE = "authenticated";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}
