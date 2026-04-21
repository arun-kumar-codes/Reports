import { NextResponse, type NextRequest } from "next/server";
import { hasAtLeast, parseRole, ROLE_COOKIE, type Role } from "@/lib/auth";

/**
 * Role gates. Paths listed here require the specified minimum role.
 * Checked in declared order; the first match wins.
 */
const ROLE_GATES: ReadonlyArray<{
  matcher: RegExp;
  minRole: Role;
  kind: "page" | "api";
}> = [
  { matcher: /^\/reports(?:\/|$)/, minRole: "viewer", kind: "page" },
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const gate = ROLE_GATES.find(({ matcher }) => matcher.test(pathname));
  if (!gate) return NextResponse.next();

  const role = parseRole(request.cookies.get(ROLE_COOKIE)?.value);
  if (hasAtLeast(role, gate.minRole)) return NextResponse.next();

  if (gate.kind === "api") {
    return NextResponse.json(
      {
        error: {
          code: "forbidden",
          message: `This endpoint requires the "${gate.minRole}" role.`,
        },
      },
      { status: 403 },
    );
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/forbidden";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("from", `${pathname}${search}`);
  redirectUrl.searchParams.set("required", gate.minRole);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/reports", "/reports/:path*"],
};
