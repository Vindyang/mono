"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Project } from "@/lib/types/project";
import dayjs from "dayjs";

/**
 * Extended Project type for the Projects Page
 * Includes UI-specific fields like stats and members
 */
export type ProjectWithStats = Project & {
  taskCount: number;
  completedTaskCount: number;
  dueDate: string;
  members: string[]; // Array of avatar URLs
};

/**
 * Fetches data for the Projects page.
 * Returns active projects where the user is a member, including task stats and member avatars.
 */
export async function getProjectsData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        projects: [],
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Fetch projects where user is a member
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
      include: {
        // Include tasks for counting
        tasks: {
          select: {
            status: true
          }
        },
        // Include members to get avatars
        members: {
          include: {
            workspaceMember: {
              include: {
                user: {
                  select: {
                    image: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: "desc", 
      },
    });

    // Transform Data
    const projects: ProjectWithStats[] = projectsData.map((p) => {
      // Calculate Stats
      const taskCount = p.tasks.length;
      const completedTaskCount = p.tasks.filter(t => t.status === "DONE").length;

      // Map Members to Avatars (limit to 4 for UI)
      const memberAvatars = p.members
        .map(m => m.workspaceMember.user.image)
        .filter((img): img is string => !!img)
        .slice(0, 4);

      return {
        id: p.id.toString(),
        name: p.name,
        color: p.color,
        description: p.description || undefined,
        taskCount,
        completedTaskCount,
        dueDate: p.dueDate ? dayjs(p.dueDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), // Fallback if null
        members: memberAvatars
      };
    });

    return {
      projects,
    };
  } catch (error) {
    console.error("Failed to fetch projects data:", error);
    return {
      projects: [],
      error: "Failed to load projects data",
    };
  }
}
