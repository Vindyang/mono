"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskModal } from "../components/task-modal";
import { updateTask, deleteTask } from "../componentsaction/actions";
import { toast } from "sonner";

interface TaskDetailsClientProps {
  task: Task;
  projects: Project[];
  currentUserRole: string | null;
}

export function TaskDetailsClient({ task, projects, currentUserRole }: TaskDetailsClientProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateTask = async (data: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const result = await updateTask(task.id, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date,
      image: data.image,
      projectId: data.projectId,
    });

    if (result.success) {
      toast.success("Task updated successfully");
      setIsEditModalOpen(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    setIsDeleting(true);
    const result = await deleteTask(task.id);

    if (result.success) {
      toast.success("Task deleted successfully");
      setIsDeleteDialogOpen(false);
      router.push("/tasks");
    } else {
      toast.error(result.error || "Failed to delete task");
      setIsDeleting(false);
    }
  };

  const canEditTask = currentUserRole !== "MEMBER";

  // Don't show the menu if user is a member
  if (!canEditTask) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        projects={projects}
        onSubmit={handleUpdateTask}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
