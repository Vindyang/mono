"use client";

import { useState } from "react";
import { Trash2, FileText } from "lucide-react";
import { Attachment } from "@/lib/types/attachment";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function isImageMimeType(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/");
}

interface AttachmentGalleryProps {
  attachments: Attachment[];
  taskImage: string | null;
}

export function AttachmentGallery({
  attachments,
  taskImage,
}: AttachmentGalleryProps) {
  const router = useRouter();
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDelete = async (attachment: Attachment) => {
    if (deletingIds.has(attachment.id)) return;

    setDeletingIds((prev) => new Set(prev).add(attachment.id));

    try {
      const response = await fetch(`/api/upload/${attachment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to delete attachment");
      }

      toast.success("Attachment deleted");
      router.refresh();
    } catch (error) {
      console.error("Delete attachment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete attachment",
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(attachment.id);
        return next;
      });
    }
  };

  return (
    <>
      {/* Legacy base64 image */}
      {taskImage && (
        <div className="relative group mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={taskImage}
            alt="Task attachment"
            className="w-full rounded-lg object-cover max-h-[500px] ring-1 ring-inset ring-black/5 dark:ring-white/10 transition-all duration-300 group-hover:ring-black/10 dark:group-hover:ring-white/20 group-hover:shadow-md"
          />
        </div>
      )}

      {/* Attachments gallery grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group relative flex flex-col items-center gap-2 rounded-lg border border-border p-3 transition-all duration-200 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
            >
              {/* Delete button */}
              <button
                onClick={() => handleDelete(attachment)}
                disabled={deletingIds.has(attachment.id)}
                className="absolute top-1.5 right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              {/* Thumbnail / Icon - clicking opens the file */}
              <a
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full aspect-square rounded-md overflow-hidden bg-muted flex items-center justify-center"
              >
                {isImageMimeType(attachment.mimeType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.fileUrl}
                    alt={attachment.fileName}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <FileText className="h-8 w-8 text-muted-foreground" />
                )}
              </a>

              {/* File name */}
              <span className="text-xs font-medium text-foreground text-center leading-tight line-clamp-2 w-full">
                {attachment.fileName}
              </span>

              {/* File size */}
              {attachment.fileSize != null && (
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
