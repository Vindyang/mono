"use client";

import { useState } from "react";
import { Plus, Folder, MoreHorizontal, Pencil, Trash2, Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// Sample Data
const INITIAL_PROJECTS: (Project & { 
    description: string; 
    taskCount: number; 
    completedTaskCount: number; 
    dueDate: string;
    members: string[]; 
})[] = [
  { 
    id: "proj_web", 
    name: "Website Redesign", 
    color: "#3b82f6",
    description: "Complete overhaul of the corporate website including new branding and improved UX.",
    taskCount: 12,
    completedTaskCount: 8,
    dueDate: dayjs().add(2, 'week').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=3"]
  },
  { 
    id: "proj_app", 
    name: "Mobile App Launch", 
    color: "#8b5cf6",
    description: "Development and launch of the new iOS and Android mobile applications.",
    taskCount: 24,
    completedTaskCount: 10,
    dueDate: dayjs().add(1, 'month').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=4", "https://i.pravatar.cc/150?u=1"]
  },
  { 
    id: "proj_mkt", 
    name: "Q4 Marketing Campaign", 
    color: "#10b981",
    description: "Strategic marketing campaign for Q4 including social media, email, and ads.",
    taskCount: 18,
    completedTaskCount: 2,
    dueDate: dayjs().add(3, 'week').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=5", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=6", "https://i.pravatar.cc/150?u=7"]
  },
];

export default function ProjectsPage() {
  const [projects] = useState(INITIAL_PROJECTS);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Projects
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage and track your ongoing projects
          </p>
        </div>
        <Button size="lg" className="rounded-xl px-6">
          <Plus className="mr-2 h-5 w-5" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
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

        {/* Create New Project Card (Alternative Entry) */}
        <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all h-full min-h-[300px] gap-4 group text-muted-foreground hover:text-primary">
          <div className="w-16 h-16 rounded-full bg-secondary group-hover:bg-background flex items-center justify-center transition-colors shadow-sm">
            <Plus className="h-8 w-8" />
          </div>
          <div className="text-center">
             <h3 className="font-semibold text-lg">Create New Project</h3>
             <p className="text-sm mt-1 max-w-[200px]">Start a new initiative and invite your team</p>
          </div>
        </button>
      </div>
    </div>
  );
}
