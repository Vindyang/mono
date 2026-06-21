import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
  try {
    // 1. Validate authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const taskId = formData.get("taskId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // 3. Extract file metadata
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalFileName = (file as File).name || "unnamed";
    const mimeType = file.type || "application/octet-stream";

    // Generate a unique, sanitized filename to avoid collisions in Supabase Storage
    // Remove special chars, spaces, and non-ASCII characters
    const timestamp = Date.now();
    const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${timestamp}-${sanitizedName}`;

    // 4. Upload to Supabase Storage (auto-encrypted inside uploadFile)
    const storagePath = await uploadFile(buffer, uniqueFileName, mimeType);

    // 5. If taskId is provided, create attachment record in Prisma
    if (taskId) {
      const attachment = await prisma.attachment.create({
        data: {
          taskId: parseInt(taskId, 10),
          fileName: originalFileName,
          fileUrl: storagePath,
          fileSize: buffer.length,
          mimeType,
        },
      });

      return NextResponse.json(
        {
          attachment: {
            id: attachment.id.toString(),
            taskId: attachment.taskId.toString(),
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            createdAt: attachment.createdAt.toISOString(),
          },
        },
        { status: 200 },
      );
    }

    // 6. No taskId — return pending attachment (no DB record yet)
    return NextResponse.json(
      {
        pendingAttachment: {
          fileUrl: storagePath,
          fileName: originalFileName,
          fileSize: buffer.length,
          mimeType,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Upload error details:", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
