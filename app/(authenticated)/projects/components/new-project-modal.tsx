"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

import { createProject } from "../componentsaction/actions"; // Import action
import { toast } from "sonner"; // Import toast
import { useRouter } from "next/navigation";

interface NewProjectModalProps {
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function NewProjectModal({ children, onSuccess }: NewProjectModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dueDateString = dueDate ? dueDate.toISOString().split('T')[0] : "";
      const { success, error } = await createProject(name, description, color, dueDateString);

      if (success) {
        toast.success("Project created successfully");
        setOpen(false);
        resetForm();
        if (onSuccess) {
          onSuccess(); // Call the callback to refresh data
        } else {
          router.refresh(); // Fallback to router refresh
        }
      } else {
        toast.error(error || "Failed to create project");
      }
    } catch (err) {
        console.error(err);
        toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#3b82f6");
    setDueDate(undefined);
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
          <Button size="lg" className="rounded-xl px-6">
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your workspace. Click save when you&apos;re
            done.
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
                  Creating...
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
