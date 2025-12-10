"use client";

import { Invitation } from "@/lib/types/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface InvitationsListProps {
  invitations: Invitation[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  if (invitations.length === 0) {
    return (
        <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <p className="text-sm text-zinc-500 md:text-base">No pending invitations</p>
        </div>
    )
  }

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
      <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 bg-zinc-50/50 p-4 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div className="col-span-5 md:col-span-5">Email</div>
        <div className="col-span-3 hidden md:block">Role</div>
        <div className="col-span-3 hidden md:block">Invited By</div>
        <div className="col-span-7 md:col-span-1 text-right">Actions</div>
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {invitations.map((invitation) => (
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
               <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400" title="Revoke">
                    <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400" title="Resend">
                    <Check className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
