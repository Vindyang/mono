import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    magicLink({
      disableSignUp: false, // Allow new users to sign up via magic link
      sendMagicLink: async ({ email, token, url }) => {
        // Use Supabase client API to send magic link (no service role key needed)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !anonKey) {
          console.error("Missing Supabase configuration");
          throw new Error("Email service not configured");
        }

        try {
          // Send the magic link using Supabase's signInWithOtp
          // This uses the anon key and sends the email automatically
          const response = await fetch(
            `${supabaseUrl}/auth/v1/otp`,
            {
              method: "POST",
              headers: {
                apikey: anonKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email,
                create_user: true,
                options: {
                  email_redirect_to: url,
                  data: {
                    better_auth_token: token,
                  },
                },
              }),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            console.error("Error sending magic link via Supabase:", error);
            throw new Error("Failed to send magic link");
          }

          console.log(`Magic link sent successfully to ${email}`);
        } catch (error) {
          console.error("Error in sendMagicLink:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  ],
  // User is automatically created by better-auth when they verify the magic link
  // The user table will be populated with: id (UUID), email, name (from email), emailVerified, etc.
});
