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
        attachments: true,
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
              userId: userId,
            },
          },
        },
        status: "ACTIVE",
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
      priority: t.priority
        ? (t.priority.toLowerCase() as "low" | "medium" | "high")
        : null,
      due_date: t.dueDate ? dayjs(t.dueDate).format("YYYY-MM-DD") : null,
      projectId: t.projectId.toString(),
      created_at: dayjs(t.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(t.updatedAt).format("YYYY-MM-DD"),
      image: t.image,
      attachments: t.attachments?.map((a) => ({
        id: a.id.toString(),
        taskId: a.taskId.toString(),
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        createdAt: dayjs(a.createdAt).toISOString(),
      })),
      assignees: t.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        image: a.user.image || undefined,
      })),
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
 * Fetches a single task by ID along with available projects for editing
 */
export async function getTaskById(taskId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        task: null,
        project: null,
        projects: [],
        currentUserRole: null,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Fetch the task with its project details
    const taskData = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          members: {
            some: {
              workspaceMember: {
                userId: userId,
              },
            },
          },
        },
      },
      include: {
        project: {
          include: {
            members: {
              include: {
                workspaceMember: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
        attachments: true,
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
    });

    if (!taskData) {
      return {
        task: null,
        project: null,
        projects: [],
        currentUserRole: null,
        error: "Task not found",
      };
    }

    // Fetch all active projects for the edit modal
    const projectsData = await prisma.project.findMany({
      where: {
        members: {
          some: {
            workspaceMember: {
              userId: userId,
            },
          },
        },
        status: "ACTIVE",
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform task data
    const task: Task = {
      id: taskData.id.toString(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: taskData.priority
        ? (taskData.priority.toLowerCase() as "low" | "medium" | "high")
        : null,
      due_date: taskData.dueDate
        ? dayjs(taskData.dueDate).format("YYYY-MM-DD")
        : null,
      projectId: taskData.projectId.toString(),
      created_at: dayjs(taskData.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(taskData.updatedAt).format("YYYY-MM-DD"),
      image: taskData.image,
      attachments: taskData.attachments?.map((a) => ({
        id: a.id.toString(),
        taskId: a.taskId.toString(),
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        createdAt: dayjs(a.createdAt).toISOString(),
      })),
      assignees: taskData.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        image: a.user.image || undefined,
      })),
    };

    // Find current user's role in the project
    let currentUserRole = null;
    if (taskData.project) {
      const currentUserMember = taskData.project.members.find(
        (m) => m.workspaceMember.userId === userId,
      );
      currentUserRole = currentUserMember?.role || "MEMBER";
    }

    // Transform project data
    const project: Project | null = taskData.project
      ? {
          id: taskData.project.id.toString(),
          name: taskData.project.name,
          color: taskData.project.color,
          description: taskData.project.description || undefined,
        }
      : null;

    // Transform projects data
    const projects: Project[] = projectsData.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      color: p.color,
      description: p.description || undefined,
    }));

    return {
      task,
      project,
      projects,
      currentUserRole,
    };
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return {
      task: null,
      project: null,
      currentUserRole: null,
      projects: [],
      error: "Failed to load task",
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
  assigneeIds?: string[];
  attachmentIds?: string[];
  pendingAttachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileSize: number | null;
    mimeType: string | null;
  }>;
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

    // Determine assignees: use provided IDs or default to creator
    const assigneeUserIds =
      data.assigneeIds && data.assigneeIds.length > 0
        ? data.assigneeIds
        : [userId];

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
          create: assigneeUserIds.map((id) => ({ userId: id })),
        },
        attachments: data.attachmentIds?.length
          ? {
              connect: data.attachmentIds.map((id) => ({ id: parseInt(id) })),
            }
          : undefined,
      },
      include: {
        project: true,
      },
    });

    // Create attachment records for pending uploads
    if (data.pendingAttachments?.length) {
      await prisma.attachment.createMany({
        data: data.pendingAttachments.map((pending) => ({
          taskId: task.id,
          fileName: pending.fileName,
          fileUrl: pending.fileUrl,
          fileSize: pending.fileSize,
          mimeType: pending.mimeType,
        })),
      });
    }

    // Fetch the task with attachments included
    const taskWithAttachments = await prisma.task.findUnique({
      where: { id: task.id },
      include: { project: true, attachments: true },
    });

    // Transform to Task type
    const createdTask: Task = {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: task.priority
        ? (task.priority.toLowerCase() as "low" | "medium" | "high")
        : null,
      due_date: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : null,
      projectId: task.projectId.toString(),
      created_at: dayjs(task.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(task.updatedAt).format("YYYY-MM-DD"),
      image: task.image,
      attachments: taskWithAttachments?.attachments?.map((a) => ({
        id: a.id.toString(),
        taskId: a.taskId.toString(),
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        createdAt: dayjs(a.createdAt).toISOString(),
      })),
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

/**
 * Updates an existing task
 */
export async function updateTask(
  taskId: string,
  data: {
    title: string;
    description: string | null;
    status: "todo" | "in_progress" | "done";
    priority: "low" | "medium" | "high" | null;
    due_date: string | null;
    image: string | null;
    projectId: string;
    assigneeIds?: string[];
    attachmentIds?: string[];
    pendingAttachments?: Array<{
      fileUrl: string;
      fileName: string;
      fileSize: number | null;
      mimeType: string | null;
    }>;
  },
) {
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

    // Verify the user has access to this task via project membership
    const existingTask = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          members: {
            some: {
              workspaceMember: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or access denied",
      };
    }

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

    // Update the task and assignees if provided
    const task = await prisma.task.update({
      where: {
        id: parseInt(taskId),
      },
      data: {
        title: data.title,
        description: data.description,
        status: statusMap[data.status],
        priority: data.priority ? priorityMap[data.priority] : null,
        dueDate: data.due_date ? new Date(data.due_date) : null,
        image: data.image,
        projectId: parseInt(data.projectId),
        ...(data.assigneeIds && {
          assignees: {
            deleteMany: {},
            create: data.assigneeIds.map((id) => ({ userId: id })),
          },
        }),
        attachments: data.attachmentIds?.length
          ? {
              connect: data.attachmentIds.map((id) => ({ id: parseInt(id) })),
            }
          : undefined,
      },
      include: {
        project: true,
      },
    });

    // Create attachment records for any pending uploads
    if (data.pendingAttachments?.length) {
      await prisma.attachment.createMany({
        data: data.pendingAttachments.map((pending) => ({
          taskId: parseInt(taskId),
          fileName: pending.fileName,
          fileUrl: pending.fileUrl,
          fileSize: pending.fileSize,
          mimeType: pending.mimeType,
        })),
      });
    }

    // Re-fetch with attachments and assignees included
    const taskWithDetails = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
      include: {
        project: true,
        attachments: true,
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
    });

    // Determine the final attachments set
    const finalAttachments = taskWithDetails?.attachments || [];

    // Determine the final assignees
    const finalAssignees =
      taskWithDetails?.assignees.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
        image: a.user.image || undefined,
      })) || [];

    // Transform to Task type
    const updatedTask: Task = {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      status: task.status.toLowerCase() as "todo" | "in_progress" | "done",
      priority: task.priority
        ? (task.priority.toLowerCase() as "low" | "medium" | "high")
        : null,
      due_date: task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : null,
      projectId: task.projectId.toString(),
      created_at: dayjs(task.createdAt).format("YYYY-MM-DD"),
      updated_at: dayjs(task.updatedAt).format("YYYY-MM-DD"),
      image: task.image,
      assignees: finalAssignees,
      attachments: finalAttachments.map((a: any) => ({
        id: a.id.toString(),
        taskId: a.taskId.toString(),
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        createdAt: dayjs(a.createdAt).toISOString(),
      })),
    };

    return {
      success: true,
      task: updatedTask,
    };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      success: false,
      error: "Failed to update task",
    };
  }
}

