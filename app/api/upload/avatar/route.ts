import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "avatars";

/**
 * Creates a Supabase admin client for server-side storage operations.
 */
function createStorageClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

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

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // 3. Validate file type (only images allowed for avatars)
    const mimeType = file.type || "application/octet-stream";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    // 4. Validate file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 2MB" },
        { status: 400 },
      );
    }

    // 5. Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Delete old avatar if exists
    if (session.user.image) {
      try {
        const oldPath = extractPathFromUrl(session.user.image);
        if (oldPath) {
          const supabase = createStorageClient();
          await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }
      } catch {
        // Ignore old file deletion failures
      }
    }

    // 7. Ensure the avatars bucket exists (auto-create if missing)
    const supabase = createStorageClient();
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        BUCKET_NAME,
        {
          public: true,
          fileSizeLimit: 2 * 1024 * 1024, // 2MB
        },
      );

      if (createError) {
        throw new Error(
          `Failed to create avatars bucket: ${createError.message}`,
        );
      }
    }

    // 8. Upload new avatar to Supabase Storage
    const fileExt = mimeType.split("/")[1] || "png";
    const fileName = `user_${session.user.id}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // 8. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    const avatarUrl = publicUrlData.publicUrl;

    // 9. Update user record in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: avatarUrl },
    });

    return NextResponse.json({ avatarUrl }, { status: 200 });
  } catch (error) {
    console.error("Avatar upload error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Extracts the file path from a Supabase Storage public URL.
 */
function extractPathFromUrl(fileUrl: string): string | null {
  const prefix = `/object/public/${BUCKET_NAME}/`;
  const idx = fileUrl.indexOf(prefix);
  if (idx === -1) return null;
  return fileUrl.slice(idx + prefix.length);
}
