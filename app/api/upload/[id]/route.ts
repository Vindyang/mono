import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/upload";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Validate authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the attachment ID from the URL param
    const { id } = await params;
    const attachmentId = parseInt(id, 10);

    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { error: "Invalid attachment id" },
        { status: 400 },
      );
    }

    // 3. Fetch the attachment record with its task (to get the projectId)
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        task: {
          select: { projectId: true },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 },
      );
    }

    // 4. Verify the user has access to the owning project
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: attachment.task.projectId,
        workspaceMember: {
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Delete the file from Supabase Storage
    await deleteFile(attachment.fileUrl);

    // 6. Delete the attachment record from Prisma
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // 7. Return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete attachment error:", error);

    if (error instanceof Error) {
      if (
        error.message.includes("deleteFile") ||
        error.message.includes("Supabase Storage")
      ) {
        return NextResponse.json(
          { error: "Failed to delete file from storage" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
