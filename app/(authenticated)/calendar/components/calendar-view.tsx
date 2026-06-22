"use client";

import React, { useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onTaskCreate: (data: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  onTaskUpdate: (
    data: Omit<Task, "id" | "created_at" | "updated_at">,
    taskId: string,
  ) => void;
  onTaskDelete: (taskId: string) => void;
}

// Create a context to avoid passing props deeply and to keep DayContent stable
interface CalendarContextType {
  tasks: Task[];
  projects: Project[];
  currentDate: Date;
  onDayClick: (day: Date) => void;
  onTaskClick: (e: React.MouseEvent, task: Task) => void;
  onProjectClick: (project: Project) => void;
  getProjectColor: (projectId: string) => string;
}

const CalendarContext = React.createContext<CalendarContextType | null>(null);

// Custom Day component to render a td instead of a button/div to avoid invalid HTML nesting
// (interactive Dropdown inside interactive Day button) and preserve table structure
const CustomDay = React.forwardRef<HTMLTableCellElement, any>((props, ref) => {
  const { date, day, displayMonth, children, ...cellProps } = props;
  const actualDate = date || day?.date || day; // Handle various prop shapes robustly

  return (
    <td
      ref={ref}
      {...cellProps}
      className={cn(
        "border-r border-b border-gray-200 p-0 relative h-full w-full p-0 align-top focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-muted/5",
        cellProps.className,
      )}
    >
      <CustomDayContent date={actualDate} displayMonth={displayMonth} />
    </td>
  );
});
CustomDay.displayName = "CustomDay";

// Define DayContent outside of the main component to prevent re-creation
function CustomDayContent(props: any) {
  const context = React.useContext(CalendarContext);
  if (!context) return <></>;

  const { tasks, projects, onTaskClick, onProjectClick, getProjectColor } =
    context;
  const day = props.date;

  if (!day || typeof day.getDate !== "function") {
    return <></>;
  }

  // Format the day as YYYY-MM-DD for direct string comparison
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  const dayStr = `${y}-${m}-${d}`;

  // Filter tasks: match if due_date starts with today's date
  // (handles both "YYYY-MM-DD" and ISO "YYYY-MM-DDTHH:mm:ss.sssZ" formats)
  const dayTasks = tasks.filter(
    (task) => task.due_date && task.due_date.startsWith(dayStr),
  );

  // Filter projects: match dueDate string
  const dayProjects = projects.filter(
    (project) => project.dueDate && project.dueDate.startsWith(dayStr),
  );

  // Sort tasks: High priority first
  const sortedTasks = [...dayTasks].sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return 0;
  });

  const taskToShow = sortedTasks[0];
  const remainingTasks = sortedTasks.slice(1);
  const remainingCount = remainingTasks.length;

  return (
    <div
      className="w-full h-full flex flex-col gap-1.5"
      onClick={() => context.onDayClick(day)}
    >
      <span
        className={cn(
          "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full ml-1 mt-1",
          dayjs(day).isSame(dayjs(), "day")
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground",
        )}
      >
        {day.getDate()}
      </span>
      <div className="flex flex-col gap-1 w-full overflow-hidden px-2 pb-2">
        {/* Project deadlines */}
        {dayProjects.map((project) => (
          <div
            key={`project-${project.id}`}
            className="group bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-xs p-1.5 rounded border border-blue-200 dark:border-blue-800 shadow-sm cursor-pointer transition-all flex items-center gap-2 w-full overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
              onProjectClick(project);
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <span className="truncate font-medium leading-none">
              {project.name}
            </span>
            <span className="shrink-0 text-[9px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold ml-auto">
              Deadline
            </span>
          </div>
        ))}
        {/* Task deadlines */}
        {taskToShow && (
          <>
            <div
              key={taskToShow.id}
              className="group bg-card hover:bg-accent text-card-foreground text-xs p-1.5 rounded border border-border shadow-sm cursor-pointer transition-all flex items-center gap-2 w-full overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(e, taskToShow);
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: getProjectColor(taskToShow.projectId),
                }}
              />
              <span className="truncate font-medium leading-none">
                {taskToShow.title}
              </span>
              <span className="shrink-0 text-[9px] uppercase tracking-wider text-red-500 dark:text-red-400 font-semibold ml-auto">
                Due
              </span>
            </div>
            {remainingCount > 0 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <div
                    className="text-[10px] text-muted-foreground px-1 truncate hover:underline cursor-pointer w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    +{remainingCount} more
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  {remainingTasks.map((task) => (
                    <DropdownMenuItem
                      key={task.id}
                      onClick={(e) => onTaskClick(e, task)}
                      className="gap-2 cursor-pointer"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: getProjectColor(task.projectId),
                        }}
                      />
                      <span className="truncate">{task.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </div>
    </div>
  );
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
  const [initialDateForNewTask, setInitialDateForNewTask] = useState<
    string | null
  >(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleProjectDialogClose = () => {
    setIsProjectDialogOpen(false);
    setSelectedProject(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setInitialDateForNewTask(null);
  };

  return (
    <CalendarContext.Provider
      value={{
        tasks,
        projects,
        currentDate,
        onDayClick: handleDayClick,
        onTaskClick: handleTaskClick,
        onProjectClick: handleProjectClick,
        getProjectColor,
      }}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto bg-background border rounded-lg shadow-sm">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={(date) => {
              if (date) {
                setCurrentDate(date);
                handleDayClick(date);
              }
            }}
            month={currentDate}
            onMonthChange={setCurrentDate}
            formatters={{
              formatWeekdayName: (date) => dayjs(date).format("ddd"),
            }}
            className="w-full min-w-[800px] h-full p-0 flex flex-col"
            classNames={{
              months: "flex-1 w-full flex flex-col",
              month:
                "flex-1 w-full flex flex-col [&_table]:!flex-1 [&_table]:!flex [&_table]:!flex-col [&_tbody]:!flex-1 [&_tbody]:!flex [&_tbody]:!flex-col [&_tr]:!flex [&_tr]:!flex-1 [&_tr]:!min-h-0",
              // caption override removed to allow calendar.tsx defaults (month_caption) to work
              caption_label: "text-lg font-semibold",
              // Removed legacy manual positioning for nav buttons
              table: "w-full flex-1 border-l border-t border-gray-200",
              row: "flex w-full flex-1 min-h-0",
              week: "flex w-full flex-1 min-h-0", // Ensure rows expand
              tbody: "flex-1 w-full",
              cell: "flex-1 h-full p-0 relative flex flex-col border-r border-b border-gray-200 [&:has([aria-selected])]:bg-muted/5 focus-within:relative focus-within:z-20 last:border-r-0",
              day: "h-full w-full font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-muted/50 transition-colors text-left flex-1 bg-background overflow-hidden",
              day_today: "bg-accent/5",
              day_selected:
                "bg-transparent text-foreground hover:bg-muted/50 hover:text-foreground focus:bg-transparent focus:text-foreground",
              day_outside: "text-muted-foreground opacity-50 bg-muted/5",
            }}
            components={{
              Day: CustomDay as any,
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
        {/* Project Deadline Dialog */}
        <Dialog
          open={isProjectDialogOpen}
          onOpenChange={(open) => !open && handleProjectDialogClose()}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedProject?.name}</DialogTitle>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-4">
                {selectedProject.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h4>
                    <p className="text-sm">{selectedProject.description}</p>
                  </div>
                )}
                {selectedProject.dueDate && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Deadline
                    </h4>
                    <p className="text-sm">
                      {dayjs(selectedProject.dueDate).format("DD/MM/YYYY")}
                    </p>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full">
                  <a href={`/projects/${selectedProject.id}`}>View Project</a>
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CalendarContext.Provider>
  );
}
