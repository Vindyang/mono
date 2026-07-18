import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

type InvitationWithWorkspace = Prisma.invitationGetPayload<{
  include: { workspace: true };
}>;

type InvitationErrorCode =
  | "NOT_FOUND"
  | "EXPIRED"
  | "INVALID_STATUS";

type GetInvitationResult =
  | { ok: true; invitation: InvitationWithWorkspace }
  | { ok: false; code: InvitationErrorCode; error: string };

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getValidPendingInvitation(
  token: string
): Promise<GetInvitationResult> {
  // The token column is a Postgres uuid; a malformed token would otherwise
  // throw a DB-level error instead of a clean not-found result.
  if (!UUID_REGEX.test(token)) {
    return { ok: false, code: "NOT_FOUND", error: "Invitation not found" };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invitation) {
    return { ok: false, code: "NOT_FOUND", error: "Invitation not found" };
  }

  if (invitation.status !== "PENDING") {
    return {
      ok: false,
      code: "INVALID_STATUS",
      error: "This invitation is no longer valid",
    };
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    return {
      ok: false,
      code: "EXPIRED",
      error: "This invitation has expired",
    };
  }

  return { ok: true, invitation };
}

type CompleteAcceptanceResult =
  | { success: true; workspaceSlug: string }
  | { success: false; error: string };

export async function completeInvitationAcceptance(
  invitation: InvitationWithWorkspace,
  userId: string
): Promise<CompleteAcceptanceResult> {
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

  const workspaceMember = await prisma.workspaceMember.create({
    data: {
      workspaceId: invitation.workspaceId,
      userId: userId,
      role: invitation.role,
      status: "ACTIVE",
    },
  });

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

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
    },
  });

  return {
    success: true,
    workspaceSlug: invitation.workspace.slug,
  };
}
