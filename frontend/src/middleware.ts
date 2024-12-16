import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";

export function middleware(request: NextRequest) {
    const cookies = parse(request.headers.get("cookie") || "");
    const accessToken = cookies.accessToken;

    const url = new URL(request.url);
    const isLoginOrRegisterPage =
        url.pathname === "/login" || url.pathname === "/register";

    if (accessToken) {
        if (isLoginOrRegisterPage) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    } else {
        if (isLoginOrRegisterPage) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/", "/login", "/register", "/profile",],
};
