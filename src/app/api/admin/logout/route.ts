import { redirectTo, sessionCookieName } from "@/lib/session";

export async function POST(request: Request) {
  const response = await redirectTo(request, "/admin/login");
  response.cookies.set(sessionCookieName(), "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
