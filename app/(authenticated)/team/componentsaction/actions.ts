"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { TeamMember } from "@/lib/types/team";
import dayjs from "dayjs";
import { sendInvitationEmail } from "@/lib/email/send";

// Type-safe role mapping
const ROLE_MAP = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
} as const;

// Type-safe invitation status mapping
const INVITATION_STATUS_MAP = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

// Type-safe member status mapping
const MEMBER_STATUS_MAP = {
  ACTIVE: "active",
  OFFLINE: "offline",
  BUSY: "busy",
} as const;

export interface TeamStatsData {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  newMembersLastMonth: number;
}

/**
 * Fetches data for the Team page.
 * Returns members of the user's workspace and stats.
 */
export async function getTeamData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        members: [],
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvites: 0,
          newMembersLastMonth: 0,
        },
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // 1. Find the user's workspace(s)
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        members: [],
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvites: 0,
          newMembersLastMonth: 0,
        },
        // error: "User does not belong to any workspace", // Don't error, just return empty
      };
    }

    const workspaceId = userMembership.workspaceId;

    // 2. Fetch all members of this workspace
    const membersData = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        user: true,
        projectAssignments: {
          include: {
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // 3. Fetch pending invitations
    const pendingInvitesCount = await prisma.invitation.count({
      where: {
        workspaceId: workspaceId,
        status: "PENDING",
      },
    });

    // 4. Transform Data
    const members: TeamMember[] = membersData.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.image || "", // Mapped to avatarUrl
      email: m.user.email,
      role: ROLE_MAP[m.role],
      status: MEMBER_STATUS_MAP[m.status],
      joinedAt: dayjs(m.joinedAt).format("YYYY-MM-DD"),
      projects: m.projectAssignments.map((pa) => ({
        id: pa.projectId.toString(),
        name: pa.project.name,
      })),
    }));

    // 5. Calculate Stats
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "active").length;
    const oneMonthAgo = dayjs().subtract(1, "month");
    const newMembersLastMonth = members.filter((m) =>
      dayjs(m.joinedAt).isAfter(oneMonthAgo)
    ).length;

    return {
      members,
      currentUserId: userId,
      currentUserRole: ROLE_MAP[userMembership.role],
      stats: {
        totalMembers,
        activeMembers,
        pendingInvites: pendingInvitesCount,
        newMembersLastMonth,
      },
    };
  } catch (error) {
    console.error("Failed to fetch team data:", error);
    return {
      members: [],
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        pendingInvites: 0,
        newMembersLastMonth: 0,
      },
      error: "Failed to load team data",
    };
  }
}

/**
 * Fetches pending invitations for the user's workspace.
 */
export async function getInvitationsData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        invitations: [],
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        invitations: [],
        // No error needed, just empty list
      };
    }

    const workspaceId = userMembership.workspaceId;

    const invitationsData = await prisma.invitation.findMany({
      where: {
        workspaceId: workspaceId,
        status: "PENDING",
      },
      include: {
        invitedBy: true,
      },
      orderBy: {
        invitedAt: "desc",
      },
    });

    // Transform Data
    // We need to import Invitation type or match the shape expected by UI
    // The UI expects: id, email, role, status, invitedBy (string name), invitedAt (string date)
    const invitations = invitationsData.map((inv) => ({
      id: inv.id.toString(),
      email: inv.email,
      role: ROLE_MAP[inv.role],
      status: INVITATION_STATUS_MAP[inv.status],
      invitedBy: inv.invitedBy.name,
      invitedAt: inv.invitedAt.toISOString(),
    }));

    return {
      invitations,
    };
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    return {
      invitations: [],
      error: "Failed to load invitations",
    };
  }
}

/**
 * Creates a new invitation for a user to join the workspace.
 */
