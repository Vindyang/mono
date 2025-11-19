"use client";

import { useState } from "react";
import { Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete project documentation",
      description: "Write comprehensive documentation for the todo app",
      status: "in_progress",
      priority: "high",
      due_date: "2024-11-20",
      created_at: "2024-11-15",
    },
    {
      id: "2",
      title: "Review pull requests",
      description: "Review and merge pending pull requests",
      status: "todo",
      priority: "medium",
      due_date: "2024-11-18",
      created_at: "2024-11-14",
    },
    {
      id: "3",
      title: "Update dependencies",
      description: "Update all npm packages to latest versions",
      status: "done",
      priority: "low",
      due_date: null,
      created_at: "2024-11-13",
    },
  ]);

  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    search: "",
  });

  const filteredTasks = tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status)
      return false;
    if (filters.priority !== "all" && task.priority !== filters.priority)
      return false;
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-secondary text-secondary-foreground border border-transparent";
      case "in_progress":
        return "bg-background text-foreground border border-foreground";
      case "done":
        return "bg-primary text-primary-foreground border border-primary";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityStyles = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "font-bold underline decoration-2";
      case "medium":
        return "font-medium";
      case "low":
        return "font-normal text-muted-foreground";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your tasks efficiently</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
          <p className="text-2xl font-bold text-foreground mt-2">{tasks.length}</p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            {tasks.filter((t) => t.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            {tasks.filter((t) => t.status === "done").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-10 w-full md:w-64"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(value: string) =>
                setFilters({ ...filters, status: value })
              }
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority}
              onValueChange={(value: string) =>
                setFilters({ ...filters, priority: value })
              }
            >
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No tasks found matching your filters.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{task.title}</h3>
                    {task.description && (
                      <p className="text-muted-foreground text-sm mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                          task.status
                        )}`}
                      >
                        {task.status.replace("_", " ").toUpperCase()}
                      </span>
                      {task.priority && (
                        <span
                          className={`text-xs ${getPriorityStyles(
                            task.priority
                          )}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
