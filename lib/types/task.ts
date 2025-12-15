export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  image: string | null;
  projectId: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  image?: string | null;
  projectId: string;
}

export interface TaskFilters {
  status?: "todo" | "in_progress" | "done" | "all";
  priority?: "low" | "medium" | "high" | "all";
  search?: string;
  dueDate?: string;
}
