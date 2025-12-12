"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";

/**
 * Fetches data for the Calendar page.
 * Returns tasks assigned to the user and all active projects.
 */
export async function getCalendarData() {
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
      // For calendar, we might want a specific order or just fetch all
      orderBy: {
        dueDate: "asc",
      },
    });

    // 2. Fetch all active projects
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
    console.error("Failed to fetch calendar data:", error);
    return {
      tasks: [],
      projects: [],
      error: "Failed to load calendar data",
    };
  }
}
