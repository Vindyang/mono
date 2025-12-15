"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { TeamMember } from "@/lib/types/team";
import dayjs from "dayjs";

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
        stats: { totalMembers: 0, activeMembers: 0, pendingInvites: 0, newMembersLastMonth: 0 },
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
        stats: { totalMembers: 0, activeMembers: 0, pendingInvites: 0, newMembersLastMonth: 0 },
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
                name: true
              }
            }
          }
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
      role: m.role.charAt(0) + m.role.slice(1).toLowerCase() as any, // "MEMBER" -> "Member" (casting to any/specific union)
      status: m.status.toLowerCase() as "active" | "offline" | "busy",
      joinedAt: dayjs(m.joinedAt).format("YYYY-MM-DD"),
      projects: m.projectAssignments.map(pa => ({
        id: pa.projectId.toString(),
        name: pa.project.name
      })),
    }));

    // 5. Calculate Stats
    const totalMembers = members.length;
    const activeMembers = members.filter((m) => m.status === "active").length;
    const oneMonthAgo = dayjs().subtract(1, 'month');
    const newMembersLastMonth = members.filter((m) => dayjs(m.joinedAt).isAfter(oneMonthAgo)).length;

    return {
      members,
      currentUserId: userId,
      currentUserRole: userMembership.role.charAt(0) + userMembership.role.slice(1).toLowerCase() as any,
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
      stats: { totalMembers: 0, activeMembers: 0, pendingInvites: 0, newMembersLastMonth: 0 },
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
      role: inv.role.charAt(0) + inv.role.slice(1).toLowerCase() as any,
      status: inv.status.toLowerCase() as any,
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
