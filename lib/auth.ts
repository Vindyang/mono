import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

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
        // Send magic link email using Resend
        try {
          await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Sign in to your account",
            html: `
              <h2>Sign in to your account</h2>
              <p>Click the link below to sign in:</p>
              <a href="${url}">Sign in</a>
              <p>This link will expire in 5 minutes.</p>
              <p>If you didn't request this email, you can safely ignore it.</p>
            `,
          });

          console.log(`Magic link sent successfully to ${email}`);
        } catch (error) {
          console.error("Error sending magic link:", error);
          throw new Error("Failed to send magic link");
        }
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  // User is automatically created by better-auth when they verify the magic link
  // The name field will be set to the username (part before @) via the after hook
});
