"use client";

import { useState, useEffect } from "react";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task } from "@/lib/types/task";

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

interface Column {
  id: Task["status"];
  title: string;
  tasks: Task[];
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task["status"] | null>(
    null
  );

  const columns: Column[] = [
    {
      id: "todo",
      title: "To Do",
      tasks: tasks.filter((task) => task.status === "todo"),
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: tasks.filter((task) => task.status === "in_progress"),
    },
    {
      id: "done",
      title: "Done",
      tasks: tasks.filter((task) => task.status === "done"),
    },
  ];

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: Task["status"]) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: Task["status"]) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedTask && draggedTask.status !== columnId) {
      onStatusChange(draggedTask.id, columnId);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getColumnStyles = (columnId: Task["status"]) => {
    switch (columnId) {
      case "todo":
        return "border-border bg-card/50";
      case "in_progress":
        return "border-border bg-card/50";
      case "done":
        return "border-border bg-card/50";
      default:
        return "border-border bg-card/50";
    }
  };

  const getColumnHeaderStyles = (columnId: Task["status"]) => {
    switch (columnId) {
      case "todo":
        return "text-foreground bg-secondary/50 border-b border-border";
      case "in_progress":
        return "text-foreground bg-secondary/50 border-b border-border";
      case "done":
        return "text-foreground bg-secondary/50 border-b border-border";
      default:
        return "text-foreground bg-secondary/50 border-b border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`border ${getColumnStyles(column.id)} ${
            dragOverColumn === column.id
              ? "ring-1 ring-offset-1 ring-ring"
              : ""
          } transition-all duration-200 flex flex-col rounded-lg overflow-hidden`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className={`p-3 ${getColumnHeaderStyles(column.id)}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm tracking-wide text-foreground">
                {column.title}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-background border border-border text-foreground rounded-full">
                {column.tasks.length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {column.tasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="text-xs">No tasks</p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
