import { useState } from "react";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Task } from "@/lib/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Add a small delay to show loading state
    setTimeout(() => {
      onDelete(task.id);
    }, 300);
  };

  return (
    <div
      className={`bg-card border border-border p-4 hover:shadow-sm transition-all duration-200 cursor-move rounded-lg ${
        isDeleting ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground text-base leading-tight truncate">
              {task.title}
            </h4>
            <PriorityBadge priority={task.priority} />
          </div>
          {task.description && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
