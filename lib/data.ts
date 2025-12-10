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

import { TeamMember, Invitation } from "@/lib/types/team";

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user_1",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    role: "Owner",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    status: "active",
    joinedAt: "2023-01-15",
    projects: ["proj_web", "proj_app"],
  },
  {
    id: "user_2",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    role: "Admin",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    status: "active",
    joinedAt: "2023-02-10",
    projects: ["proj_web", "proj_app", "proj_mkt"],
  },
  {
    id: "user_3",
    name: "Michael Chen",
    email: "michael.c@example.com",
    role: "Member",
    avatarUrl: "https://i.pravatar.cc/150?u=3",
    status: "offline",
    joinedAt: "2023-03-22",
    projects: ["proj_web"],
  },
  {
    id: "user_4",
    name: "Emily Davis",
    email: "emily.d@example.com",
    role: "Member",
    avatarUrl: "https://i.pravatar.cc/150?u=4",
    status: "busy",
    joinedAt: "2023-04-05",
    projects: ["proj_app"],
  },
  {
    id: "user_5",
    name: "David Wilson",
    email: "david.w@example.com",
    role: "Viewer",
    avatarUrl: "https://i.pravatar.cc/150?u=5",
    status: "active",
    joinedAt: "2023-05-18",
    projects: ["proj_mkt"],
  },
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: "inv_1",
    email: "jessica.lee@example.com",
    role: "Member",
    status: "pending",
    invitedBy: "Alex Johnson",
    invitedAt: dayjs().subtract(2, 'day').format("YYYY-MM-DD"),
  },
  {
    id: "inv_2",
    email: "robert.brown@example.com",
    role: "Viewer",
    status: "pending",
    invitedBy: "Sarah Williams",
    invitedAt: dayjs().subtract(5, 'hour').format("YYYY-MM-DD"),
  },
];
