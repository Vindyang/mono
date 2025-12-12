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
        workspace: true
      }
    });

    const data: SettingsData = {
      user: {
        name: user.name,
        email: user.email,
        image: user.image || "",
      },
      workspace: userMembership?.workspace ? {
        name: userMembership.workspace.name,
        slug: userMembership.workspace.slug
      } : undefined
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
