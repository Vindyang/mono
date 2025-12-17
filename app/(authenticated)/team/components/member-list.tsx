"use client";

import { cn } from "@/lib/utils";

import { TeamMember } from "@/lib/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { MoreHorizontal, Mail, Search, Pencil, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface MemberListProps {
  members: TeamMember[];
  currentUserId?: string;
  currentUserRole?: string;
  hideProjects?: boolean;
}

export function MemberList({ members, currentUserId, currentUserRole, hideProjects = false }: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-black"
                />
            </div>
             <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-black">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
        </div>

    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden">
      <div className="grid grid-cols-12 gap-4 border-b border-zinc-200 bg-zinc-50/50 p-4 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
        <div className={cn("col-span-5", hideProjects ? "md:col-span-6" : "md:col-span-3")}>Member</div>
        <div className="col-span-3 hidden md:block">Role</div>
        {!hideProjects && <div className="col-span-3 hidden md:block">Projects</div>}
        <div className="col-span-2 hidden md:block">Status</div>
        {/* <div className="col-span-7 md:col-span-1 text-right">Actions</div> */ }
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
            <div
                key={member.id}
                className="grid grid-cols-12 items-center gap-4 p-4 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
                {/* Member Info */}
                <div className={cn("col-span-5 flex items-center gap-3", hideProjects ? "md:col-span-6" : "md:col-span-3")}>
                <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {member.name}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {member.email}
                    </span>
                </div>
                </div>
                
                {/* Role */}
                <div className="col-span-3 hidden md:block">
                <Badge variant="outline" className="capitalize font-normal text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800">
                    {member.role}
                </Badge>
                </div>
                
                {/* Projects */}
                {!hideProjects && (
                <div className="col-span-3 hidden md:block">
                    <div className="flex flex-wrap gap-1">
                        {member.projects && member.projects.length > 0 ? (
                            member.projects.map(project => (
                                <Badge key={project.id} variant="secondary" className="text-[10px] px-1.5 h-5 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">
                                    {project.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">No projects</span>
                        )}
                    </div>
                </div>
                )}

                {/* Status */}
                <div className="col-span-2 hidden md:block">
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                            member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_0_rgba(16,185,129,0.5)]' : 
                            member.status === 'busy' ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`} />
                        <span className="capitalize text-zinc-600 dark:text-zinc-400">
                            {member.status}
                        </span>
                    </div>
                </div>
                
                {/* Actions */ }
                {/* <div className="col-span-7 flex justify-end md:col-span-1">
                {member.id !== currentUserId && currentUserRole === "Owner" && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        Remove Member
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
                </div> */}
            </div>
            ))
        ) : (
             <div className="p-12">
                <Empty>
                  <EmptyMedia>
                    <Users className="h-12 w-12" />
                  </EmptyMedia>
                  <EmptyTitle>No members found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || roleFilter !== "all"
                      ? "Try adjusting your search or filters to find team members."
                      : "Get started by inviting team members to collaborate."}
                  </EmptyDescription>
                </Empty>
            </div>
        )}
      </div>
    </div>
    </div>
  );
}
