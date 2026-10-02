import { NextResponse, type NextRequest } from "next/server";
import { readSession, redirectTo, sessionCookieName } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await readSession(request.cookies.get(sessionCookieName())?.value);
  if (!session) {
    return await redirectTo(request, "/admin/login", 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
