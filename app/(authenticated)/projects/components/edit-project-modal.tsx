"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import { updateProject } from "../componentsaction/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditProjectModalProps {
  project: {
    id: string;
    name: string;
    description?: string;
    color: string;
    dueDate?: string;
  };
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditProjectModal({ project, children, onSuccess }: EditProjectModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [color, setColor] = useState(project.color);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    project.dueDate ? new Date(project.dueDate) : undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when project prop changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
    setColor(project.color);
    setDueDate(project.dueDate ? new Date(project.dueDate) : undefined);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dueDateString = dueDate ? dueDate.toISOString().split('T')[0] : "";
      const { success, error } = await updateProject(
        project.id,
        name,
        description,
        color,
        dueDateString
      );

      if (success) {
        toast.success("Project updated successfully");
        setOpen(false);
        if (onSuccess) {
          onSuccess(); // Call the callback to refresh data
        } else {
          router.refresh(); // Fallback to router refresh
        }
      } else {
        toast.error(error || "Failed to update project");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Gray", value: "#6b7280" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label
              htmlFor="name"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name"
              className="col-span-3"
              required
            />
          </div>
          <div className="grid gap-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Due Date
            </label>
            <DatePicker
              date={dueDate}
              onSelect={setDueDate}
              placeholder="Select due date"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-full transition-all ${
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
