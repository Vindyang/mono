import { Attachment } from "@/lib/types/attachment";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_date: string | null;
  attachments?: Attachment[];
  image: string | null;
  projectId: string;
  created_at: string;
  updated_at: string;
  assignees?: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
  }>;
}

export type TaskInput = Omit<
  Task,
  "id" | "created_at" | "updated_at" | "assignees"
> & {
  assigneeIds?: string[];
};

export interface TaskFormData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  image?: string | null;
  projectId: string;
  assigneeIds?: string[];
  attachments?: Attachment[];
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  search?: string;
  dueDate?: string;
}
