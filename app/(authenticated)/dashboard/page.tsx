"use client";

import { useState } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Circle, CheckCircle2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/ui/priority-badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(relativeTime);
dayjs.extend(calendar);

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  created_at: string;
  project?: string;
}

export default function DashboardPage() {
  const [tasks] = useState<Task[]>([
    {
      id: "1",
      title: "Wireframe for Website Design",
      description: "Create low-fidelity wireframes for the new landing page",
      status: "in_progress",
      priority: "high",
      due_date: dayjs().format("YYYY-MM-DD"),
      created_at: "2024-11-15",
      project: "Website Redesign",
    },
    {
      id: "2",
      title: "Contact Us Page",
      description: "Implement the contact form and map integration",
      status: "todo",
      priority: "medium",
      due_date: dayjs().format("YYYY-MM-DD"),
      created_at: "2024-11-14",
      project: "Website Redesign",
    },
    {
      id: "3",
      title: "Create Tool Tips for New User Flow",
      description: "Add helpful tooltips for the onboarding process",
      status: "done",
      priority: "low",
      due_date: dayjs().format("YYYY-MM-DD"),
      created_at: "2024-11-13",
      project: "Website Redesign",
    },
    {
      id: "4",
      title: "Payment Method Flow",
      description: "Integrate Stripe payment gateway",
      status: "todo",
      priority: "high",
      due_date: dayjs().format("YYYY-MM-DD"),
      created_at: "2024-11-12",
      project: "Mobile App Launch",
    },
    {
      id: "5",
      title: "Update dependencies",
      description: "Update all npm packages to latest versions",
      status: "done",
      priority: "low",
      due_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      created_at: "2024-11-13",
      project: "System Maintenance",
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

    const projectKey = task.project || "No Project";
    if (!acc[dateKey][projectKey]) {
      acc[dateKey][projectKey] = [];
    }

    acc[dateKey][projectKey].push(task);
    return acc;
  }, {} as Record<string, Record<string, Task[]>>);



  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "in_progress":
        return <Timer className="h-5 w-5 text-blue-500" />;
      case "todo":
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your tasks efficiently
          </p>
        </div>
        <Button size="lg" className="rounded-xl px-6">
          <Plus className="mr-2 h-5 w-5" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-base font-medium text-muted-foreground">
            Total Tasks
          </h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {tasks.length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-base font-medium text-muted-foreground">
            In Progress
          </h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {tasks.filter((t) => t.status === "in_progress").length}
          </p>
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <h3 className="text-base font-medium text-muted-foreground">
            Completed
          </h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {tasks.filter((t) => t.status === "done").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search tasks..."
                className="pl-12 w-full h-10 text-base rounded-xl"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={filters.status}
                onValueChange={(value: string) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger className="w-[140px] h-10 rounded-xl">
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
                <SelectTrigger className="w-[140px] h-10 rounded-xl">
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
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).flatMap(([date, projects]) =>
          Object.entries(projects).map(([project, projectTasks]) => (
            <div
              key={`${date}-${project}`}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{date}</h2>
                  {project !== "No Project" && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-lg font-medium text-primary">
                        {project}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Totals:{" "}
                  <span className="text-foreground ml-2 font-bold">
                    {projectTasks.length} Tasks
                  </span>
                </div>
              </div>
              <div className="divide-y divide-border">
                <div className="group relative">
                  {projectTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-secondary/30 transition-colors flex items-center gap-4 group/item"
                    >
                      {/* Grouping Indicator */}
                      {projectTasks.length > 1 && (
                        <div className="absolute left-4 top-4 bottom-4 w-8 flex flex-col items-center">
                          {index === 0 && (
                            <div className="w-6 h-6 rounded-md border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary bg-background z-10">
                              {projectTasks.length}
                            </div>
                          )}
                          {index < projectTasks.length - 1 && (
                            <div className="w-0.5 bg-primary/20 flex-1 my-1" />
                          )}
                          {index === projectTasks.length - 1 && (
                            <div className="w-3 h-3 rounded-bl-lg border-l-2 border-b-2 border-primary/20 absolute top-0 left-1/2 -translate-x-1/2" />
                          )}
                        </div>
                      )}

                      <div
                        className={`flex-1 flex items-center justify-between ${
                          projectTasks.length > 1 ? "ml-10" : ""
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="mr-4 shrink-0">
                          {getStatusIcon(task.status)}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <div className="flex items-center gap-3">
                            <h3
                              className={`text-base font-medium truncate ${
                                task.status === "done"
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </h3>
                            <PriorityBadge priority={task.priority} />
                          </div>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mt-0.5 truncate">
                              {task.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
        {Object.keys(groupedTasks).length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
            No tasks found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
