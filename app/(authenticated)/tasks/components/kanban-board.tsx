"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Task } from "@/lib/types/task";
import { SortableTaskCard } from "./sortable-task-card";
import { TaskCard } from "./task-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Timer } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

interface Column {
  id: Task["status"];
  title: string;
}

function KanbanColumn({
  column,
  tasks,
  onEdit,
  onDelete,
  activeId,
  overId,
}: {
  column: Column;
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  activeId: string | null;
  overId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  // Determine if active task is currently being dragged over this column
  // but not over a specific task within it
  const isActiveOverColumn = isOver && overId === column.id;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border bg-card/50 transition-all duration-200 flex flex-col rounded-lg overflow-hidden h-auto xl:h-full",
        isActiveOverColumn && tasks.length > 0
          ? "border-primary/50 ring-2 ring-primary/20 shadow-lg shadow-primary/10"
          : "border-border",
      )}
    >
      {/* Column Header */}
      <div className="p-3 text-foreground bg-secondary/50 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg tracking-wide text-foreground">
            {column.title}
          </h3>
          <span className="text-xs font-medium px-2 py-0.5 bg-background border border-border text-foreground rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 min-h-0 flex flex-col">
        <SortableContext
          id={column.id}
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ScrollArea className="flex-1">
            <div className="space-y-2 pb-4 min-h-[100px]">
              {tasks.length === 0 ? (
                isActiveOverColumn ? (
                  <div className="h-20 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Drop here
                    </span>
                  </div>
                ) : (
                  <div className="py-8">
                    <Empty>
                      <EmptyMedia>
                        {column.id === "todo" && (
                          <Circle className="h-10 w-10" />
                        )}
                        {column.id === "in_progress" && (
                          <Timer className="h-10 w-10" />
                        )}
                        {column.id === "done" && (
                          <CheckCircle2 className="h-10 w-10" />
                        )}
                      </EmptyMedia>
                      <EmptyTitle className="text-sm">No tasks</EmptyTitle>
                    </Empty>
                  </div>
                )
              ) : (
                <>
                  {tasks.map((task) => (
                    <div key={task.id} className="relative">
                      {/* Drop placeholder — shown above the task being hovered */}
                      {activeId &&
                        activeId !== task.id &&
                        overId === task.id && (
                          <div className="h-2 w-full rounded-md bg-primary/20 border border-dashed border-primary/40 mb-2 transition-all duration-150" />
                        )}
                      <SortableTaskCard
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  ))}
                  {/* Drop placeholder at the end of column when hovering column itself */}
                  {isActiveOverColumn && (
                    <div className="h-2 w-full rounded-md bg-primary/20 border border-dashed border-primary/40 mt-1 transition-all duration-150" />
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onTasksChange,
  onEdit,
  onDelete,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const columns: Column[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor),
  );

  const columnTasks = useMemo(() => {
    const tasksByColumn: Record<string, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    tasks.forEach((task) => {
      if (tasksByColumn[task.status]) {
        tasksByColumn[task.status].push(task);
      }
    });

    return tasksByColumn;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const dragActiveId = active.id;
    const dragOverId = over.id;

    if (dragActiveId === dragOverId) return;

    const activeIndex = tasks.findIndex((t) => t.id === dragActiveId);
    const isOverColumn = columns.some((col) => col.id === dragOverId);
    const isOverTask = !isOverColumn;

    if (activeIndex === -1) return;

    // Case 1: Dropping over a Column (cross-column or same-column reorder to end)
    if (isOverColumn) {
      const targetColumn = dragOverId as Task["status"];
      const activeTask = tasks[activeIndex];

      if (activeTask.status !== targetColumn) {
        // Cross-column: change status and move to end of target column
        const newTasks = [...tasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          status: targetColumn,
        };
        onTasksChange(arrayMove(newTasks, activeIndex, newTasks.length - 1));
      }
      return;
    }

    // Case 2: Dropping over a Task
    const overIndex = tasks.findIndex((t) => t.id === dragOverId);
    if (overIndex === -1) return;

    const activeTask = tasks[activeIndex];
    const overTask = tasks[overIndex];

    if (activeTask.status !== overTask.status) {
      // Cross-column: change status and position
      const newTasks = [...tasks];
      newTasks[activeIndex] = {
        ...newTasks[activeIndex],
        status: overTask.status,
      };
      const adjustedOverIndex = overIndex - (activeIndex < overIndex ? 1 : 0);
      onTasksChange(arrayMove(newTasks, activeIndex, adjustedOverIndex));
    } else {
      // Same-column: reorder
      onTasksChange(arrayMove(tasks, activeIndex, overIndex));
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId),
    [activeId, tasks],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Mobile/Tablet View (Tabs) */}
      <div className="block xl:hidden h-full">
        <Tabs defaultValue="todo" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
          </TabsList>
          {columns.map((column) => (
            <TabsContent
              key={column.id}
              value={column.id}
              className="flex-1 mt-0 h-full min-h-0 data-[state=inactive]:hidden"
            >
              <KanbanColumn
                column={column}
                tasks={columnTasks[column.id]}
                onEdit={onEdit}
                onDelete={onDelete}
                activeId={activeId}
                overId={overId}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Desktop View (Grid) */}
      <div className="hidden xl:grid grid-cols-3 gap-8 h-full min-h-0">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTasks[column.id]}
            onEdit={onEdit}
            onDelete={onDelete}
            activeId={activeId}
            overId={overId}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="pointer-events-none cursor-grabbing">
            <TaskCard task={activeTask} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
