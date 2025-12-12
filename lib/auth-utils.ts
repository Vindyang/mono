import { prisma } from "@/lib/prisma";

/**
 * Duration in days for the "remember device" feature
 * Users who logged in within this period will be auto-logged in without email verification
 */
export const REMEMBER_DEVICE_DAYS = 30;

/**
 * Check if a user should be auto-logged in based on their last login time
 */
export function shouldAutoLogin(lastLoginAt: Date | null): boolean {
  if (!lastLoginAt) return false;

  const rememberThreshold = new Date(Date.now() - REMEMBER_DEVICE_DAYS * 24 * 60 * 60 * 1000);
  return lastLoginAt > rememberThreshold;
}

/**
 * Find the most recent verification token for a given email
 * Note: better-auth stores the token in 'identifier' and email data as JSON in 'value'
 */
export async function findVerificationTokenByEmail(email: string): Promise<string | null> {
  const recentVerifications = await prisma.verification.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const verification = recentVerifications.find(v => {
    try {
      const parsed = JSON.parse(v.value);
      return parsed.email === email;
    } catch {
      return false;
    }
  });

  return verification?.identifier ?? null;
}

/**
 * Extract email from a verification record's value field
 * better-auth stores email as JSON: {"email": "user@example.com"}
 */
export function extractEmailFromVerification(value: string): string | null {
  try {
    const parsed = JSON.parse(value);
    return parsed.email ?? null;
  } catch {
    return null;
  }
}

/**
 * Build a full URL with proper protocol detection
 */
export function buildUrl(path: string, host: string, searchParams?: Record<string, string>): string {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const url = new URL(path, `${protocol}://${host}`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}
