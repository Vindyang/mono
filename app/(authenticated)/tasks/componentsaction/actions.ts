"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { TaskStatus, TaskPriority } from "@/generated/prisma/client";
import dayjs from "dayjs";

/**
 * Fetches data for the Tasks page.
 * Returns tasks assigned to the user and all active projects (for filtering/creation).
 */
export async function getTasksData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        tasks: [],
        projects: [],
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // 1. Fetch tasks assigned to the user
    // We include the project details to display project info on cards
    const tasksData = await prisma.task.findMany({
      where: {
        assignees: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc", // Default sorting for tasks page (can be changed)
      },
    });

    // 2. Fetch all active projects
    // Needed for the "New Task" modal dropdown and project filter
    const projectsData = await prisma.project.findMany({
      where: {
         members: {
            some: {
                workspaceMember: {
                    userId: userId
                }
            }
         },
         status: "ACTIVE"
      },
      orderBy: {
        name: "asc", 
      },
    });

    // 3. Transform Data (Int -> String)
    
    const tasks: Task[] = tasksData.map((t) => ({
      id: t.id.toString(),
      title: t.title,
      description: t.description,
      status: t.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: t.priority ? (t.priority.toLowerCase() as "low" | "medium" | "high") : null,
      due_date: t.dueDate ? dayjs(t.dueDate).format("YYYY-MM-DD") : null,
      projectId: t.projectId.toString(),
      created_at: dayjs(t.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(t.updatedAt).format("YYYY-MM-DD"),
      image: t.image,
    }));

    const projects: Project[] = projectsData.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      color: p.color,
      description: p.description || undefined,
    }));

    return {
      tasks,
      projects,
    };
  } catch (error) {
    console.error("Failed to fetch tasks data:", error);
    return {
      tasks: [],
      projects: [],
      error: "Failed to load tasks data",
    };
  }
}

/**
 * Creates a new task and assigns it to the current user
 */
export async function createTask(data: {
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  image: string | null;
  projectId: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Map status and priority to Prisma enums
    const statusMap: Record<string, TaskStatus> = {
      todo: TaskStatus.TODO,
      in_progress: TaskStatus.IN_PROGRESS,
      done: TaskStatus.DONE,
    };

    const priorityMap: Record<string, TaskPriority> = {
      low: TaskPriority.LOW,
      medium: TaskPriority.MEDIUM,
      high: TaskPriority.HIGH,
    };

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: statusMap[data.status],
        priority: data.priority ? priorityMap[data.priority] : null,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        image: data.image,
        projectId: parseInt(data.projectId),
        createdById: userId,
        assignees: {
          create: {
            userId: userId,
          },
        },
      },
      include: {
        project: true,
      },
    });

    // Transform to Task type
    const createdTask: Task = {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: task.priority ? (task.priority.toLowerCase() as "low" | "medium" | "high") : null,
      due_date: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : null,
      projectId: task.projectId.toString(),
      created_at: dayjs(task.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(task.updatedAt).format("YYYY-MM-DD"),
      image: task.image,
    };

    return {
      success: true,
      task: createdTask,
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    return {
      success: false,
      error: "Failed to create task",
    };
  }
}
