"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import dayjs from "dayjs";

export type ProjectDetailWithTasks = {
  id: string;
  name: string;
  description?: string;
  color: string;
  dueDate?: string;
  taskCount: number;
  completedTaskCount: number;
  currentUserRole: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority?: string;
    dueDate?: string;
    assignees: Array<{
      id: string;
      name: string;
      email: string;
      image?: string;
    }>;
  }>;
};

/**
 * Fetches detailed data for a specific project including tasks and members.
 */
export async function getProjectDetails(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        project: null,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Fetch project with tasks and members
    const projectData = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        members: {
          some: {
            workspaceMember: {
              userId: userId,
            },
          },
        },
        status: "ACTIVE",
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            assignees: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        members: {
          include: {
            workspaceMember: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!projectData) {
      return {
        project: null,
        error: "Project not found",
      };
    }

    // Find current user's role in the project
    const currentUserMember = projectData.members.find(
      (m) => m.workspaceMember.userId === userId
    );
    const currentUserRole = currentUserMember?.role || "MEMBER";

    // Transform data
    const project: ProjectDetailWithTasks = {
      id: projectData.id.toString(),
      name: projectData.name,
      description: projectData.description || undefined,
      color: projectData.color,
      dueDate: projectData.dueDate
        ? dayjs(projectData.dueDate).format("YYYY-MM-DD")
        : undefined,
      taskCount: projectData.tasks.length,
      completedTaskCount: projectData.tasks.filter((t) => t.status === "DONE")
        .length,
      currentUserRole,
      members: projectData.members.map((m) => ({
        id: m.workspaceMember.user.id,
        name: m.workspaceMember.user.name,
        email: m.workspaceMember.user.email,
        image: m.workspaceMember.user.image || undefined,
        role: m.role,
      })),
      tasks: projectData.tasks.map((t) => ({
        id: t.id.toString(),
        title: t.title,
        description: t.description || undefined,
        status: t.status,
        priority: t.priority || undefined,
        dueDate: t.dueDate ? dayjs(t.dueDate).format("YYYY-MM-DD") : undefined,
        assignees: t.assignees.map((a) => ({
          id: a.user.id,
          name: a.user.name,
          email: a.user.email,
          image: a.user.image || undefined,
        })),
      })),
    };

    return {
      project,
    };
  } catch (error) {
    console.error("Failed to fetch project details:", error);
    return {
      project: null,
      error: "Failed to load project details",
    };
  }
}
