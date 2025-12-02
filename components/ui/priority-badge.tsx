import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const priorityBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      priority: {
        high: "border-priority-high/20 bg-priority-high/10 text-priority-high-foreground",
        medium: "border-priority-medium/20 bg-priority-medium/10 text-priority-medium-foreground",
        low: "border-priority-low/20 bg-priority-low/10 text-priority-low-foreground",
      },
    },
    defaultVariants: {
      priority: "low",
    },
  }
)

export interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof priorityBadgeVariants> {
  priority?: "high" | "medium" | "low" | null
}

function PriorityBadge({ className, priority, ...props }: PriorityBadgeProps) {
  if (!priority) return null

  return (
    <div className={cn(priorityBadgeVariants({ priority }), className)} {...props}>
      {priority.toUpperCase()}
    </div>
  )
}

export { PriorityBadge, priorityBadgeVariants }
