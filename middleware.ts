import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/meta/webhook")) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;
  if (!user || !pass) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const [type, value] = auth.split(" ");
  if (type === "Basic" && value) {
    const decoded = Buffer.from(value, "base64").toString();
    const [u, p] = decoded.split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Unified Inbox"' }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
