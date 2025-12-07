"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { INITIAL_PROJECTS, INITIAL_TASKS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Folder, Tag, Hash, MoreHorizontal, MessageSquare } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Separator } from "@/components/ui/separator";

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const task = INITIAL_TASKS.find((t) => t.id === resolvedParams.id);
  const project = INITIAL_PROJECTS.find((p) => p.id === task?.projectId);

  if (!task) {
    if (mounted) notFound();
    return null;
  }

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-6 max-w-7xl mx-auto">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Button 
            variant="ghost" 
            size="sm"
            className="pl-0 hover:bg-transparent hover:text-foreground text-muted-foreground group -ml-2"
            onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {project ? (
                <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5" />
                    {project.name}
                </Link>
            ) : (
                <span className="flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" />
                    No Project
                </span>
            )}
            <span>/</span>
            <span className="font-mono text-xs">{task.id}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Header Section */}
            <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">{task.title}</h1>
                
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm">
                    {/* Status */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground hidden sm:block">Status:</span>
                        {task.status === 'done' ? (
                             <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                             </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-foreground text-sm font-medium capitalize">
                                <Circle className="h-4 w-4 text-muted-foreground shadow-none" />
                                {task.status.replace('_', ' ')}
                            </div>
                        )}
                    </div>
                    
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    
                    {/* Priority */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground hidden sm:block">Priority:</span>
                        <PriorityBadge priority={task.priority} />
                    </div>

                    <Separator orientation="vertical" className="h-4 hidden sm:block" />

                    {/* Due Date */}
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{dayjs(task.due_date).format("MMM D, YYYY")}</span>
                        {task.due_date && (
                            <span className="text-muted-foreground">({dayjs(task.due_date).fromNow()})</span>
                        )}
                    </div>

                    {/* Project Link - Pushed to end if space allows, or wrapped */}
                    {project && (
                        <>
                            <Separator orientation="vertical" className="h-4 hidden sm:block" />
                            <Link href={`/projects/${project.id}`} className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors font-medium ml-auto">
                                <Folder className="h-4 w-4 text-muted-foreground" />
                                <span>{project.name}</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Description Card */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm min-h-[300px]">
                <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Description
                </h2>
                <div className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {task.description || "No description provided."}
                </div>
            </div>
      </div>
    </div>
  );
}
