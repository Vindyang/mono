# Plan: Task Image Preview on Detail Page

## Analysis

The system already supports **image upload during task creation** (via `TaskModal` → `FileReader` base64 encoding → stored in `task.image` column). All server actions (`createTask`, `updateTask`, `getTaskById`, `getTasksData`) already handle the `image` field correctly.

## What's Missing

The only gap is rendering the image on the task detail page at [`app/(authenticated)/tasks/[id]/page.tsx`](<app/(authenticated)/tasks/[id]/page.tsx>). The `task.image` is available via `getTaskById()` but is never displayed in the UI.

## Scope

- **Task:** Single — add an image preview card to `/tasks/[id]/page.tsx`
- **File to modify:** `app/(authenticated)/tasks/[id]/page.tsx`
- **No new components, no new API routes, no schema changes**
