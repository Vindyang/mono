import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircle, Mail } from "lucide-react";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Invitation not found",
  EXPIRED: "This invitation has expired",
  INVALID_STATUS: "This invitation is no longer valid",
  EMAIL_MISMATCH: "This invitation was sent to a different email address",
  ALREADY_MEMBER: "You are already a member of this workspace",
  SIGNUP_FAILED: "Failed to create your account",
};

interface InvitePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function InvitePage({
  params,
  searchParams,
}: InvitePageProps) {
  const { id: invitationToken } = await params;
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        {!error ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>You&apos;ve Been Invited!</CardTitle>
              <CardDescription>
                You&apos;ve been invited to join a workspace. Click the button
                below to accept the invitation.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Link
                href={`/api/invite/accept?token=${invitationToken}`}
                className="w-full"
              >
                <Button className="w-full">Accept Invitation</Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Decline
                </Button>
              </Link>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Invitation Error</CardTitle>
              <CardDescription>
                {ERROR_MESSAGES[error] || "Failed to accept invitation"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
