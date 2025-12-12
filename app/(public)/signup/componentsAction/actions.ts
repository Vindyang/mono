"use server";
import { headers } from "next/headers";

type ActionState = {
  error?: string;
  success?: boolean;
  errorType?: "validation" | "system";
};

export async function signup(
  _prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  try {
    // Get the host from headers to construct the callback URL
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const callbackUrl = `${protocol}://${host}/dashboard`;

    // Send magic link using better-auth
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

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.message || "Failed to send magic link",
        errorType: "system"
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      error: "Something went wrong. Please try again.",
      errorType: "system"
    };
  }
}
