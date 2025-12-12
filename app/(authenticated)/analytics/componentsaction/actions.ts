"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Task } from "@/lib/types/task";
import dayjs from "dayjs";

/**
 * Fetches data for the Analytics page.
 * Returns all tasks assigned to the user to be processed by client-side stats.
 */
export async function getAnalyticsData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        tasks: [],
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Fetch all tasks assigned to the user
    // We need all of them to calculate accurate statistics (history)
    const tasksData = await prisma.task.findMany({
      where: {
        assignees: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform Data
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

    return {
      tasks,
    };
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    return {
      tasks: [],
      error: "Failed to load analytics data",
    };
  }
}
