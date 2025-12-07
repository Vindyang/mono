import { Project } from "@/lib/types/project";
import { Task } from "@/lib/types/task";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const INITIAL_PROJECTS: (Project & { 
    description: string; 
    taskCount: number; 
    completedTaskCount: number; 
    dueDate: string;
    members: string[]; 
})[] = [
  { 
    id: "proj_web", 
    name: "Website Redesign", 
    color: "#3b82f6",
    description: "Complete overhaul of the corporate website including new branding and improved UX.",
    taskCount: 12,
    completedTaskCount: 8,
    dueDate: dayjs().add(2, 'week').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=3"]
  },
  { 
    id: "proj_app", 
    name: "Mobile App Launch", 
    color: "#8b5cf6",
    description: "Development and launch of the new iOS and Android mobile applications.",
    taskCount: 24,
    completedTaskCount: 10,
    dueDate: dayjs().add(1, 'month').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=4", "https://i.pravatar.cc/150?u=1"]
  },
  { 
    id: "proj_mkt", 
    name: "Q4 Marketing Campaign", 
    color: "#10b981",
    description: "Strategic marketing campaign for Q4 including social media, email, and ads.",
    taskCount: 18,
    completedTaskCount: 2,
    dueDate: dayjs().add(3, 'week').format("YYYY-MM-DD"),
    members: ["https://i.pravatar.cc/150?u=5", "https://i.pravatar.cc/150?u=2", "https://i.pravatar.cc/150?u=6", "https://i.pravatar.cc/150?u=7"]
  },
];

export const INITIAL_TASKS: Task[] = [
  // Website Redesign Tasks
  {
    id: "1",
    title: "Design System Audit",
    description: "Review current components and identify inconsistencies",
    status: "done",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-20",
    updated_at: "2023-11-25",
  },
  {
    id: "1b",
    title: "Update Color Palette",
    description: "Refine primary and secondary colors for better contrast",
    status: "todo",
    priority: "medium",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-21",
    updated_at: "2023-11-25",
  },
  {
    id: "1c",
    title: "Fix Navigation Bug",
    description: "Menu doesn't close on mobile click",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-22",
    updated_at: "2023-11-25",
  },
  {
    id: "1d",
    title: "Optimize Images",
    description: "Compress hero images for faster load time",
    status: "todo",
    priority: "low",
    due_date: dayjs().format("YYYY-MM-DD"), // Today
    projectId: "proj_web",
    created_at: "2023-11-23",
    updated_at: "2023-11-25",
  },
  {
    id: "2",
    title: "Homepage Hero Section",
    description: "Design and implement the new hero section with 3D elements",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().add(1, 'day').format("YYYY-MM-DD"), // Tomorrow
    projectId: "proj_web",
    created_at: "2023-11-28",
    updated_at: "2023-11-29",
  },

  // Mobile App Launch Tasks
  {
    id: "4",
    title: "Push Notification Setup",
    description: "Configure Firebase Cloud Messaging for iOS and Android",
    status: "in_progress",
    priority: "high",
    due_date: dayjs().format("YYYY-MM-DD"), // Today (2nd task for today)
    projectId: "proj_app",
    created_at: "2023-11-25",
    updated_at: "2023-11-27",
  },

  // Q4 Marketing Campaign Tasks
  {
    id: "7",
    title: "Social Media Calendar",
    description: "Plan posts for Instagram, LinkedIn, and Twitter",
    status: "todo",
    priority: "medium",
    due_date: dayjs().add(3, 'day').format("YYYY-MM-DD"), // Next Week (approx)
    projectId: "proj_mkt",
    created_at: "2023-11-15",
    updated_at: "2023-11-29",
  },
];
