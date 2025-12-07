"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { TaskModal } from "../../tasks/components/task-modal";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskCreate: (data: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onTaskUpdate: (data: Omit<Task, "id" | "created_at" | "updated_at">, taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
}

export function CalendarView({
  tasks,
  projects,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<string | null>(null);

  const getProjectColor = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.color || "#e5e7eb";
  };

  const handleDayClick = (day: Date) => {
    setInitialDateForNewTask(dayjs(day).format("YYYY-MM-DD"));
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleTaskClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setInitialDateForNewTask(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex-1 overflow-hidden bg-background border rounded-lg shadow-sm">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={(date) => date && setCurrentDate(date)}
          month={currentDate}
          onMonthChange={setCurrentDate}
          className="w-full h-full p-0"
          classNames={{
            months: "w-full h-full flex flex-col", // Ensure months container is full height
            month: "w-full h-full flex flex-col",
            caption: "flex justify-between py-4 relative items-center px-4 border-b border-border", // Added border-b and padding
            caption_label: "text-lg font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button_previous: "static",
            nav_button_next: "static",
            table: "w-full h-full border-collapse flex flex-col", // Removed redundant borders that conflict with cell borders if not careful, sticking to clean grid
            head_row: "flex w-full shrink-0 border-b border-border",
            head_cell: "text-muted-foreground w-full font-normal text-sm uppercase tracking-wider text-center py-3 bg-muted/5 border-r border-border last:border-r-0", // Clean headers with bg
            row: "flex w-full flex-1 min-h-0 border-b border-border last:border-b-0", // Row borders, min-h-0 to enforce strict flex distribution
            tbody: "flex flex-col flex-1 w-full",
            cell: "w-full h-full p-0 relative flex flex-col flex-1 border-r border-border last:border-r-0 [&:has([aria-selected])]:bg-transparent focus-within:relative focus-within:z-20", // Cell borders
            day: "h-full w-full p-2 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-muted/50 transition-colors text-left flex-1 bg-background",
            day_today: "bg-accent/5",
            day_selected: "bg-transparent text-foreground hover:bg-muted/50 hover:text-foreground focus:bg-transparent focus:text-foreground",
            day_outside: "text-muted-foreground opacity-50 bg-muted/5",
          }}
          components={{
            DayContent: (props) => {
                const day = props.date;
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const dayTasks = tasks.filter((task) =>
                    task.due_date ? dayjs(task.due_date).isSame(day, "day") : false
                );

                return (
                    <div className="w-full h-full flex flex-col gap-1.5" onClick={() => handleDayClick(day)}>
                         <span className={cn(
                             "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full ml-1 mt-1",
                              dayjs(day).isSame(dayjs(), 'day') ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                         )}>
                             {day.getDate()}
                         </span>
                         <div className="flex flex-col gap-1 w-full overflow-hidden px-2 pb-2">
                             {(() => {
                                 // Sort tasks: High priority first
                                 const sortedTasks = [...dayTasks].sort((a, b) => {
                                     if (a.priority === 'high' && b.priority !== 'high') return -1;
                                     if (a.priority !== 'high' && b.priority === 'high') return 1;
                                     return 0;
                                 });

                                 const taskToShow = sortedTasks[0];
                                 const remainingTasks = sortedTasks.slice(1);
                                 const remainingCount = remainingTasks.length;

                                 if (!taskToShow) return null;

                                 return (
                                     <>
                                         <div
                                             key={taskToShow.id}
                                             className="group bg-card hover:bg-accent text-card-foreground text-xs p-1.5 rounded border border-border shadow-sm cursor-pointer transition-all flex items-center gap-2 w-full overflow-hidden"
                                             onClick={(e) => handleTaskClick(e, taskToShow)}
                                         >
                                             <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getProjectColor(taskToShow.projectId) }} />
                                             <span className="truncate font-medium leading-none">{taskToShow.title}</span>
                                         </div>
                                         {remainingCount > 0 && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                     <div className="text-[10px] text-muted-foreground px-1 truncate hover:underline cursor-pointer w-fit" onClick={(e) => e.stopPropagation()}>
                                                         +{remainingCount} more
                                                     </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-[200px]">
                                                    {remainingTasks.map(task => (
                                                        <DropdownMenuItem key={task.id} onClick={(e) => handleTaskClick(e, task)} className="gap-2 cursor-pointer">
                                                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getProjectColor(task.projectId) }} />
                                                            <span className="truncate">{task.title}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                         )}
                                     </>
                                 );
                             })()}
                         </div>
                    </div>
                )
            }
          }}
        />
      </div>

        <TaskModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={(data) => {
            if (selectedTask) {
              onTaskUpdate(data, selectedTask.id);
              toast.success("Task updated successfully");
            } else {
              onTaskCreate(data);
              toast.success("Task created successfully");
            }
            handleModalClose();
          }}
          task={selectedTask}
          projects={projects}
          initialDate={initialDateForNewTask || undefined}
        />
    </div>
  );
}
