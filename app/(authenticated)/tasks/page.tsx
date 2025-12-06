"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { KanbanBoard } from "./components/kanban-board";
import { TaskModal } from "./components/task-modal";
import { Task, TaskFilters } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";

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
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    search: "",
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setTasks(INITIAL_TASKS);
  }, []);

  // Filter tasks based on search and filters using useMemo
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search filter
      if (
        filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);

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

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t
    );
    setTasks(updatedTasks);
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
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-background"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.status === "all"}
                  onCheckedChange={() => setFilters({ ...filters, status: "all" })}
                >
                  All Statuses
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === "todo"}
                  onCheckedChange={() => setFilters({ ...filters, status: "todo" })}
                >
                  To Do
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === "in_progress"}
                  onCheckedChange={() => setFilters({ ...filters, status: "in_progress" })}
                >
                  In Progress
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.status === "done"}
                  onCheckedChange={() => setFilters({ ...filters, status: "done" })}
                >
                  Done
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-dashed">
                  <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                  Priority
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={filters.priority === "all"}
                  onCheckedChange={() => setFilters({ ...filters, priority: "all" })}
                >
                  All Priorities
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority === "high"}
                  onCheckedChange={() => setFilters({ ...filters, priority: "high" })}
                >
                  High
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority === "medium"}
                  onCheckedChange={() => setFilters({ ...filters, priority: "medium" })}
                >
                  Medium
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filters.priority === "low"}
                  onCheckedChange={() => setFilters({ ...filters, priority: "low" })}
                >
                  Low
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard
        tasks={filteredTasks}
        onStatusChange={handleStatusChange}
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
