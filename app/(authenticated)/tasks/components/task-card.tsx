"use client";

import { useState } from "react";
import { Calendar, Clock, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/types/task";
import dayjs from "dayjs";

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityStyles = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-background text-foreground border-foreground font-bold underline decoration-2";
      case "medium":
        return "bg-background text-foreground border-foreground font-medium";
      case "low":
        return "bg-background text-muted-foreground border-border font-normal";
      default:
        return "bg-background text-muted-foreground border-border";
    }
  };

  const isOverdue = () => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return dayjs(dateString).format("MMM DD, YYYY");
    } catch {
      return null;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    // Add a small delay to show loading state
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      className={`bg-card border border-border p-3 hover:border-foreground transition-all duration-200 cursor-move ${
        isDeleting ? "opacity-50 scale-95" : ""
      } ${isOverdue() ? "border-l-2 border-l-destructive" : ""}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm leading-tight flex-1">
          {task.title}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-2 hover:bg-secondary"
            >
              <MoreVertical className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-24">
            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="text-xs cursor-pointer text-foreground"
            >
              <Edit className="mr-2 h-3 w-3" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-xs text-destructive cursor-pointer focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.priority && (
            <span
              className={`px-1.5 py-0.5 text-xs border ${getPriorityStyles(
                task.priority
              )}`}
            >
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>

        {task.due_date && (
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue() ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>

      {isOverdue() && (
        <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
          <Clock className="h-3 w-3" />
          <span>Overdue</span>
        </div>
      )}
    </div>
  );
}
