"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/components/task-filters";
import { KanbanBoard } from "./components/kanban-board";
import { TaskModal } from "./components/task-modal";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getTasksData, createTask, updateTask, deleteTask, updateTaskStatus } from "./componentsaction/actions";
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

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { tasks, projects, error } = await getTasksData();
        
        if (error) {
           toast.error(error);
           return;
        }

        if (tasks) setTasks(tasks);
        if (projects) setProjects(projects);
      } catch (error) {
        console.error("Failed to fetch tasks data", error);
        toast.error("Failed to load tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tasks based on search and filters using useMemo
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
        !task.title.toLowerCase().includes(search) &&
        !task.description?.toLowerCase().includes(search)
      ) {
        return false;
      }

      // Project filter
      if (projectId !== "all" && task.projectId !== projectId) {
        return false;
      }

      // Status filter
      if (status !== "all" && task.status !== status) {
        return false;
      }

      // Priority filter
      if (priority !== "all" && task.priority !== priority) {
        return false;
      }

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

  const handleCreateTask = async (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const result = await createTask({
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date ?? null,
      image: data.image ?? null,
      projectId: data.projectId,
    });

    if (result.success && result.task) {
      setTasks([result.task, ...tasks]);
      setIsModalOpen(false);
      toast.success("Task created successfully");
    } else {
      toast.error(result.error || "Failed to create task");
    }
  };

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



  const handleTasksChange = async (newFilteredTasks: Task[]) => {
    // Detect status changes and update database
    const statusChanges: { taskId: string; newStatus: Task["status"] }[] = [];

    newFilteredTasks.forEach((newTask) => {
      const oldTask = tasks.find((t) => t.id === newTask.id);
      if (oldTask && oldTask.status !== newTask.status) {
        statusChanges.push({ taskId: newTask.id, newStatus: newTask.status });
      }
    });

    // Update local state immediately for responsive UI
    setTasks((currentTasks) => {
      const filteredIds = new Set(filteredTasks.map(t => t.id));
      const indices: number[] = [];

      currentTasks.forEach((t, i) => {
        if (filteredIds.has(t.id)) {
          indices.push(i);
        }
      });

      if (indices.length !== newFilteredTasks.length) {
         // Fallback to updating by properties if index alignment fails
         const newTasksMap = new Map(newFilteredTasks.map(t => [t.id, t]));
         return currentTasks.map(t => newTasksMap.get(t.id) || t);
      }

      const nextTasks = [...currentTasks];
      indices.forEach((originalIndex, i) => {
        nextTasks[originalIndex] = newFilteredTasks[i];
      });

      return nextTasks;
    });

    // Persist status changes to database
    if (statusChanges.length > 0) {
      try {
        await Promise.all(
          statusChanges.map(({ taskId, newStatus }) =>
            updateTaskStatus(taskId, newStatus)
          )
        );
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast.error("Failed to update task status");
        // Optionally: revert the local state changes here
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteDialogOpen(true);
    }
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

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  if (!mounted || isLoading) {
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your tasks efficiently
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Kanban Board */}
      <KanbanBoard
        tasks={filteredTasks}
        onTasksChange={handleTasksChange}
        onEdit={openEditModal}
        onDelete={handleDeleteTask}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        projects={projects}
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

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}
