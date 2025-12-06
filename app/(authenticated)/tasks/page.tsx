"use client";

import { useState, useEffect, useMemo } from "react";
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

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// Sample data
const INITIAL_PROJECTS: Project[] = [
  { id: "proj_web", name: "Website Redesign", color: "#3b82f6" },
  { id: "proj_app", name: "Mobile App Launch", color: "#8b5cf6" },
  { id: "proj_mkt", name: "Q4 Marketing Campaign", color: "#10b981" },
];

const INITIAL_TASKS: Task[] = [
  // Website Redesign Tasks
  {
    id: "1",
    title: "Design System Audit",
    description: "Review current components and identify inconsistencies",
    status: "done",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-20",
    updated_at: "2023-11-25",
  },
  {
    id: "1b",
    title: "Update Color Palette",
    description: "Refine primary and secondary colors for better contrast",
    status: "todo",
    priority: "medium",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-21",
    updated_at: "2023-11-25",
  },
  {
    id: "1c",
    title: "Fix Navigation Bug",
    description: "Menu doesn't close on mobile click",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-22",
    updated_at: "2023-11-25",
  },
  {
    id: "1d",
    title: "Optimize Images",
    description: "Compress hero images for faster load time",
    status: "todo",
    priority: "low",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-23",
    updated_at: "2023-11-25",
  },
  {
    id: "2",
    title: "Homepage Hero Section",
    description: "Design and implement the new hero section with 3D elements",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().add(1, 'day').format("YYYY-MM-DD"), // Tomorrow
    projectId: "proj_web",
    created_at: "2023-11-28",
    updated_at: "2023-11-29",
  },

  // Mobile App Launch Tasks
  {
    id: "4",
    title: "Push Notification Setup",
    description: "Configure Firebase Cloud Messaging for iOS and Android",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today (2nd task for today)
    projectId: "proj_app",
    created_at: "2023-11-25",
    updated_at: "2023-11-27",
  },

  // Q4 Marketing Campaign Tasks
  {
    id: "7",
    title: "Social Media Calendar",
    description: "Plan posts for Instagram, LinkedIn, and Twitter",
    status: "todo",
    priority: "medium",
    due_date: dayjs().add(3, 'day').format("YYYY-MM-DD"), // Next Week (approx)
    projectId: "proj_mkt",
    created_at: "2023-11-15",
    updated_at: "2023-11-29",
  },
];

export default function TasksPage() {
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

    return tasks.filter((task) => {
      // Search filter
      if (
        search &&
        !task.title.toLowerCase().includes(search) &&
        !task.description?.toLowerCase().includes(search)
      ) {
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
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6">
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
