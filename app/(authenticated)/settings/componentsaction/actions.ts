"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SettingsData {
  user: {
    name: string;
    email: string;
    image: string;
  };
  workspace?: {
    name: string;
    slug: string;
  };
}

/**
 * Fetches data for the Settings page.
 * Returns user profile and workspace details.
 */
export async function getSettingsData() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        data: null,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;
    const user = session.user;

    // Fetch user's workspace
    const userMembership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userId,
      },
      include: {
        workspace: true,
      },
    });

    const data: SettingsData = {
      user: {
        name: user.name,
        email: user.email,
        image: user.image || "",
      },
      workspace: userMembership?.workspace
        ? {
            name: userMembership.workspace.name,
            slug: userMembership.workspace.slug,
          }
        : undefined,
    };

    return {
      data,
    };
  } catch (error) {
    console.error("Failed to fetch settings data:", error);
    return {
      data: null,
      error: "Failed to load settings data",
    };
  }
}

/**
 * Updates the user's profile.
 * Currently supports updating the name.
 */
export async function updateProfile(firstName: string, lastName: string) {
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
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!fullName) {
      return {
        success: false,
        error: "Name cannot be empty",
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: fullName,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      success: false,
      error: "Failed to update profile",
    };
  }
}

/**
 * Removes the user's profile picture.
 */
export async function removeProfilePicture() {
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

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        image: null,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to remove profile picture:", error);
    return {
      success: false,
      error: "Failed to remove profile picture",
    };
  }
}

/**
 * Permanently deletes the user's account and all associated data.
 *
 * Handles the `onDelete: Restrict` constraint on `task.createdBy` by first
 * deleting all tasks the user created, then letting cascading deletes handle
 * the rest (sessions, accounts, workspace memberships, comments, etc.).
 */
export async function deleteAccount() {
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

    // 1. Delete tasks created by this user (these have onDelete: Restrict on createdById)
    //    Cascading takes care of task_assignee, comments, attachments, activity_logs for these tasks
    await prisma.task.deleteMany({
      where: { createdById: userId },
    });

    // 2. Delete the user — cascading handles:
    //    - sessions, accounts (Better Auth)
    //    - workspace_member, task_assignee, comment, activity_log, sent_invitations
    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return {
      success: false,
      error: "Failed to delete account. Please try again or contact support.",
    };
  }
}
