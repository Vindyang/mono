import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm" as const;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

// Self-contained encrypted buffer layout:
// [IV (12 bytes)][Auth Tag (16 bytes)][Ciphertext]
const ENCRYPTED_OVERHEAD = IV_LENGTH + AUTH_TAG_LENGTH; // 28 bytes

/**
 * Returns the 256-bit (32-byte) AES key from the environment variable.
 *
 * The key is stored as a 64-character hex string in `.env`:
 *   ATTACHMENT_ENCRYPTION_KEY=<64 hex chars>
 *
 * Generate one with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
function getKey(): Buffer {
  const keyHex = process.env.ATTACHMENT_ENCRYPTION_KEY;

  if (!keyHex) {
    throw new Error(
      "ATTACHMENT_ENCRYPTION_KEY is not set.\n" +
        "Generate one with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"\n" +
        "Then add it to your .env file:\n" +
        "  ATTACHMENT_ENCRYPTION_KEY=<the generated hex string>",
    );
  }

  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypts a buffer using AES-256-GCM.
 *
 * Returns a self-contained buffer with the IV, auth tag, and ciphertext
 * concatenated together. This means you only need to store/transmit one blob
 * — no external IV tracking required.
 *
 * @param buffer - The plaintext data to encrypt.
 * @returns A single buffer: [IV (12 bytes)][Auth Tag (16 bytes)][Ciphertext].
 */
export function encrypt(buffer: Buffer): Buffer {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts a buffer that was previously encrypted with {@link encrypt}.
 *
 * Expects the same concatenated format:
 *   [IV (12 bytes)][Auth Tag (16 bytes)][Ciphertext]
 *
 * GCM provides authenticated encryption, so if the data was tampered with or
 * the wrong key is used, this will throw an error (not return garbage).
 *
 * @param encryptedBuffer - The encrypted blob produced by {@link encrypt}.
 * @returns The original plaintext buffer.
 * @throws If authentication fails (wrong key or tampered data).
 */
export function decrypt(encryptedBuffer: Buffer): Buffer {
  if (encryptedBuffer.length < ENCRYPTED_OVERHEAD) {
    throw new Error(
      `Encrypted buffer is too short (${encryptedBuffer.length} bytes). ` +
        `Expected at least ${ENCRYPTED_OVERHEAD} bytes.`,
    );
  }

  const key = getKey();

  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const authTag = encryptedBuffer.subarray(
    IV_LENGTH,
    IV_LENGTH + AUTH_TAG_LENGTH,
  );
  const ciphertext = encryptedBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}. ` +
        "This likely means the encryption key has changed or the file data is corrupted.",
    );
  }
}
