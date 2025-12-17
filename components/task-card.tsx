"use client";

import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Circle, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";

interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string | null;
    status: "todo" | "in_progress" | "done";
    priority?: "low" | "medium" | "high" | null;
    dueDate?: string;
    assignees?: TaskAssignee[];
  };
  project?: {
    id: string;
    name: string;
    color?: string;
  };
  showProject?: boolean;
  showDescription?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  clickable?: boolean;
  showDueDate?: boolean;
}

export function TaskCard({
  task,
  project,
  showProject = false,
  showDescription = true,
  onEdit,
  onDelete,
  onView,
  clickable = true,
  showDueDate = true,
}: TaskCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (clickable && onView) {
      onView();
    } else if (clickable) {
      router.push(`/tasks/${task.id}`);
    }
  };

  const getPriorityStyles = (priority?: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400";
      case "low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <div
      className={`p-5 hover:bg-secondary/30 transition-all group relative ${
        clickable ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        {/* Status Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Quick status toggle
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Title and ID Row */}
          <div className="flex items-start justify-between gap-3 pr-10">
            <h3
              className={`font-semibold text-base leading-tight ${
                task.status === "done"
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded flex-shrink-0">
              #{task.id}
            </span>
          </div>

          {/* Description */}
          {showDescription && task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Project Badge (if showProject) */}
            {showProject && project && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-secondary/50"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/projects/${project.id}`);
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color || "#3b82f6" }}
                />
                <span>{project.name}</span>
              </div>
            )}

            {/* Priority Badge */}
            {task.priority && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${getPriorityStyles(
                  task.priority
                )}`}
              >
                <span className="capitalize">{task.priority}</span>
              </span>
            )}

            {/* Due Date */}
            {showDueDate && task.dueDate && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{dayjs(task.dueDate).format("MMM D")}</span>
              </div>
            )}

            {/* Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {task.assignees.slice(0, 3).map((assignee) => (
                    <Avatar
                      key={assignee.id}
                      className="w-7 h-7 border-2 border-background ring-1 ring-border"
                      title={assignee.name}
                    >
                      <AvatarImage src={assignee.image} alt={assignee.name} />
                      <AvatarFallback className="text-xs">
                        {assignee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignees.length > 3 && (
                    <div
                      className="w-7 h-7 rounded-full bg-muted border-2 border-background ring-1 ring-border flex items-center justify-center"
                      title={`+${task.assignees.length - 3} more`}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        +{task.assignees.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        {(onEdit || onDelete || onView) && (
          <div className="absolute top-4 right-4 animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
