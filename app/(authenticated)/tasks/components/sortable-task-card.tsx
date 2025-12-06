"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types/task";
import { TaskCard } from "./task-card";

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function SortableTaskCard({
  task,
  onEdit,
  onDelete,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30"
      >
        <TaskCard
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="touch-none" {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
