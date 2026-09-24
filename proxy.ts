import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: pages still verify the session. The matcher lists signed-in
// routes rather than excluding public ones, so /api/cron/* and /api/webhooks/* are never
// redirected; a redirect there silently breaks cron (SPEC §6).
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = { matcher: ["/letters/:path*"] };
