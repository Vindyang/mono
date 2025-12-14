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
    console.error("Failed to fetch projects:", error);
    return {
      projects: [],
      error: "Failed to load projects",
    };
  }
}

/**
 * Creates a new project in the user's workspace.
 */
import { revalidatePath } from "next/cache";

export async function createProject(name: string, description: string, color: string, dueDate?: string) {
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

        // Get user's workspace membership
        const userMembership = await prisma.workspaceMember.findFirst({
            where: {
                userId: userId,
                status: "ACTIVE"
            }
        });

        let workspaceId = userMembership?.workspaceId;

        // If no workspace exists, create a default one
        if (!userMembership) {
            const userName = session.user.name || "User";
            const workspaceName = `${userName}'s Workspace`;
            const slug = `${userName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;

            // Transaction to create workspace and member
            const newWorkspace = await prisma.$transaction(async (tx) => {
                const ws = await tx.workspace.create({
                    data: {
                        name: workspaceName,
                        slug: slug,
                    }
                });

                await tx.workspaceMember.create({
                    data: {
                        userId: userId,
                        workspaceId: ws.id,
                        role: "OWNER",
                        status: "ACTIVE"
                    }
                });

                return ws;
            });

            workspaceId = newWorkspace.id;
        }

        if (!workspaceId) {
             return {
                success: false,
                error: "Failed to resolve workspace",
            };
        }

        // Create Project
        const project = await prisma.project.create({
            data: {
                name,
                description,
                color,
                workspaceId: workspaceId,
                status: "ACTIVE",
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });

        // Fetch the workspace member ID (we need this for the project member record)
        // If we just created it, we could have returned it from transaction, but for simplicity let's just fetch it again or pass it through if complex.
        // Actually, let's optimize the previous block to get the member ID.
        
        const finalMember = await prisma.workspaceMember.findFirst({
            where: {
                userId: userId,
                workspaceId: workspaceId
            }
        });

        if (finalMember) {
             // Add creator as project member (LEAD)
            await prisma.projectMember.create({
                data: {
                    projectId: project.id,
                    workspaceMemberId: finalMember.id,
                    role: "LEAD",
                }
            });
        }

        revalidatePath("/projects");

        return {
            success: true,
            project,
        };

    } catch (error) {
        console.error("Failed to create project:", error);
        return {
            success: false,
            error: "Failed to create project",
        };
    }
}

/**
 * Updates an existing project.
 */
export async function updateProject(
    projectId: string,
    name: string,
    description: string,
    color: string,
    dueDate?: string
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

        // Verify user has access to this project
        const projectMember = await prisma.projectMember.findFirst({
            where: {
                projectId: parseInt(projectId),
                workspaceMember: {
                    userId: userId
                }
            }
        });

        if (!projectMember) {
            return {
                success: false,
                error: "You don't have access to this project",
            };
        }

        // Update Project
        const project = await prisma.project.update({
            where: {
                id: parseInt(projectId)
            },
            data: {
                name,
                description,
                color,
                dueDate: dueDate ? new Date(dueDate) : null,
            },
        });

        revalidatePath("/projects");

        return {
            success: true,
            project,
        };

    } catch (error) {
        console.error("Failed to update project:", error);
        return {
            success: false,
            error: "Failed to update project",
        };
    }
}

/**
 * Deletes a project (soft delete by setting status to ARCHIVED).
 */
export async function deleteProject(projectId: string) {
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

        // Verify user has LEAD role for this project
        const projectMember = await prisma.projectMember.findFirst({
            where: {
                projectId: parseInt(projectId),
                workspaceMember: {
                    userId: userId
                },
                role: "LEAD" // Only leads can delete
            }
        });

        if (!projectMember) {
            return {
                success: false,
                error: "You don't have permission to delete this project",
            };
        }

        // Soft delete by archiving
        await prisma.project.update({
            where: {
                id: parseInt(projectId)
            },
            data: {
                status: "ARCHIVED",
            },
        });

        revalidatePath("/projects");

        return {
            success: true,
        };

    } catch (error) {
        console.error("Failed to delete project:", error);
        return {
            success: false,
            error: "Failed to delete project",
        };
    }
}
