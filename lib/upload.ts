import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "task-attachments";

/**
 * Creates a Supabase admin client for server-side storage operations.
 *
 * Uses the service role key to bypass RLS.
 * This is SAFE because this code only runs on the server (never exposed to the client).
 *
 * Since this project uses better-auth (not Supabase Auth), there is no Supabase
 * JWT session available on the server for RLS to evaluate. The service role key
 * is the correct approach for server-to-server operations in this scenario.
 *
 * You can find your service role key at:
 * https://supabase.com/dashboard/project/ncqucnaglulxmzrqmxze/settings/api
 */
function createStorageClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set.\n" +
        "Add it to your .env file:\n" +
        "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n\n" +
        "Find it at: https://supabase.com/dashboard/project/ncqucnaglulxmzrqmxze/settings/api\n" +
        "Under Project API keys → service_role key",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key);
}

/**
 * Extracts the file path from a Supabase Storage public URL.
 *
 * Expected URL pattern:
 *   {SUPABASE_URL}/storage/v1/object/public/task-attachments/{filePath}
 *
 * Returns the portion after the bucket name, or null if the URL doesn't match.
 */
function extractPathFromUrl(fileUrl: string): string | null {
  const prefix = `/object/public/${BUCKET_NAME}/`;
  const idx = fileUrl.indexOf(prefix);

  if (idx === -1) return null;

  return fileUrl.slice(idx + prefix.length);
}

/**
 * Uploads a file to the `task-attachments` bucket in Supabase Storage.
 *
 * @param file     - The raw file contents as a Buffer.
 * @param fileName - The original file name (used as-is; consider generating
 *                   a unique name on the caller side to avoid collisions).
 * @param mimeType - The MIME type of the file (e.g. "image/png").
 * @returns The public URL of the uploaded file.
 * @throws If the upload fails (e.g. bucket does not exist, network error).
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const supabase = createStorageClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    if (error.message?.includes("Bucket not found")) {
      throw new Error(
        `Supabase Storage bucket '${BUCKET_NAME}' does not exist. ` +
          `Please create it manually:\n` +
          `1. Go to https://supabase.com/dashboard/project/ncqucnaglulxmzrqmxze/storage/buckets\n` +
          `2. Click "Create bucket"\n` +
          `3. Name: "task-attachments", Public: ON\n` +
          `4. Click "Create bucket"`,
      );
    }
    throw new Error(
      `Failed to upload file to Supabase Storage: ${error.message}`,
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Deletes a file from the `task-attachments` bucket in Supabase Storage.
 *
 * @param fileUrl - The public URL of the file to delete (the path is
 *                  extracted automatically).
 * @throws If the file path cannot be parsed or the delete operation fails.
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  const filePath = extractPathFromUrl(fileUrl);

  if (!filePath) {
    throw new Error(
      `Could not extract file path from URL. Expected a Supabase Storage URL ` +
        `containing "/object/public/${BUCKET_NAME}/".`,
    );
  }

  const supabase = createStorageClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    throw new Error(
      `Failed to delete file from Supabase Storage: ${error.message}`,
    );
  }
}
