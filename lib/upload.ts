import { createClient } from "@supabase/supabase-js";
import { encrypt, decrypt } from "@/lib/crypto";

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
 * Checks whether a stored fileUrl is a legacy public URL (not encrypted).
 *
 * Legacy URLs start with "http" (i.e. the Supabase public URL).
 * New encrypted attachments store just the storage path.
 */
export function isLegacyUrl(fileUrl: string): boolean {
  return fileUrl.startsWith("http://") || fileUrl.startsWith("https://");
}

/**
 * Uploads a file to the `task-attachments` bucket in Supabase Storage.
 *
 * The file is **encrypted with AES-256-GCM** before upload so that even
 * someone with direct access to the Supabase bucket cannot view the content.
 * Decryption happens server-side only after authentication.
 *
 * @param file     - The raw file contents as a Buffer (plaintext).
 * @param fileName - A unique storage path/name for the file.
 * @param _mimeType - The MIME type (used for metadata; actual stored blob is
 *                    opaque encrypted data).
 * @returns The storage **path** (not a public URL). Store this in your DB.
 * @throws If the upload fails.
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  _mimeType: string,
): Promise<string> {
  const supabase = createStorageClient();

  // 1. Encrypt the file contents before uploading
  const encryptedBuffer = encrypt(file);

  // 2. Upload the encrypted blob to Supabase Storage
  //    The content type is "application/octet-stream" because the stored blob
  //    is no longer a viewable image — it's opaque encrypted data.
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, encryptedBuffer, {
      contentType: "application/octet-stream",
      upsert: false,
    });

  if (error) {
    if (error.message?.includes("Bucket not found")) {
      throw new Error(
        `Supabase Storage bucket '${BUCKET_NAME}' does not exist. ` +
          `Please create it manually:\n` +
          `1. Go to https://supabase.com/dashboard/project/ncqucnaglulxmzrqmxze/storage/buckets\n` +
          `2. Click "Create bucket"\n` +
          `3. Name: "${BUCKET_NAME}", Public: ON\n` +
          `4. Click "Create bucket"`,
      );
    }
    throw new Error(
      `Failed to upload file to Supabase Storage: ${error.message}`,
    );
  }

  // 3. Return the storage path (NOT a public URL — the file is encrypted)
  return data.path;
}

/**
 * Downloads and decrypts a file from the `task-attachments` bucket.
 *
 * This is the reverse of {@link uploadFile}. It fetches the encrypted blob
 * from Supabase, decrypts it with AES-256-GCM, and returns the plaintext.
 *
 * @param storagePath - The path returned by {@link uploadFile}.
 * @returns The decrypted file contents as a Buffer.
 * @throws If the file doesn't exist or decryption fails.
 */
export async function downloadFile(storagePath: string): Promise<Buffer> {
  const supabase = createStorageClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error || !data) {
    throw new Error(
      `Failed to download file from Supabase Storage: ${error?.message || "Unknown error"}`,
    );
  }

  const encryptedBuffer = Buffer.from(await data.arrayBuffer());
  return decrypt(encryptedBuffer);
}

/**
 * Downloads a file from a legacy public URL (for backward compatibility).
 *
 * Used by the serve endpoint to proxy old attachments that were stored before
 * encryption was introduced.
 */
export async function downloadFromPublicUrl(
  publicUrl: string,
): Promise<Buffer> {
  const response = await fetch(publicUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to download legacy file: ${response.status} ${response.statusText}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Deletes a file from the `task-attachments` bucket in Supabase Storage.
 *
 * Accepts both legacy public URLs and modern storage paths.
 *
 * @param fileUrlOrPath - Either a legacy public URL or a modern storage path.
 * @throws If the file path cannot be determined or the delete operation fails.
 */
export async function deleteFile(fileUrlOrPath: string): Promise<void> {
  // Determine the storage path
  let filePath: string;

  if (isLegacyUrl(fileUrlOrPath)) {
    const extracted = extractPathFromUrl(fileUrlOrPath);
    if (!extracted) {
      throw new Error(
        `Could not extract file path from URL. Expected a Supabase Storage URL ` +
          `containing "/object/public/${BUCKET_NAME}/".`,
      );
    }
    filePath = extracted;
  } else {
    // Modern storage path — use as-is
    filePath = fileUrlOrPath;
  }

  const supabase = createStorageClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    throw new Error(
      `Failed to delete file from Supabase Storage: ${error.message}`,
    );
  }
}
