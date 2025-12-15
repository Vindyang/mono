"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Mail, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { getUserOwnedProjects, createInvitation } from "../componentsaction/actions";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Project {
  id: string;
  name: string;
  color: string;
}

export function InviteModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch projects when modal opens
  useEffect(() => {
    if (open) {
      setIsLoadingProjects(true);
      getUserOwnedProjects()
        .then((data) => {
          if (data.projects) {
            setProjects(data.projects);
          }
        })
        .catch((error) => {
          console.error("Failed to load projects:", error);
          toast.error("Failed to load projects");
        })
        .finally(() => {
          setIsLoadingProjects(false);
        });
    }
  }, [open]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createInvitation(email, role, selectedProjectIds);

      if (result.success) {
        toast.success(`Invitation sent to ${email}`);
        setOpen(false);
        setEmail("");
        setRole("Member");
        setSelectedProjectIds([]);
        router.refresh(); // Refresh to update the invitations list
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const removeProject = (projectId: string) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const selectedProjects = projects.filter((p) =>
    selectedProjectIds.includes(p.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleInvite}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation link to a new team member. They can join once
              they accept.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projects">Projects (Optional)</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="projects"
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={isLoadingProjects}
                  >
                    {isLoadingProjects ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4" />
                        Loading projects...
                      </span>
                    ) : selectedProjectIds.length > 0 ? (
                      <span className="truncate">
                        {selectedProjectIds.length} project
                        {selectedProjectIds.length > 1 ? "s" : ""} selected
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Select projects
                      </span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-64 overflow-auto p-2">
                    {projects.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No projects available
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {projects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => toggleProject(project.id)}
                            className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-accent transition-colors"
                          >
                            <div
                              className="h-3 w-3 rounded-full shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                            <span className="flex-1 text-left">
                              {project.name}
                            </span>
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${
                                selectedProjectIds.includes(project.id)
                                  ? "bg-primary border-primary"
                                  : "border-input"
                              }`}
                            >
                              {selectedProjectIds.includes(project.id) && (
                                <svg
                                  className="h-3 w-3 text-primary-foreground"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProjects.map((project) => (
                    <Badge
                      key={project.id}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                      <button
                        type="button"
                        onClick={() => removeProject(project.id)}
                        className="ml-1 rounded-sm hover:bg-accent p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
