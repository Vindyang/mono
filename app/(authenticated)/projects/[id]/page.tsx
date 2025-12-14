"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import Link from "next/link";
import dayjs from "dayjs";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectDetails, ProjectDetailWithTasks } from "./componentsaction/actions";
import { toast } from "sonner";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetailWithTasks | null>(null);

  useEffect(() => {
    setMounted(true);

    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        const { project: projectData, error } = await getProjectDetails(resolvedParams.id);

        if (error) {
          toast.error(error);
          if (error === "Project not found") {
            notFound();
          }
          return;
        }

        if (projectData) {
          setProject(projectData);
        }
      } catch (error) {
        console.error("Failed to fetch project data", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [resolvedParams.id]);

  if (!mounted || isLoading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const progress = project.taskCount > 0
    ? (project.completedTaskCount / project.taskCount) * 100
    : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 md:p-6">
      {/* Back Button */}
      <div>
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-foreground text-muted-foreground group">
          <Link href="/projects" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </Link>
        </Button>
      </div>

      {/* Project Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
          {project.description && (
            <p className="text-lg text-muted-foreground mt-1 w-full">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
          {project.dueDate && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due {dayjs(project.dueDate).format("DD/MM/YYYY")}</span>
              </div>
              <div className="w-px h-4 bg-border" />
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
                {project.members.map((member) => (
                <img
                    key={member.id}
                    src={member.image || `https://i.pravatar.cc/150?u=${member.id}`}
                    alt={member.name}
                    className="w-6 h-6 rounded-full border-2 border-background grayscale hover:grayscale-0 transition-all"
                />
                ))}
            </div>
            <span>{project.members.length} {project.members.length === 1 ? 'Member' : 'Members'}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">Overall Progress</span>
            <span className="font-bold text-muted-foreground">
              {project.taskCount > 0 ? `${Math.round(progress)}%` : "-"}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" indicatorClassName="bg-foreground" />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            {/* Tasks List */}
            <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h2 className="font-semibold text-lg">Project Tasks</h2>
                    <span className="text-xs font-bold bg-foreground text-background px-2.5 py-0.5 rounded-full">
                        {project.tasks.length}
                    </span>
                </div>

                <div className="divide-y divide-border">
                    {project.tasks.length > 0 ? (
                        project.tasks.map((task) => (
                        <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-secondary/30 transition-colors group">
                            <div className="mt-1">
                                {task.status === 'DONE' ? (
                                    <CheckCircle2 className="h-5 w-5 text-foreground" />
                                ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <h3 className={`font-medium text-foreground leading-tight ${task.status === 'DONE' ? 'text-muted-foreground line-through' : ''}`}>
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="font-mono">#{task.id}</span>
                                    {task.priority && (
                                        <>
                                            <span>•</span>
                                            <span className="capitalize">{task.priority} Priority</span>
                                        </>
                                    )}
                                    {task.dueDate && (
                                        <>
                                            <span>•</span>
                                            <span>Due {dayjs(task.dueDate).format("DD/MM/YYYY")}</span>
                                        </>
                                    )}
                                </div>
                                {task.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {task.description}
                                    </p>
                                )}
                            </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg px-3" asChild>
                                        <Link href={`/tasks/${task.id}`}>
                                            View
                                        </Link>
                                    </Button>
                                </div>
                        </div>
                        ))
                    ) : (
                        <div className="p-12">
                            <Empty>
                                <EmptyMedia>
                                    <ClipboardList className="h-12 w-12" />
                                </EmptyMedia>
                                <EmptyTitle>No tasks yet</EmptyTitle>
                                <EmptyDescription>
                                    Create tasks to track progress for this project.
                                </EmptyDescription>
                            </Empty>
                        </div>
                    )}
                </div>
            </div>
        </TabsContent>
        <TabsContent value="members" className="mt-6">
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Project Members</h2>
                </div>
                <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="divide-y divide-border">
                    {project.members.map((member) => (
                      <div key={member.id} className="p-4 flex items-center gap-4">
                        <img
                          src={member.image || `https://i.pravatar.cc/150?u=${member.id}`}
                          alt={member.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{member.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
