"use server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { cookies } from "next/headers";

type ActionState = {
  error?: string;
  success?: boolean;
  requiresVerification?: boolean;
  errorType?: "not_found" | "validation" | "system";
};

const SESSION_EXPIRY_DAYS = 30; // Send magic link if user hasn't logged in for 30 days

export async function login(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    // Check if user exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return {
        error: "No account found with this email.",
        errorType: "not_found"
      };
    }

    // Check if user has a recent session (within SESSION_EXPIRY_DAYS)
    const lastSession = user.sessions[0];
    const now = new Date();
    const expiryThreshold = new Date(now.getTime() - SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // If user has never logged in OR last session is too old, send magic link
    if (!lastSession || lastSession.createdAt < expiryThreshold) {
      const headersList = await headers();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const callbackUrl = `${protocol}://${host}/dashboard`;

      // Send magic link for re-verification
      const response = await fetch(`${protocol}://${host}/api/auth/sign-in/magic-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          callbackURL: callbackUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return {
          error: data.message || "Failed to send verification link",
          errorType: "system"
        };
      }

      return {
        success: true,
        requiresVerification: true
      };
    }

    // User has recent activity - create a new session
    const headersList = await headers();

    // Generate session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create session in database
    await prisma.session.create({
      data: {
        token: sessionToken,
        userId: user.id,
        expiresAt,
        ipAddress: headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null,
        userAgent: headersList.get("user-agent") || null,
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
      errorType: "system"
    };
  }
}
