"use client";

import { useState, useEffect } from "react";
import { CalendarView } from "./components/calendar-view";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { INITIAL_PROJECTS, INITIAL_TASKS } from "@/lib/data";
import { Spinner } from "@/components/ui/spinner";

export default function CalendarPage() {
  // In a real app, this would be fetched from an API
  // Using local state to mimic the behavior of the Tasks page for consistency
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects] = useState<Project[]>(INITIAL_PROJECTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTasks(INITIAL_TASKS);
  }, []);

  const handleCreateTask = (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const newTask: Task = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (data: Omit<Task, "id" | "created_at" | "updated_at">, taskId?: string) => {
    // Note: The CalendarView passes the task update which includes the ID via closure or we need to find it differently.
    // However, the TaskModal signature for onSubmit is (data: Omit<Task, "id" ...>)
    // In TasksPage, they handle this by keeping 'editingTask' state.
    // In CalendarView, 'selectedTask' is local state.
    // We need to coordinate how the update happens.
    
    // Actually, CalendarView's onTaskUpdate prop needs to know WHICH task to update.
    // But the current signature in CalendarView is: onTaskUpdate: (data: ...) => void
    // It doesn't receive the ID.
    // Let's look at how I defined it in CalendarView.
    // In CalendarView: onSubmit={selectedTask ? onTaskUpdate : onTaskCreate}
    // So onTaskUpdate receives the data, but we need the ID of selectedTask.
    
    // Wait, let's re-read CalendarView.
    // <TaskModal ... onSubmit={selectedTask ? onTaskUpdate : onTaskCreate} ... />
    // If selectedTask is present, onTaskUpdate is called with the NEW data.
    // But onTaskUpdate in CalendarPage needs to know the ID.
    // I should probably wrap the handler in CalendarView or pass the whole function.
    
    // Let's adjust CalendarView to handle this better or fix it here.
    // I'll write the page first, then maybe tweak CalendarView if needed.
    // But wait, I can just wrap it in CalendarView?
    // "onSubmit={selectedTask ? (data) => onTaskUpdate(data) : onTaskCreate}"
    // But how do I get the ID? detailed in CalendarView?
    // Yes, 'selectedTask.id' is available in CalendarView scope.
    
    // So in CalendarView, I should change the prop signature or the call.
    // Current CalendarView props: onTaskUpdate: (data: Omit<...>) => void;
    // This is insufficient for updating a specific task unless we assume it's the "currently selected one" which the parent doesn't know about easily without lifting state.
    //
    // I'll update CalendarView to pass the ID or handle the wrapper there.
    // Actually, it's better if CalendarView lifts the state of "selectedTask" or exposes a better update handler.
    // Let's modify CalendarView slightly to pass the ID or change the prop to `onUpdateTask(task: Task)`.
    //
    // For now, I will implement a "dumb" version here and then fix CalendarView in the next step to pass the task ID or complete task object.
    // Actually, I can just fix CalendarView in the next step.
    //
    // Let's implement this assuming I'll fix CalendarView to pass (data, taskId).
    // Or even better: (task: Task)
    
    // Let's stick to the current plan:
    // 1. Create Page.
    // 2. Fix CalendarView to pass ID.
    
    // Oh wait, I can't pass (data, taskId) to TaskModal's onSubmit. TaskModal's onSubmit expects (data).
    // So inside CalendarView, the wrapper would be:
    // handleUpdate = (data) => { onTaskUpdate(data, selectedTask.id) }
    
    // So CalendarPage should expect onTaskUpdate to take (data, id).
    // Let's write CalendarPage with that expectation.
    
    console.error("Should be unreachable");
  };

  const handleTaskUpdateWithId = (data: Omit<Task, "id" | "created_at" | "updated_at">, taskId: string) => {
      const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? { ...t, ...data, updated_at: new Date().toISOString() }
        : t
    );
    setTasks(updatedTasks);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 md:p-6">
       <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your tasks by date
          </p>
        </div>

      <div className="flex-1 min-h-0">
        <CalendarView
          tasks={tasks}
          projects={projects}
          onTaskCreate={handleCreateTask}
          onTaskUpdate={handleTaskUpdateWithId}
          onTaskDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
}
