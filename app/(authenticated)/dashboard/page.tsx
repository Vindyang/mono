"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskFilters } from "@/components/task-filters";
import { PriorityBadge } from "@/components/ui/priority-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, Timer, Circle } from "lucide-react";
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
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
import { toast } from "sonner"; // Assuming sonner is used for toasts based on package.json

function DashboardContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
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

    return tasks.filter((task) => {
      // Search filter
      if (
        search &&
        !task.title.toLowerCase().includes(search)
      )
        return false;

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

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <TaskFilters />

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
