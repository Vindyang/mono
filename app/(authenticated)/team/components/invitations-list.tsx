"use client";

import { Invitation } from "@/lib/types/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Mail } from "lucide-react";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { resendInvitation, revokeInvitation } from "../componentsaction/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvitationsListProps {
  invitations: Invitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const handleResend = async (invitationId: string, email: string) => {
    setLoadingStates((prev) => ({ ...prev, [`resend-${invitationId}`]: true }));

    try {
      const result = await resendInvitation(invitationId);

      if (result.success) {
        toast.success(`Invitation resent to ${email}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`resend-${invitationId}`]: false }));
    }
  };

  const handleRevoke = async (invitationId: string, email: string) => {
    setLoadingStates((prev) => ({ ...prev, [`revoke-${invitationId}`]: true }));

    try {
      const result = await revokeInvitation(invitationId);

      if (result.success) {
        toast.success(`Invitation to ${email} has been revoked`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to revoke invitation");
      }
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      toast.error("Failed to revoke invitation");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`revoke-${invitationId}`]: false }));
    }
  };
  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden">
      <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 bg-zinc-50/50 p-4 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div className="col-span-5 md:col-span-5">Email</div>
        <div className="col-span-3 hidden md:block">Role</div>
        <div className="col-span-3 hidden md:block">Invited By</div>
        <div className="col-span-7 md:col-span-1 text-right">Actions</div>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {invitations.length > 0 ? (
          invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="grid grid-cols-12 items-center gap-4 p-4 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
          >
            <div className="col-span-5 flex flex-col md:col-span-5">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {invitation.email}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
                    {invitation.role} • Invited by {invitation.invitedBy}
                </span>
            </div>
            
            <div className="col-span-3 hidden md:block">
              <Badge variant="outline" className="capitalize font-normal text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                {invitation.role}
              </Badge>
            </div>
            
            <div className="col-span-3 hidden text-zinc-500 dark:text-zinc-400 md:block">
               {invitation.invitedBy} 
               <span className="block text-xs text-zinc-400">
                 {new Date(invitation.invitedAt).toLocaleDateString()}
               </span>
            </div>

            <div className="col-span-7 flex justify-end gap-2 md:col-span-1">
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                  title="Revoke"
                  onClick={() => handleRevoke(invitation.id, invitation.email)}
                  disabled={loadingStates[`revoke-${invitation.id}`]}
                >
                    <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400"
                  title="Resend"
                  onClick={() => handleResend(invitation.id, invitation.email)}
                  disabled={loadingStates[`resend-${invitation.id}`]}
                >
                    <Check className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ))
        ) : (
            <div className="p-12">
                <Empty>
                    <EmptyMedia>
                        <Mail className="h-12 w-12" />
                    </EmptyMedia>
                    <EmptyTitle>No pending invitations</EmptyTitle>
                    <EmptyDescription>
                        Invite team members to collaborate on your projects.
                    </EmptyDescription>
                </Empty>
            </div>
        )}
      </div>
    </div>
  );
}
