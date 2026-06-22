import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { downloadFile, downloadFromPublicUrl, isLegacyUrl } from "@/lib/upload";

export async function GET(
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

    const { id } = await params;
    const attachmentId = parseInt(id, 10);

    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { error: "Invalid attachment id" },
        { status: 400 },
      );
    }

    // 2. Fetch the attachment record with its task (to verify project access)
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

    // 3. Verify the user has access to the owning project
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

    // 4. Download the file (encrypted + decrypt, or proxy legacy URL)
    let plaintextBuffer: Buffer;

    if (isLegacyUrl(attachment.fileUrl)) {
      // Pre-encryption attachment — download directly from the public URL
      plaintextBuffer = await downloadFromPublicUrl(attachment.fileUrl);
    } else {
      // Modern encrypted attachment — download and decrypt
      plaintextBuffer = await downloadFile(attachment.fileUrl);
    }

    // 5. Determine the correct content type for the response
    const contentType = attachment.mimeType || "application/octet-stream";

    // 6. Return the decrypted file as a streamable response
    //    Convert to Uint8Array for compatibility with NextResponse body
    const body = new Uint8Array(plaintextBuffer);

    // Use RFC 5987 encoding for non-ASCII filenames to avoid ByteString errors
    const encodedFilename = encodeURIComponent(attachment.fileName);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": plaintextBuffer.length.toString(),
        "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
        // Prevent caching of sensitive files
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Serve attachment error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Decryption failed")) {
        return NextResponse.json(
          {
            error:
              "File decryption failed. The encryption key may have changed.",
          },
          { status: 500 },
        );
      }
      if (error.message.includes("Failed to download")) {
        return NextResponse.json(
          { error: "Failed to retrieve file from storage" },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
