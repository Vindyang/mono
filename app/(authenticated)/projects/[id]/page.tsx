"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ClipboardList, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import Link from "next/link";
import dayjs from "dayjs";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProjectDetails, ProjectDetailWithTasks } from "./componentsaction/actions";
import { TaskModal } from "@/app/(authenticated)/tasks/components/task-modal";
import { createTask, updateTask, deleteTask } from "@/app/(authenticated)/tasks/componentsaction/actions";
import { toast } from "sonner";
import { Task } from "@/lib/types/task";
import { TaskCard } from "@/components/task-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<ProjectDetailWithTasks | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const refreshProjectData = async () => {
    const { project: updatedProject, error: fetchError } = await getProjectDetails(resolvedParams.id);
    if (updatedProject && !fetchError) {
      setProject(updatedProject);
    }
  };

  const handleCreateTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at"> & { assigneeIds?: string[] }) => {
    try {
      const { success, task, error } = await createTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date,
        image: taskData.image ?? null,
        projectId: taskData.projectId,
        assigneeIds: taskData.assigneeIds,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (success && task) {
        toast.success("Task created successfully");
        setIsTaskModalOpen(false);
        await refreshProjectData();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, "id" | "created_at" | "updated_at"> & { assigneeIds?: string[] }) => {
    if (!editingTask) return;

    try {
      const { success, error } = await updateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description ?? null,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.due_date ?? null,
        image: taskData.image ?? null,
        projectId: taskData.projectId,
        assigneeIds: taskData.assigneeIds,
      });

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success("Task updated successfully");
        setIsTaskModalOpen(false);
        setEditingTask(null);
        await refreshProjectData();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      const { success, error } = await deleteTask(taskToDelete.id);

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success("Task deleted successfully");
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
        await refreshProjectData();
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (task: any) => {
    // Convert project task format to Task format
    const taskData: Task = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: task.priority ? task.priority.toLowerCase() as "low" | "medium" | "high" : null,
      due_date: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : null,
      projectId: project?.id || "",
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      image: task.image,
    };
    setEditingTask(taskData);
    setIsTaskModalOpen(true);
  };

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

  const canEditTasks = project.currentUserRole !== "MEMBER";

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] gap-4 md:gap-6 p-4 md:p-6">
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
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{project.name}</h1>
          {project.description && (
            <div className="mt-1 w-full">
              <p className={`text-lg text-muted-foreground ${!isDescriptionExpanded ? 'line-clamp-2 mb-1' : ''}`}>
                {project.description}
              </p>
              {project.description.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-sm text-primary hover:underline mt-1 font-medium inline-block"
                >
                  {isDescriptionExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
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
                <Avatar key={member.id} className="w-6 h-6 border-2 border-background grayscale hover:grayscale-0 transition-all">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
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
                    <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-lg">Project Tasks</h2>
                        <span className="text-xs font-bold bg-foreground text-background px-2.5 py-0.5 rounded-full">
                            {project.tasks.length}
                        </span>
                    </div>
                    <Button
                        onClick={() => setIsTaskModalOpen(true)}
                        size="sm"
                        className="h-8 gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        New Task
                    </Button>
                </div>

                <div className="divide-y divide-border">
                    {project.tasks.length > 0 ? (
                        project.tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={{
                                    id: task.id,
                                    title: task.title,
                                    description: task.description,
                                    status: task.status.toLowerCase() as "todo" | "in_progress" | "done",
                                    priority: task.priority?.toLowerCase() as "low" | "medium" | "high" | undefined,
                                    dueDate: task.dueDate,
                                    assignees: task.assignees,
                                }}
                                showProject={false}
                                showDescription={true}
                                onView={() => router.push(`/tasks/${task.id}`)}
                                onEdit={canEditTasks ? () => openEditModal(task) : undefined}
                                onDelete={canEditTasks ? () => handleDeleteTask(task) : undefined}
                                clickable={true}
                            />
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
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{member.name}</h3>
                            <span className="text-sm text-muted-foreground">({member.email})</span>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
        </TabsContent>
      </Tabs>

      {/* Task Modal (Create/Edit) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        projects={[{
          id: project.id,
          name: project.name,
          color: "#000000",
        }]}
        projectMembers={project.members}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{taskToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
