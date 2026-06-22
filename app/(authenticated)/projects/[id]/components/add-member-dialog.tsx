"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { UserPlus, UserCheck, Mail, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { searchWorkspaceMembersForProject, addMemberToProject } from "../componentsaction/actions";
import { createInvitation } from "@/app/(authenticated)/team/componentsaction/actions";

interface WorkspaceMember {
  workspaceMemberId: string;
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface AddMemberDialogProps {
  projectId: string;
  onSuccess?: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddMemberDialog({ projectId, onSuccess }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<WorkspaceMember[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setIsCurrentUser(false);
    }
  }, [open]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setIsCurrentUser(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchWorkspaceMembersForProject(projectId, value.trim());
      setResults(res.members);
      setIsCurrentUser(res.isCurrentUser);
      setSearching(false);
    }, 300);
  };

  const handleAdd = async (member: WorkspaceMember) => {
    setLoading(member.workspaceMemberId);
    const result = await addMemberToProject(projectId, member.workspaceMemberId);
    if (result.success) {
      toast.success(`${member.name} added to project`);
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Failed to add member");
    }
    setLoading(null);
  };

  const handleInvite = async () => {
    const email = query.trim();
    setLoading("invite");
    const result = await createInvitation(email, "MEMBER", [projectId]);
    if (result.success) {
      toast.success(`Invitation sent to ${email}`);
      setOpen(false);
      onSuccess?.();
    } else {
      toast.error(result.error ?? "Failed to send invitation");
    }
    setLoading(null);
  };

  const trimmed = query.trim();
  const isEmail = EMAIL_RE.test(trimmed);
  const showResults = results.length > 0;
  const showCurrentUser = !searching && isCurrentUser;
  const showInvite = !searching && !isCurrentUser && trimmed.length > 0 && results.length === 0 && isEmail;
  const showNoResults = !searching && !isCurrentUser && trimmed.length > 0 && results.length === 0 && !isEmail;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or enter email to invite..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleQueryChange(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {searching && (
            <div className="flex justify-center py-4">
              <Spinner className="h-5 w-5" />
            </div>
          )}

          {showCurrentUser && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                That&apos;s you — you can&apos;t add yourself to the project.
              </p>
            </div>
          )}

          {showResults && (
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
              {results.map((member) => (
                <div key={member.id} className="flex min-w-0 items-center gap-3 p-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    disabled={loading === member.workspaceMemberId}
                    onClick={() => handleAdd(member)}
                  >
                    {loading === member.workspaceMemberId ? (
                      <Spinner className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showInvite && (
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">No workspace member found</p>
                <p className="truncate text-xs text-muted-foreground">
                  Send an invitation to <span className="font-medium">{trimmed}</span>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5"
                disabled={loading === "invite"}
                onClick={handleInvite}
              >
                {loading === "invite" ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Invite
              </Button>
            </div>
          )}

          {showNoResults && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No members found. Enter an email address to send an invitation.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
