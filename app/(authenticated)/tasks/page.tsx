"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanBoard } from "./components/kanban-board";
import { TaskModal } from "./components/task-modal";
import { Task } from "@/lib/types/task";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design new landing page",
      description: "Create a modern, responsive landing page design",
      status: "todo",
      priority: "high",
      due_date: "2024-11-25",
      created_at: "2024-11-15T10:00:00Z",
      updated_at: "2024-11-15T10:00:00Z",
    },
    {
      id: "2",
      title: "Implement user authentication",
      description: "Add login and signup functionality with Supabase",
      status: "in_progress",
      priority: "high",
      due_date: "2024-11-20",
      created_at: "2024-11-14T09:00:00Z",
      updated_at: "2024-11-16T14:30:00Z",
    },
    {
      id: "3",
      title: "Write API documentation",
      description: "Document all API endpoints and usage examples",
      status: "done",
      priority: "medium",
      due_date: null,
      created_at: "2024-11-13T08:00:00Z",
      updated_at: "2024-11-17T16:00:00Z",
    },
    {
      id: "4",
      title: "Setup CI/CD pipeline",
      description: "Configure automated testing and deployment",
      status: "todo",
      priority: "low",
      due_date: "2024-11-30",
      created_at: "2024-11-12T07:00:00Z",
      updated_at: "2024-11-12T07:00:00Z",
    },
    {
      id: "5",
      title: "Optimize database queries",
      description: "Improve performance of slow database queries",
      status: "in_progress",
      priority: "medium",
      due_date: "2024-11-22",
      created_at: "2024-11-11T06:00:00Z",
      updated_at: "2024-11-15T12:00:00Z",
    },
  ]);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter tasks based on search and filters using useMemo
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    if (filters.search) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          (task.description &&
            task.description
              .toLowerCase()
              .includes(filters.search.toLowerCase()))
      );
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    return filtered;
  }, [tasks, filters]);

  const handleCreateTask = (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const handleUpdateTask = (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    if (editingTask) {
      const updatedTask: Task = {
        ...taskData,
        id: editingTask.id,
        created_at: editingTask.created_at,
        updated_at: new Date().toISOString(),
      };
      setTasks(
        tasks.map((task) => (task.id === editingTask.id ? updatedTask : task))
      );
      setEditingTask(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleStatusChange = (taskId: string, newStatus: Task["status"]) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      )
    );
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tasks
          </h1>
          <p className="text-muted-foreground mt-1">Organize your work</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 w-full md:w-64"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <Select
            value={filters.priority}
            onValueChange={(value: string) =>
              setFilters({ ...filters, priority: value })
            }
          >
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
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
        onClose={closeModal}
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  );
}
