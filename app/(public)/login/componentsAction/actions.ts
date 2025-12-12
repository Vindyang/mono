"use server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type ActionState = {
  error?: string;
  success?: boolean;
  autoLoginUrl?: string;
  errorType?: "not_found" | "validation" | "system";
};

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
    });

    if (!user) {
      return {
        error: "No account found with this email.",
        errorType: "not_found"
      };
    }

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

    // Send magic link via our custom endpoint that checks for auto-login
    const callbackUrl = `${protocol}://${host}/dashboard`;

    const response = await fetch(`${protocol}://${host}/api/auth/login-with-check`, {
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
        error: data.message || "Failed to send magic link",
        errorType: "system"
      };
    }

    const data = await response.json();
    console.log("Response from login-with-check:", data);

    // Check if the response includes an auto-login URL (for users who logged in recently)
    if (data.autoLoginUrl) {
      console.log("Auto-login detected, returning autoLoginUrl:", data.autoLoginUrl);
      return {
        success: true,
        autoLoginUrl: data.autoLoginUrl
      };
    }

    console.log("No auto-login, returning normal success");
    return {
      success: true
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
      errorType: "system"
    };
  }
}