export async function createInvitation(
  email: string,
  role: string,
  projectIds: string[]
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

    // Find user's workspace membership
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        success: false,
        error: "You don't belong to any workspace",
      };
    }

    // Only owners and admins can invite
    if (userMembership.role !== "OWNER" && userMembership.role !== "ADMIN") {
      return {
        success: false,
        error: "Only owners and admins can invite members",
      };
    }

    const workspaceId = userMembership.workspaceId;

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspaceId,
        user: {
          email: email,
        },
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this workspace",
      };
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        workspaceId: workspaceId,
        email: email,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    // Convert role string to enum
    const roleEnum = role.toUpperCase() as
      | "OWNER"
      | "ADMIN"
      | "MEMBER"
      | "VIEWER";

    // Convert project IDs to integers
    const projectIdsInt = projectIds.map((id) => parseInt(id, 10));

    // Validate project IDs belong to the workspace
    if (projectIdsInt.length > 0) {
      const validProjects = await prisma.project.count({
        where: {
          id: { in: projectIdsInt },
          workspaceId: workspaceId,
        },
      });

      if (validProjects !== projectIdsInt.length) {
        return {
          success: false,
          error: "One or more selected projects are invalid",
        };
      }
    }

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        workspaceId: workspaceId,
        email: email,
        role: roleEnum,
        projectIds: projectIdsInt,
        invitedById: userId,
        expiresAt: expiresAt,
      },
      include: {
        workspace: true,
        invitedBy: true,
      },
    });

    // Get project names if any were assigned
    let projectNames: string[] = [];
    if (projectIdsInt.length > 0) {
      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIdsInt },
        },
        select: {
          name: true,
        },
      });
      projectNames = projects.map((p) => p.name);
    }

    // Send invitation email
    await sendInvitationEmail({
      to: email,
      inviterName: invitation.invitedBy.name,
      workspaceName: invitation.workspace.name,
      role: role,
      invitationId: invitation.id,
      expiresAt: invitation.expiresAt,
      projectNames: projectNames.length > 0 ? projectNames : undefined,
    });

    return {
      success: true,
      invitationId: invitation.id,
    };
  } catch (error) {
    console.error("Failed to send invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
}

/**
 * Fetches projects where the current user is the owner (has OWNER or ADMIN role in workspace).
 * Used for project selection when inviting members.
 */
export async function getUserOwnedProjects() {
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

    // Find user's workspace membership
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        projects: [],
      };
    }

    // Only owners and admins can assign projects to invitations
    if (userMembership.role !== "OWNER" && userMembership.role !== "ADMIN") {
      return {
        projects: [],
        error: "Insufficient permissions",
      };
    }

    const workspaceId = userMembership.workspaceId;

    // Fetch all active projects in the workspace
    const projectsData = await prisma.project.findMany({
      where: {
        workspaceId: workspaceId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const projects = projectsData.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      color: p.color,
    }));

    return {
      projects,
    };
  } catch (error) {
    console.error("Failed to fetch user owned projects:", error);
    return {
      projects: [],
      error: "Failed to load projects",
    };
  }
}

/**
 * Resends an invitation email.
 */
export async function resendInvitation(invitationId: string) {
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

    // Find user's workspace membership
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        success: false,
        error: "You don't belong to any workspace",
      };
    }

    // Only owners and admins can resend
    if (userMembership.role !== "OWNER" && userMembership.role !== "ADMIN") {
      return {
        success: false,
        error: "Only owners and admins can resend invitations",
      };
    }

    // Get invitation
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: parseInt(invitationId, 10),
      },
      include: {
        workspace: true,
        invitedBy: true,
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // Verify it belongs to user's workspace
    if (invitation.workspaceId !== userMembership.workspaceId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if invitation is still pending
    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: "Can only resend pending invitations",
      };
    }

    // Extend expiration by 7 days from now
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        expiresAt: newExpiresAt,
      },
    });

    // Get project names if any were assigned
    let projectNames: string[] = [];
    if (invitation.projectIds.length > 0) {
      const projects = await prisma.project.findMany({
        where: {
          id: { in: invitation.projectIds },
        },
        select: {
          name: true,
        },
      });
      projectNames = projects.map((p) => p.name);
    }

    // Send invitation email
    await sendInvitationEmail({
      to: invitation.email,
      inviterName: invitation.invitedBy.name,
      workspaceName: invitation.workspace.name,
      role: invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase(),
      invitationId: invitation.id,
      expiresAt: newExpiresAt,
      projectNames: projectNames.length > 0 ? projectNames : undefined,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to resend invitation:", error);
    return {
      success: false,
      error: "Failed to resend invitation",
    };
  }
}

/**
 * Revokes (cancels) a pending invitation.
 */
export async function revokeInvitation(invitationId: string) {
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

    // Find user's workspace membership
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!userMembership) {
      return {
        success: false,
        error: "You don't belong to any workspace",
      };
    }

    // Only owners and admins can revoke
    if (userMembership.role !== "OWNER" && userMembership.role !== "ADMIN") {
      return {
        success: false,
        error: "Only owners and admins can revoke invitations",
      };
    }

    // Get invitation
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: parseInt(invitationId, 10),
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // Verify it belongs to user's workspace
    if (invitation.workspaceId !== userMembership.workspaceId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Update status to cancelled
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to revoke invitation:", error);
    return {
      success: false,
      error: "Failed to revoke invitation",
    };
  }
}

/**
 * Accepts an invitation and creates workspace membership.
 */
export async function acceptInvitation(invitationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized - Please log in",
      };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Get invitation
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: parseInt(invitationId, 10),
      },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found",
      };
    }

    // Verify email matches
    if (invitation.email !== userEmail) {
      return {
        success: false,
        error: "This invitation was sent to a different email address",
      };
    }

    // Check if invitation is still pending
    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: "This invitation is no longer valid",
      };
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return {
        success: false,
        error: "This invitation has expired",
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: userId,
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "You are already a member of this workspace",
      };
    }

    // Create workspace member
    const workspaceMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: userId,
        role: invitation.role,
        status: "ACTIVE",
      },
    });

    // Assign to projects if any
    if (invitation.projectIds.length > 0) {
      const projectAssignments = invitation.projectIds.map((projectId) => ({
        projectId: projectId,
        workspaceMemberId: workspaceMember.id,
        role: "MEMBER" as const,
      }));

      await prisma.projectMember.createMany({
        data: projectAssignments,
      });
    }

    // Update invitation status
    await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    return {
      success: true,
      workspaceSlug: invitation.workspace.slug,
    };
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return {
      success: false,
      error: "Failed to accept invitation",
    };
  }
}