/**
 * Updates task status (used for drag-and-drop operations)
 */
export async function updateTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "done",
) {
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

    // Verify the user has access to this task via project membership
    const existingTask = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          members: {
            some: {
              workspaceMember: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or access denied",
      };
    }

    // Map status to Prisma enum
    const statusMap: Record<string, TaskStatus> = {
      todo: TaskStatus.TODO,
      in_progress: TaskStatus.IN_PROGRESS,
      done: TaskStatus.DONE,
    };

    // Update only the status
    await prisma.task.update({
      where: {
        id: parseInt(taskId),
      },
      data: {
        status: statusMap[status],
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update task status:", error);
    return {
      success: false,
      error: "Failed to update task status",
    };
  }
}

/**
 * Deletes a task
 */
export async function deleteTask(taskId: string) {
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

    // Verify the user has access to this task via project membership
    const existingTask = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        project: {
          members: {
            some: {
              workspaceMember: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    if (!existingTask) {
      return {
        success: false,
        error: "Task not found or access denied",
      };
    }

    // Delete the task (this will cascade delete assignees due to schema)
    await prisma.task.delete({
      where: {
        id: parseInt(taskId),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      error: "Failed to delete task",
    };
  }
}

export async function getProjectMembers(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { members: [], error: "Unauthorized" };
    }

    const project = await prisma.project.findFirst({
      where: { id: parseInt(projectId) },
      select: {
        members: {
          include: {
            workspaceMember: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true },
                },
              },
            },
          },
        },
      },
    });

    if (!project) return { members: [], error: "Project not found" };

    const members = project.members.map((m) => ({
      id: m.workspaceMember.user.id,
      name: m.workspaceMember.user.name,
      email: m.workspaceMember.user.email,
      image: m.workspaceMember.user.image || undefined,
      role: m.role,
    }));

    return { members };
  } catch (error) {
    console.error("Failed to fetch project members:", error);
    return { members: [], error: "Failed to load members" };
  }
}
