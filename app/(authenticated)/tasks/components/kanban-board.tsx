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
}: {
  column: Column;
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="border border-border bg-card/50 transition-all duration-200 flex flex-col rounded-lg overflow-hidden h-auto xl:h-full"
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
                <div className="py-8">
                  <Empty>
                    <EmptyMedia>
                      {column.id === "todo" && <Circle className="h-10 w-10" />}
                      {column.id === "in_progress" && <Timer className="h-10 w-10" />}
                      {column.id === "done" && <CheckCircle2 className="h-10 w-10" />}
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">No tasks</EmptyTitle>
                  </Empty>
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
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

  const columns: Column[] = [
    { id: "todo", title: "To Do" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
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
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    // console.log("DragOver", active.id, "Over", over.id);

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);

      if (activeTask && overTask && activeTask.status !== overTask.status) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex] = {
            ...newTasks[activeIndex],
            status: tasks[overIndex].status,
          };
          onTasksChange(
            arrayMove(
              newTasks,
              activeIndex,
              overIndex - (activeIndex < overIndex ? 1 : 0)
            )
          );
        }
      } else if (
        activeTask &&
        overTask &&
        activeTask.status === overTask.status
      ) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        onTasksChange(arrayMove(tasks, activeIndex, overIndex));
      }
    }

    // Dropping a Task over a Column
    const isOverColumn = columns.some((col) => col.id === overId);
    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (activeTask && activeTask.status !== overId) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const newTasks = [...tasks];
        newTasks[activeIndex] = {
          ...newTasks[activeIndex],
          status: overId as Task["status"],
        };
        onTasksChange(arrayMove(newTasks, activeIndex, newTasks.length - 1));
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeIndex = tasks.findIndex((t) => t.id === activeId);
    const overIndex = tasks.findIndex((t) => t.id === overId);

    if (
      activeIndex !== -1 &&
      overIndex !== -1 &&
      tasks[activeIndex].status === tasks[overIndex].status
    ) {
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
    [activeId, tasks]
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
            <TabsContent key={column.id} value={column.id} className="flex-1 mt-0 h-full min-h-0 data-[state=inactive]:hidden">
              <KanbanColumn
                column={column}
                tasks={columnTasks[column.id]}
                onEdit={onEdit}
                onDelete={onDelete}
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
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="pointer-events-none cursor-grabbing">
            <TaskCard
                task={activeTask}
                onEdit={onEdit}
                onDelete={onDelete}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
