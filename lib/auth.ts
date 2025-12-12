import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { shouldAutoLogin } from "@/lib/auth-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Disable Better Auth's ID generation to let the database generate UUIDs
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    magicLink({
      disableSignUp: false, // Allow new users to sign up via magic link
      sendMagicLink: async ({ email, url }) => {
        // Replace the verify endpoint with our custom one that updates lastLoginAt
        const customUrl = url.replace("/api/auth/magic-link/verify", "/api/auth/verify-and-update");

        // Check if user logged in recently (within 30 days)
        const user = await prisma.user.findUnique({
          where: { email },
          select: { lastLoginAt: true },
        });

        const shouldSkipEmail = shouldAutoLogin(user?.lastLoginAt ?? null);

        if (shouldSkipEmail) {
          // User logged in recently - don't send email, just log the URL for auto-login
          console.log(`Skipping email for ${email} - user logged in recently`);
          console.log(`Auto-login URL: ${customUrl}`);
          return; // Don't send email
        }

        // Send magic link email using Resend for first-time or returning users
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Sign in to your account",
            html: `
              <h2>Sign in to your account</h2>
              <p>Click the link below to sign in:</p>
              <a href="${customUrl}">Sign in</a>
              <p>This link will expire in 5 minutes.</p>
              <p>If you didn't request this email, you can safely ignore it.</p>
            `,
          });

          console.log(`Magic link sent successfully to ${email}`);
          console.log(`Magic link URL: ${customUrl}`);
        } catch (error) {
          console.error("Error sending magic link:", error);
          throw new Error("Failed to send magic link");
        }
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days (remember device period)
    updateAge: 60 * 60 * 24, // 1 day (refresh session daily if active)
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
});
