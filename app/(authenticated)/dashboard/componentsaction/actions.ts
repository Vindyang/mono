"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth"; // Explicitly import auth from lib
import { Task } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";

/**
 * Fetches dashboard data for the authenticated user.
 * Returns tasks assigned to the user and projects they are a member of.
 */
export async function getDashboardData() {
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
    // We include the project details to display project info on the task card if needed
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
        dueDate: "asc", 
      },
    });

    // 2. Fetch all active projects the user is a member of
    // This is useful for the projects list or filters
    // Note: The schema has projectMember table linking users to projects
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
        updatedAt: "desc",
      },
    });

    // 3. Transform Data for Frontend (Int IDs -> String IDs, Enum mappings)
    
    // Map Tasks
    const tasks: Task[] = tasksData.map((t) => ({
      id: t.id.toString(),
      title: t.title,
      description: t.description,
      status: t.status.toLowerCase() as "todo" | "in_progress" | "done", // Map UPPERCASE to lowercase
      priority: t.priority ? (t.priority.toLowerCase() as "low" | "medium" | "high") : null,
      due_date: t.dueDate ? dayjs(t.dueDate).format("YYYY-MM-DD") : null,
      projectId: t.projectId.toString(),
      created_at: dayjs(t.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(t.updatedAt).format("YYYY-MM-DD"),
      image: t.image, // Optional field
    }));

    // Map Projects
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
    console.error("Failed to fetch dashboard data:", error);
    return {
      tasks: [],
      projects: [],
      error: "Failed to load dashboard data",
    };
  }
}
