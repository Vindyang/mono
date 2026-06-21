# Plan: Refactor Task Images to Use Attachment Table with Supabase Storage

## Current State

- Images are stored as **base64 strings** directly in `task.image` column
- Prisma `attachment` table exists (with `taskId`, `fileName`, `fileUrl`, `fileSize`, `mimeType`) but is **never used**
- Supabase client is already set up (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- `task.image` is a single nullable column — one image per task max, no metadata

## Target State

- Files upload to **Supabase Storage** bucket (e.g., `task-attachments`)
- Each upload creates an `attachment` record with `fileName`, `fileUrl`, `fileSize`, `mimeType`
- `TaskModal` supports adding/removing multiple attachments
- Task detail page shows all attachments from the `attachment` table
- Legacy `task.image` is **kept as-is** for backward compatibility with existing data (displayed alongside new attachments)

## Architecture

```
User picks file → FileReader reads as ArrayBuffer
  → Client POSTs to /api/upload (multipart/form-data)
    → Server receives file, uploads to Supabase Storage
    → Creates attachment record in DB
    → Returns attachment { id, fileUrl, fileName, fileSize, mimeType }
```

## Files to Create

### 1. `lib/types/attachment.ts`

Shared type for the frontend.

```ts
export interface Attachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
}
```

### 2. `lib/upload.ts`

Server-side Supabase storage helpers.

- `uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>` — uploads to Supabase Storage bucket, returns public URL
- `deleteFile(fileUrl: string): Promise<void>` — deletes from Supabase Storage

### 3. `app/api/upload/route.ts`

POST endpoint:

- Receives `FormData` with `file` and `taskId`
- Validates auth (session via better-auth)
- Uploads to Supabase Storage
- Creates `attachment` record via Prisma
- Returns `{ attachment: Attachment }`

### 4. `app/api/upload/[id]/route.ts`

DELETE endpoint:

- Deletes attachment via Prisma (cascades file delete)
- Returns `{ success: true }`

## Files to Modify

### 5. `lib/types/task.ts`

Add `attachments?: Attachment[]` to the `Task` interface.

### 6. `app/(authenticated)/tasks/components/task-modal.tsx`

Major refactor of the IMAGE section:

- Replace single `fileInputRef` + base64 approach with a file upload flow
- Show existing attachments as a list with thumbnails + remove buttons
- Add "Add Attachment" button that triggers file picker
- On file select: upload via `/api/upload`, get back attachment, add to local state
- On remove: call `DELETE /api/upload/[id]`, remove from local state
- Remove `task.image` from `formData` (keep for backward compat)
- Pass `attachmentIds: number[]` in submit data

### 7. `app/(authenticated)/tasks/componentsaction/actions.ts`

- Update `createTask` and `updateTask` to handle `attachmentIds` (connect/disconnect)
- Add `attachments: true` to Prisma includes in `getTasksData` and `getTaskById`
- Update `Task` type transformations to include `attachments` data

### 8. `app/(authenticated)/tasks/[id]/page.tsx`

Update the "Image Preview" section (lines 192–208) to:

- Show legacy `task.image` if present
- Show all `task.attachments` from the attachment table in a gallery layout

### 9. `app/(authenticated)/projects/[id]/componentsaction/actions.ts`

- Add `image: true` to task select in `getProjectDetails` (already done)

### 10. `app/(authenticated)/projects/[id]/page.tsx`

- Update `openEditModal` to map attachments data into the Task shape

### 11. `next.config.ts`

- Add Supabase Storage URL to `images.remotePatterns` if needed for Next.js Image component
- Increase `bodyParser` size limit for uploads

## Sub-task Execution Order

| #   | Task                                                           | Mode | Description                                                |
| --- | -------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| 1   | Create `lib/types/attachment.ts`                               | code | Shared Attachment type                                     |
| 2   | Create `lib/upload.ts`                                         | code | Supabase Storage upload/delete helpers                     |
| 3   | Create `app/api/upload/route.ts`                               | code | POST upload endpoint                                       |
| 4   | Create `app/api/upload/[id]/route.ts`                          | code | DELETE attachment endpoint                                 |
| 5   | Modify `lib/types/task.ts`                                     | code | Add `attachments` to Task interface                        |
| 6   | Modify `app/(authenticated)/tasks/componentsaction/actions.ts` | code | Handle attachment IDs in create/update, include in queries |
| 7   | Modify `app/(authenticated)/tasks/components/task-modal.tsx`   | code | Refactor image upload to attachment-based flow             |
| 8   | Modify `app/(authenticated)/tasks/[id]/page.tsx`               | code | Show attachments gallery                                   |
| 9   | Modify `app/(authenticated)/projects/[id]/page.tsx`            | code | Map attachments in openEditModal                           |
| 10  | Update `next.config.ts`                                        | code | Images config + body size                                  |
