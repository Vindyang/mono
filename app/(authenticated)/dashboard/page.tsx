"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Search } from "lucide-react";
import { TaskFilters } from "@/components/task-filters";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { TaskCard } from "@/components/task-card";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { useSearchParams } from "next/navigation";

dayjs.extend(calendar);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Sample data removed
// const INITIAL_PROJECTS: Project[] = [ ... ];

import { getDashboardData } from "./componentsaction/actions";
import { updateTask, deleteTask } from "../tasks/componentsaction/actions";
import { toast } from "sonner";
import { TaskModal } from "../tasks/components/task-modal";
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

function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { tasks, projects, error } = await getDashboardData();
        
        if (error) {
          toast.error(error);
          return;
        }

        if (tasks) setTasks(tasks);
        if (projects) setProjects(projects);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "all";
    const priority = searchParams.get("priority") || "all";
    const dueDate = searchParams.get("dueDate") || "all";
    const projectId = searchParams.get("projectId") || "all";

    return tasks.filter((task) => {
      // Search filter
      if (
        search &&
        !task.title.toLowerCase().includes(search)
      )
        return false;

      // Project filter
      if (projectId !== "all" && task.projectId !== projectId) {
        return false;
      }

      // Status filter
      if (status !== "all" && task.status !== status)
        return false;

      // Priority filter
      if (priority !== "all" && task.priority !== priority)
        return false;

      // Due Date filter
      if (dueDate !== "all") {
        if (!task.due_date) return false;
        const taskDate = dayjs(task.due_date);
        const today = dayjs();

        if (dueDate === "today") {
          if (!taskDate.isSame(today, "day")) return false;
        } else if (dueDate === "week") {
          if (!taskDate.isSame(today, "week")) return false;
        } else if (dueDate === "overdue") {
          // Overdue means strictly before today and not done
          if (!taskDate.isBefore(today, "day") || task.status === "done") return false;
        }
      }

      return true;
    });
  }, [tasks, searchParams]);

  const handleUpdateTask = async (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!editingTask) return;

    const result = await updateTask(editingTask.id, {
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date ?? null,
      image: data.image ?? null,
      projectId: data.projectId,
    });

    if (result.success && result.task) {
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id ? result.task! : t
      );
      setTasks(updatedTasks);
      setEditingTask(null);
      setIsModalOpen(false);
      toast.success("Task updated successfully");
    } else {
      toast.error(result.error || "Failed to update task");
    }
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    const result = await deleteTask(taskToDelete.id);

    if (result.success) {
      const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
      setTasks(updatedTasks);
      toast.success("Task deleted successfully");
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } else {
      toast.error(result.error || "Failed to delete task");
    }
    setIsDeleting(false);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Group tasks by Date -> Project
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const dateKey = task.due_date
      ? dayjs(task.due_date).calendar(null, {
          sameDay: "[Today], D MMM YYYY",
          nextDay: "[Tomorrow], D MMM YYYY",
          nextWeek: "dddd, D MMM YYYY",
          lastDay: "[Yesterday], D MMM YYYY",
          lastWeek: "[Last] dddd, D MMM YYYY",
          sameElse: "D MMM YYYY",
        })
      : "No Due Date";

    if (!acc[dateKey]) {
      acc[dateKey] = {};
    }

    // Find project name from ID
    const project = projects.find(p => p.id === task.projectId);
    const projectName = project ? project.name : "No Project";

    if (!acc[dateKey][projectName]) {
      acc[dateKey][projectName] = [];
    }

    acc[dateKey][projectName].push(task);
    return acc;
  }, {} as Record<string, Record<string, Task[]>>);


  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 w-full md:h-[calc(100dvh-7rem)] md:overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your tasks efficiently
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 shrink-0">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between md:block">
          <h3 className="text-base font-medium text-muted-foreground">
            Total Tasks
          </h3>
          <p className="text-3xl font-bold text-foreground mt-0 md:mt-2">
            {tasks.length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between md:block">
          <h3 className="text-base font-medium text-muted-foreground">
            In Progress
          </h3>
          <p className="text-3xl font-bold text-foreground mt-0 md:mt-2">
            {tasks.filter((t) => t.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center justify-between md:block">
          <h3 className="text-base font-medium text-muted-foreground">
            Completed
          </h3>
          <p className="text-3xl font-bold text-foreground mt-0 md:mt-2">
            {tasks.filter((t) => t.status === "done").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <TaskFilters projects={projects} />
      </div>

      {/* Task List */}
      <div className="space-y-6 flex-1 md:overflow-y-auto md:min-h-0 md:pr-2">
        {Object.entries(groupedTasks).flatMap(([date, projectsGroup]) =>
          Object.entries(projectsGroup).map(([project, projectTasks]) => (
            <div
              key={`${date}-${project}`}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30 flex flex-wrap items-center gap-x-2 gap-y-1">
                {/* Date - Full width on mobile */}
                <h2 className="text-lg font-semibold text-foreground order-1 w-full md:w-auto">{date}</h2>
                
                {/* Project - Third on mobile (new line), Second on desktop */}
                {project !== "No Project" && (
                  <div className="order-2 w-full md:w-auto md:order-2 flex items-center gap-2">
                    <span className="hidden md:inline text-muted-foreground">•</span>
                    <span className="text-lg font-medium text-primary">
                      {project}
                    </span>
                  </div>
                )}
                
                {/* Totals - Third on mobile (new line), Third on desktop (far right) */}
                <div className="text-sm text-muted-foreground font-medium order-3 w-full md:w-auto md:ml-auto md:order-3">
                  Totals:{" "}
                  <span className="text-foreground ml-2 font-bold">
                    {projectTasks.length} Tasks
                  </span>
                </div>
              </div>
              <div className="divide-y divide-border">
                {projectTasks.map((task) => {
                  const taskProject = projects.find((p: Project) => p.id === task.projectId);
                  return (
                    <TaskCard
                      key={task.id}
                      task={{
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        status: task.status,
                        priority: task.priority,
                        dueDate: task.due_date || undefined,
                        assignees: task.assignees,
                      }}
                      project={taskProject}
                      showProject={false}
                      showDueDate={false}
                      showDescription={true}
                      onEdit={() => openEditModal(task)}
                      onDelete={() => handleDeleteTask(task)}
                      clickable={false}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
        {Object.keys(groupedTasks).length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-12">
            <Empty>
              <EmptyMedia>
                <Search className="h-12 w-12" />
              </EmptyMedia>
              <EmptyTitle>No tasks found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your filters or create a new task to get started.
              </EmptyDescription>
            </Empty>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        projects={projects}
        onSubmit={handleUpdateTask}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task &ldquo;{taskToDelete?.title}&rdquo;. This action cannot be undone.
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

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
