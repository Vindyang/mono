"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Circle, CheckCircle2, Timer, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/ui/priority-badge";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";

dayjs.extend(calendar);

// Sample data
const INITIAL_PROJECTS: Project[] = [
  { id: "proj_web", name: "Website Redesign", color: "#3b82f6" },
  { id: "proj_app", name: "Mobile App Launch", color: "#8b5cf6" },
  { id: "proj_mkt", name: "Q4 Marketing Campaign", color: "#10b981" },
];

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Simulate fetching tasks
    setTasks([
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
    ]);
  }, []);

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

    // Find project name from ID
    const project = INITIAL_PROJECTS.find(p => p.id === task.projectId);
    const projectName = project ? project.name : "No Project";

    if (!acc[dateKey][projectName]) {
      acc[dateKey][projectName] = [];
    }

    acc[dateKey][projectName].push(task);
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

  if (!mounted) {
    return null;
  }

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4">
                    <Filter className="h-4 w-4 mr-2" />
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
                  <Button variant="outline" size="sm" className="h-10 rounded-xl border-dashed px-4">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
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
                      className="relative p-4 hover:bg-secondary/30 transition-colors flex items-center gap-4 group/item"
                    >
                      {/* Grouping Indicator */}
                      {projectTasks.length > 1 && (
                        <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col items-center">
                          {index === 0 ? (
                            <>
                              <div className="w-6 h-6 mt-4 rounded-md border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary bg-background z-10">
                                {projectTasks.length}
                              </div>
                              <div className="w-0.5 bg-primary/20 flex-1 -mt-1" />
                            </>
                          ) : (
                            <>
                              <div className="w-0.5 bg-primary/20 h-full absolute top-0 left-1/2 -translate-x-1/2" style={{ height: index === projectTasks.length - 1 ? 'calc(50% - 0.5rem)' : '100%' }} />
                              <div className="absolute top-1/2 left-1/2 w-4 h-4 border-b-2 border-l-2 border-primary/20 rounded-bl-xl -translate-y-1/2 -ml-px" />
                            </>
                          )}
                        </div>
                      )}

                      <div className={`flex-1 ${projectTasks.length > 1 ? "pl-16" : ""}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-foreground">
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              {getStatusIcon(task.status)}
                              <span className="capitalize text-xs text-muted-foreground">
                                {task.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.priority && (
                              <PriorityBadge priority={task.priority} />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 transition-opacity"
                                >
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                          {task.description}
                        </p>
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
