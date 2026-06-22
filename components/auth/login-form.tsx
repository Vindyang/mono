"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MonoLogoSimple } from "@/components/ui/mono-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/app/(public)/login/componentsAction/actions";
import { useSession } from "@/lib/auth/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface LoginFormProps extends React.ComponentProps<"div"> {
  inviteId?: string;
}

export function LoginForm({ className, inviteId, ...props }: LoginFormProps) {
  const [state, action, pending] = useActionState(login, undefined);
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  // If there's an inviteId, redirect to accept invitation instead
  useEffect(() => {
    if (session) {
      if (inviteId) {
        router.push(`/invite/${inviteId}?accept=true`);
      } else {
        router.push("/dashboard");
      }
    }
  }, [session, router, inviteId]);

  // Show toast notifications for specific error types
  useEffect(() => {
    if (state?.errorType === "not_found") {
      toast.error(state.error || "No account found with this email.", {
        action: {
          label: "Sign up",
          onClick: () =>
            router.push(inviteId ? `/signup?inviteId=${inviteId}` : "/signup"),
        },
      });
    } else if (state?.errorType === "system") {
      toast.error(state.error || "Something went wrong. Please try again.");
    }
  }, [state?.errorType, state?.error, router, inviteId]);

  // Handle auto-login for users who logged in recently
  useEffect(() => {
    if (state?.success && state?.autoLoginUrl) {
      toast.success("Welcome back! Logging you in...");
      // Navigate to the auto-login URL which will verify and redirect to dashboard
      window.location.href = state.autoLoginUrl;
    }
  }, [state?.success, state?.autoLoginUrl]);

  if (state?.success) {
    // If auto-login, show spinner during redirect
    if (state.autoLoginUrl) {
      return (
        <div
          className={cn("flex flex-col gap-6 text-center", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-4">
            <Spinner className="h-8 w-8" />
            <p className="text-muted-foreground">Logging you in...</p>
          </div>
        </div>
      );
    }

    // Otherwise show "check your email" message
    return (
      <div
        className={cn("flex flex-col gap-6 text-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
            <MonoLogoSimple className="size-7" />
          </div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent you a magic link. Please check your email to sign in
            to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={action}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                <MonoLogoSimple className="size-7" />
              </div>
              <span className="sr-only">Mono</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Mono</h1>
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <a href={inviteId ? `/signup?inviteId=${inviteId}` : "/signup"}>
                Sign up
              </a>
            </FieldDescription>
          </div>
          {inviteId && <input type="hidden" name="inviteId" value={inviteId} />}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          {state?.error && !state?.errorType && (
            <p className="text-destructive text-sm font-medium">
              {state.error}
            </p>
          )}
          <Field>
            <Button type="submit" disabled={pending} className="relative">
              {pending ? <Spinner className="h-4 w-4" /> : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
