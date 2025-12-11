"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  
  if (!email) {
      return { error: "Email is required" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    //   emailRedirectTo: \`\${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback\`, // Optional: Add if callback handling is set up
    }
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
