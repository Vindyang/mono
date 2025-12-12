import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { shouldAutoLogin, findVerificationTokenByEmail, buildUrl } from "@/lib/auth-utils";

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

    // Check if user logged in recently
    const user = await prisma.user.findUnique({
      where: { email },
      select: { lastLoginAt: true },
    });

    const shouldAutoLoginUser = shouldAutoLogin(user?.lastLoginAt ?? null);

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

    // If user should auto-login, get the verification token and return it
    if (shouldAutoLoginUser) {
      const token = await findVerificationTokenByEmail(email);

      if (token) {
        const host = request.headers.get("host") || "localhost:3000";
        const autoLoginUrl = buildUrl("/api/auth/verify-and-update", host, {
          token,
          callbackURL,
        });

        return NextResponse.json({
          ...responseData,
          autoLoginUrl,
        });
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Login with check error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
