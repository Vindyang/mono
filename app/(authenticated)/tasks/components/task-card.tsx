import { PriorityBadge } from "@/components/ui/priority-badge";
import { Task } from "@/lib/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
}: TaskCardProps) {
  return (
    <div
      className="bg-card border border-border p-4 hover:shadow-sm transition-all duration-200 cursor-move rounded-lg"
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
      </div>
    </div>
  );
}
