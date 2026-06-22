"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Image as ImageIcon,
  User,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  File,
  FileImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Task, TaskFormData } from "@/lib/types/task";
import { Project } from "@/lib/types/project";
import { Attachment } from "@/lib/types/attachment";
import { getProjectMembers } from "../componentsaction/actions";

interface ProjectMember {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface TaskSubmitData extends Omit<
  Task,
  "id" | "created_at" | "updated_at"
> {
  attachmentIds?: string[];
  pendingAttachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileSize: number | null;
    mimeType: string | null;
  }>;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  projectMembers?: ProjectMember[];
  onSubmit: (data: TaskSubmitData) => void;
  initialDate?: string;
}

function getInitialFormData(
  task: Task | null | undefined,
  projects: Project[],
  initialDate?: string,
): TaskFormData {
  if (task) {
    return {
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority || "medium",
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      image: task.image || null,
      projectId: task.projectId,
      assigneeIds: task.assignees ? task.assignees.map((a) => a.id) : [],
      attachments: task.attachments || [],
    };
  }
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: initialDate ? new Date(initialDate) : undefined,
    image: null,
    projectId: projects.length > 0 ? projects[0].id : "",
    assigneeIds: [],
    attachments: [],
  };
}

export function TaskModal({
  isOpen,
  onClose,
  task,
  projects,
  projectMembers: externalMembers,
  onSubmit,
  initialDate,
}: TaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>(() =>
    getInitialFormData(task, projects, initialDate),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalMembers, setInternalMembers] = useState<ProjectMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  // Use externally provided members if available, otherwise fetch internally
  const projectMembers = externalMembers?.length
    ? externalMembers
    : internalMembers;

  // Fetch project members when selected project changes
  useEffect(() => {
    if (!formData.projectId || externalMembers?.length) {
      setInternalMembers([]);
      return;
    }

    let cancelled = false;
    setIsLoadingMembers(true);

    getProjectMembers(formData.projectId).then(({ members }) => {
      if (!cancelled) {
        setInternalMembers(members);
        setIsLoadingMembers(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [formData.projectId, externalMembers]);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(task, projects, initialDate));
      setErrors({});
    }
  }, [isOpen, task, projects, initialDate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Project is required";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Legacy image handlers (backward compat)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors({ ...errors, image: "Image size must be less than 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
        setErrors({ ...errors, image: "" }); // Clear error if any
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Attachment upload handler
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit for attachments)
    if (file.size > 10 * 1024 * 1024) {
      setErrors({
        ...errors,
        attachments: "File size must be less than 10MB",
      });
      return;
    }

    setUploadingAttachments(true);
    setErrors({ ...errors, attachments: "" });

    try {
      const formPayload = new FormData();
      formPayload.append("file", file);
      // Send taskId when editing so the DB record is created immediately
      if (task?.id) {
        formPayload.append("taskId", task.id);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Upload failed");
      }

      const data = await response.json();

      if (data.attachment) {
        // Editing: DB record was created, use the returned attachment
        const attachment: Attachment = data.attachment;
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), attachment],
        }));
      } else if (data.pendingAttachment) {
        // Creating: no taskId yet, store as pending with a temp ID
        const pending: Attachment = {
          id: `pending-${Date.now()}`,
          taskId: "",
          fileName: data.pendingAttachment.fileName,
          fileUrl: data.pendingAttachment.fileUrl,
          fileSize: data.pendingAttachment.fileSize,
          mimeType: data.pendingAttachment.mimeType,
          createdAt: new Date().toISOString(),
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), pending],
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors({
        ...errors,
        attachments:
          error instanceof Error ? error.message : "Failed to upload file",
      });
    } finally {
      setUploadingAttachments(false);
      // Reset the file input so the same file can be re-selected
      if (attachmentFileInputRef.current) {
        attachmentFileInputRef.current.value = "";
      }
    }
  };

  // Attachment remove handler
  const handleRemoveAttachment = async (attachment: Attachment) => {
    // If this is a pending attachment (no DB record), just remove from local state
    if (attachment.id.startsWith("pending-")) {
      setFormData((prev) => ({
        ...prev,
        attachments: (prev.attachments || []).filter(
          (a) => a.id !== attachment.id,
        ),
      }));
      return;
    }

    // Optimistically remove from local state for persisted attachments
    setFormData((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter(
        (a) => a.id !== attachment.id,
      ),
    }));

    try {
      const response = await fetch(`/api/upload/${attachment.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to delete attachment");
      }
    } catch (error) {
      console.error("Delete attachment error:", error);
      // Re-add the attachment on failure
      setFormData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), attachment],
      }));
      setErrors({
        ...errors,
        attachments:
          error instanceof Error
            ? error.message
            : "Failed to remove attachment",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const attachments = formData.attachments || [];
      const persistentAttachmentIds = attachments
        .filter((a) => !a.id.startsWith("pending-"))
        .map((a) => a.id);
      const pendingAttachments = attachments.filter((a) =>
        a.id.startsWith("pending-"),
      );

      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
        priority: formData.priority || null,
        due_date: formData.dueDate ? formData.dueDate.toISOString() : null,
        image: formData.image || null,
        projectId: formData.projectId,
        assigneeIds: formData.assigneeIds,
        attachmentIds: persistentAttachmentIds,
        pendingAttachments: pendingAttachments.map((a) => ({
          fileUrl: a.fileUrl,
          fileName: a.fileName,
          fileSize: a.fileSize,
          mimeType: a.mimeType,
        })),
      };

      await onSubmit(taskData);
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setErrors({});
      onClose();
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number | null): string => {
    if (bytes === null || bytes === undefined) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check if a file is an image by mime type
  const isImageFile = (mimeType: string | null): boolean => {
    if (!mimeType) return false;
    return mimeType.startsWith("image/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        key={task?.id ?? "create-task"}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
              TITLE *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Task title"
              className={`${
                errors.title ? "border-destructive" : "border-input"
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-destructive text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
              PROJECT *
            </label>
            <Select
              value={formData.projectId}
              onValueChange={(value) =>
                setFormData({ ...formData, projectId: value })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={errors.projectId ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && (
              <p className="text-destructive text-xs mt-1">
                {errors.projectId}
              </p>
            )}
          </div>

          {/* Assignees */}
          {projectMembers.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
                ASSIGNEES
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[42px] border border-input rounded-md p-2">
                  {formData.assigneeIds && formData.assigneeIds.length > 0 ? (
                    formData.assigneeIds.map((assigneeId) => {
                      const member = projectMembers.find(
                        (m) => m.id === assigneeId,
                      );
                      if (!member) return null;
                      return (
                        <Badge
                          key={assigneeId}
                          variant="secondary"
                          className="flex items-center gap-1.5 px-2 py-1"
                        >
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={member.image} alt={member.name} />
                            <AvatarFallback className="text-[8px]">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                assigneeIds:
                                  formData.assigneeIds?.filter(
                                    (id) => id !== assigneeId,
                                  ) || [],
                              });
                            }}
                            className="ml-1 hover:text-destructive"
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      No assignees selected
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border border-border rounded-md p-2">
                  {projectMembers.map((member) => {
                    const isSelected = formData.assigneeIds?.includes(
                      member.id,
                    );
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              assigneeIds:
                                formData.assigneeIds?.filter(
                                  (id) => id !== member.id,
                                ) || [],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              assigneeIds: [
                                ...(formData.assigneeIds || []),
                                member.id,
                              ],
                            });
                          }
                        }}
                        className={`flex items-center gap-3 p-2 rounded-md hover:bg-secondary transition-colors text-left ${
                          isSelected ? "bg-secondary" : ""
                        }`}
                        disabled={isSubmitting}
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback className="text-[10px]">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {member.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {member.email}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-primary-foreground"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
              DESCRIPTION
            </label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional details"
              rows={3}
              className={`${
                errors.description ? "border-destructive" : "border-input"
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-destructive text-xs mt-1">
                {errors.description}
              </p>
            )}
          </div>

          {/* Legacy Image Upload (backward compat) */}
          {formData.image ? (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
                IMAGE
              </label>
              <div className="relative rounded-md overflow-hidden border border-border group h-48 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.image}
                  alt="Task attachment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="h-8"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Legacy image hidden input (keep for backward compat) */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
              ATTACHMENTS
            </label>
            <div className="space-y-3">
              {/* Existing attachments list */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="border border-border rounded-md divide-y divide-border">
                  {formData.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 px-3 py-2.5 group hover:bg-secondary/50 transition-colors"
                    >
                      {/* Thumbnail / Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-border bg-muted flex items-center justify-center">
                        {isImageFile(attachment.mimeType) &&
                        !attachment.id.startsWith("pending-") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/serve/${attachment.id}`}
                            alt={attachment.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <File className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.fileName}
                        </p>
                        {attachment.fileSize !== null && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        )}
                      </div>

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveAttachment(attachment)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Attachment Button */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => attachmentFileInputRef.current?.click()}
                  disabled={isSubmitting || uploadingAttachments}
                  className="h-9"
                >
                  {uploadingAttachments ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4 mr-2" />
                      Add Attachment
                    </>
                  )}
                </Button>
                <input
                  type="file"
                  ref={attachmentFileInputRef}
                  className="hidden"
                  onChange={handleAttachmentUpload}
                  disabled={isSubmitting || uploadingAttachments}
                />
              </div>

              {errors.attachments && (
                <p className="text-destructive text-xs mt-1">
                  {errors.attachments}
                </p>
              )}
            </div>
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
                STATUS
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: Task["status"]) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
                PRIORITY
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2 tracking-wide">
              DUE DATE
            </label>
            <DatePicker
              date={formData.dueDate}
              onSelect={(date) =>
                setFormData({
                  ...formData,
                  dueDate: date,
                })
              }
              placeholder="Select due date"
              disabled={isSubmitting}
              className={`${errors.dueDate ? "border-destructive" : ""}`}
            />
            {errors.dueDate && (
              <p className="text-destructive text-xs mt-1">{errors.dueDate}</p>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                {task ? "Updating..." : "Creating..."}
              </>
            ) : task ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
