import { redirect } from "next/navigation";
import { acceptInvitation } from "@/app/(authenticated)/team/componentsaction/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import Link from "next/link";

interface InvitePageProps {
  params: {
    id: string;
  };
  searchParams: {
    accept?: string;
  };
}

export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const invitationId = params.id;
  const shouldAccept = searchParams.accept === "true";

  let result = null;
  let isAccepted = false;

  if (shouldAccept) {
    result = await acceptInvitation(invitationId);
    isAccepted = result.success;

    if (result.success && result.workspaceSlug) {
      // Redirect to dashboard after successful acceptance
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        {!shouldAccept ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>You've Been Invited!</CardTitle>
              <CardDescription>
                You've been invited to join a workspace. Click the button below to accept the invitation.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Link href={`/invite/${invitationId}?accept=true`} className="w-full">
                <Button className="w-full">
                  Accept Invitation
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Decline
                </Button>
              </Link>
            </CardFooter>
          </>
        ) : isAccepted ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Invitation Accepted!</CardTitle>
              <CardDescription>
                Welcome to the team! You've successfully joined the workspace.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">
                  Go to Dashboard
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
                {result?.error || "Failed to accept invitation"}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-3">
              <Link href="/" className="w-full">
                <Button className="w-full">
                  Go to Home
                </Button>
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
