import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, callbackURL } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user logged in recently (within 30 days)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { lastLoginAt: true },
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const shouldAutoLogin = user?.lastLoginAt && user.lastLoginAt > thirtyDaysAgo;

    console.log("Auto-login check:", {
      email,
      lastLoginAt: user?.lastLoginAt,
      thirtyDaysAgo,
      shouldAutoLogin
    });

    // Call the actual magic link API
    const magicLinkUrl = new URL("/api/auth/sign-in/magic-link", request.url);
    const magicLinkResponse = await fetch(magicLinkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, callbackURL }),
    });

    if (!magicLinkResponse.ok) {
      const errorData = await magicLinkResponse.json();
      return NextResponse.json(errorData, { status: magicLinkResponse.status });
    }

    const responseData = await magicLinkResponse.json();

    // If user should auto-login, extract the URL from the console logs
    // Since better-auth logs it but doesn't return it, we need to get it from the database
    if (shouldAutoLogin) {
      console.log("Should auto-login is TRUE, fetching verification token");

      // Get the most recent verification token for this email
      // Note: better-auth stores email in the 'value' field as JSON, not in 'identifier'
      const allVerifications = await prisma.verification.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      // Find the verification record where value contains the email
      const verification = allVerifications.find(v => {
        try {
          const parsed = JSON.parse(v.value);
          return parsed.email === email;
        } catch {
          return false;
        }
      });

      console.log("Verification token found for email:", verification ? "YES" : "NO", email);

      if (verification) {
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const host = request.headers.get("host") || "localhost:3000";
        // Use verification.identifier because that's where better-auth stores the token
        const autoLoginUrl = `${protocol}://${host}/api/auth/verify-and-update?token=${verification.identifier}&callbackURL=${encodeURIComponent(callbackURL)}`;

        console.log("Returning autoLoginUrl to client:", autoLoginUrl);
        return NextResponse.json({
          ...responseData,
          autoLoginUrl,
        });
      }
    }

    console.log("No auto-login, returning normal response");
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Login with check error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
