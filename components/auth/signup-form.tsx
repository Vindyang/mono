"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MonoLogoSimple } from "@/components/ui/mono-logo";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signup } from "@/app/(public)/signup/componentsAction/actions";
import { useSession } from "@/lib/auth/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface SignupFormProps extends React.ComponentProps<"div"> {
  inviteId?: string;
}

export function SignupForm({ className, inviteId, ...props }: SignupFormProps) {
  const [state, action, pending] = useActionState(signup, undefined);
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

  // Show toast notifications for system errors
  useEffect(() => {
    if (state?.errorType === "system") {
      toast.error(state.error || "Something went wrong. Please try again.");
    }
  }, [state?.errorType, state?.error]);

  if (state?.success) {
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
            We&apos;ve sent you a confirmation link. Please check your email to
            verify your account.
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
              Already have an account?{" "}
              <a href={inviteId ? `/login?inviteId=${inviteId}` : "/login"}>
                Sign in
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
              {pending && <Spinner className="absolute left-4" />}
              <span className={pending ? "opacity-50" : ""}>
                Create Account
              </span>
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
