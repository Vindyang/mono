import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractEmailFromVerification } from "@/lib/auth/auth-utils";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const callbackURL = request.nextUrl.searchParams.get("callbackURL");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=MISSING_TOKEN", request.url)
    );
  }

  // Get the verification record to find the user email BEFORE verification
  // Note: better-auth stores token in 'identifier' and email data in 'value' (as JSON)
  const verification = await prisma.verification.findFirst({
    where: { identifier: token },
    orderBy: { createdAt: "desc" },
  });

  if (verification) {
    const email = extractEmailFromVerification(verification.value);

    if (email) {
      // Update lastLoginAt BEFORE calling verify, so it's ready when the session is created
      await prisma.user
        .update({
          where: { email },
          data: { lastLoginAt: new Date() },
        })
        .catch((error) => {
          console.error("Failed to update lastLoginAt:", error);
        });
    }
  }

  // Forward to better-auth's verify endpoint with the same cookies and headers
  const verifyUrl = new URL("/api/auth/magic-link/verify", request.url);
  verifyUrl.searchParams.set("token", token);
  if (callbackURL) {
    verifyUrl.searchParams.set("callbackURL", callbackURL);
  }

  // Make a server-side fetch to better-auth's verify endpoint
  const verifyResponse = await fetch(verifyUrl.toString(), {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    redirect: "manual", // Handle redirect ourselves
  });

  // Get the Set-Cookie headers from better-auth's response
  const setCookieHeaders = verifyResponse.headers.getSetCookie();

  // Get the redirect location
  const location = verifyResponse.headers.get("location");

  if (!location) {
    // If no redirect, something went wrong
    return NextResponse.redirect(
      new URL("/login?error=VERIFICATION_FAILED", request.url)
    );
  }

  // Add a query parameter to indicate this is an auto-login to prevent race conditions
  const redirectUrl = new URL(location, request.url);
  redirectUrl.searchParams.set("autologin", "true");

  // Create a redirect response with the cookies from better-auth
  const response = NextResponse.redirect(redirectUrl);

  // Copy all Set-Cookie headers from better-auth's response
  setCookieHeaders.forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  return response;
}
