"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { deleteProject } from "../componentsaction/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteProjectDialogProps {
  projectId: string;
  projectName: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function DeleteProjectDialog({
  projectId,
  projectName,
  children,
  onSuccess,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const { success, error } = await deleteProject(projectId);

      if (success) {
        toast.success("Project deleted successfully");
        setOpen(false);
        if (onSuccess) {
          onSuccess(); // Call the callback to refresh data
        } else {
          router.refresh(); // Fallback to router refresh
        }
      } else {
        toast.error(error || "Failed to delete project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will archive the project &quot;{projectName}&quot;. All tasks and data will
            be preserved but the project will no longer appear in your active
            projects list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
