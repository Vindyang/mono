"use client";

import { useState, useEffect } from "react";
import { Plus, Folder, MoreHorizontal, Pencil, Trash2, Calendar, Clock, ArrowRight, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { INITIAL_PROJECTS } from "@/lib/data";
import { NewProjectModal } from "@/app/(authenticated)/projects/components/new-project-modal";

export default function ProjectsPage() {
  const [projects] = useState(INITIAL_PROJECTS);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration error due to dayjs/radix IDs
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your ongoing projects
          </p>
        </div>
        <NewProjectModal />
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
          // ... (existing mapped content)
          const progress = (project.completedTaskCount / project.taskCount) * 100;
          
          return (
            <div 
              key={project.id} 
              className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due {dayjs(project.dueDate).fromNow()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="text-muted-foreground text-sm flex-1 mb-6 line-clamp-2">
                  {project.description}
                </p>

                <div className="mt-auto space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="text-foreground font-bold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                      {project.members.map((avatar, i) => (
                        <img 
                          key={i} 
                          src={avatar} 
                          alt="Member" 
                          className="w-8 h-8 rounded-full border-2 border-card"
                        />
                      ))}
                    </div>
                    <div className="flex items-center text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
                        {project.completedTaskCount}/{project.taskCount} tasks
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                <Button variant="ghost" className="w-full justify-between group/btn hover:bg-background hover:shadow-sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    View Details
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px] bg-card rounded-2xl border border-border">
          <Empty>
            <EmptyMedia>
              <FolderOpen className="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Get started by creating your first project to organize your tasks.
            </EmptyDescription>
          </Empty>
        </div>
      )}
    </div>
  );
}
