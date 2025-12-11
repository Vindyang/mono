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
import { INITIAL_PROJECTS, INITIAL_TASKS } from "@/lib/data";
import { Spinner } from "@/components/ui/spinner";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Sample data replaced by imports

function TasksContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setTasks(INITIAL_TASKS);
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

  const handleCreateTask = (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const newTask: Task = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
  };

  const handleUpdateTask = (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    if (!editingTask) return;

    const updatedTasks = tasks.map((t) =>
      t.id === editingTask.id
        ? { ...t, ...data, updated_at: new Date().toISOString() }
        : t
    );
    setTasks(updatedTasks);
    setEditingTask(null);
    setIsModalOpen(false);
  };



  const handleTasksChange = (newFilteredTasks: Task[]) => {
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
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  if (!mounted) {
    return null;
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
        onTasksChange={setTasks}
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
