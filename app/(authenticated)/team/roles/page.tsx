import { AlertTriangle } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <AlertTriangle className="h-6 w-6 text-zinc-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Advanced role management and custom permissions will be available in Phase 3 of development. 
            Currently, standard roles (Owner, Admin, Member, Viewer) are available.
        </p>
      </div>
    </div>
  );
}
