import { NextResponse } from "next/server";
import { isRole, ROLE_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "bad_request", "Request body must be valid JSON.");
  }

  const role = (body as { role?: unknown } | null)?.role;
  if (!isRole(role)) {
    return jsonError(400, "bad_request", "Role must be one of guest, viewer.");
  }

  const response = NextResponse.json({ role }, { status: 200 });
  response.cookies.set(ROLE_COOKIE, role, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK_SECONDS,
  });
  return response;
}

export function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.delete(ROLE_COOKIE);
  return response;
}
