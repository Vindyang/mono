
import { useMemo } from "react";
import { Task } from "@/lib/types/task";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  statusDistribution: { name: string; value: number; fill: string }[];
  priorityDistribution: { name: string; value: number; fill: string }[];
  burndownData: { date: string; remaining: number }[];
  activityData: { date: string; created: number; completed: number }[];
}

export function useTasksStatistics(tasks: Task[]): TaskStatistics {
  return useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "done").length;
    const pendingTasks = totalTasks - completedTasks;
    
    const now = dayjs();
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done" || !t.due_date) return false;
      return dayjs(t.due_date).isBefore(now, "day");
    }).length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status Distribution
    const statusCounts = {
      todo: tasks.filter(t => t.status === "todo").length,
      in_progress: tasks.filter(t => t.status === "in_progress").length,
      done: tasks.filter(t => t.status === "done").length,
    };

    const statusDistribution = [
      { name: "Todo", value: statusCounts.todo, fill: "var(--muted)" }, // Lightest
      { name: "In Progress", value: statusCounts.in_progress, fill: "var(--muted-foreground)" }, // Medium
      { name: "Done", value: statusCounts.done, fill: "var(--primary)" }, // Darkest (Primary)
    ];

    // Priority Distribution
    const priorityCounts = {
      high: tasks.filter(t => t.priority === "high").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      low: tasks.filter(t => t.priority === "low").length,
      none: tasks.filter(t => !t.priority).length,
    };

    const priorityDistribution = [
      { name: "High", value: priorityCounts.high, fill: "var(--primary)" },
      { name: "Medium", value: priorityCounts.medium, fill: "var(--muted-foreground)" },
      { name: "Low", value: priorityCounts.low, fill: "var(--muted)" }, // Using muted for low/none
      { name: "None", value: priorityCounts.none, fill: "var(--border)" }, // Even lighter
    ];
    
    // Burndown Data (Remaining Tasks over last 7 days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        return dayjs().subtract(6 - i, 'day');
    });

    const burndownData = last7Days.map(day => {
        const dateStr = day.format('YYYY-MM-DD');
        const formattedDate = day.format('MMM D');
        
        // Count tasks created on or before this day
        const createdCount = tasks.filter(t => 
            dayjs(t.created_at).isSameOrBefore(day, 'day')
        ).length;

        // Count tasks completed on or before this day
        // Note: Using updated_at for completion date approximation as per previous logic
        const completedCount = tasks.filter(t => 
            t.status === 'done' && 
            dayjs(t.updated_at).isSameOrBefore(day, 'day')
        ).length;
        
        return {
            date: formattedDate,
            remaining: createdCount - completedCount
        };
    });

    // Activity Trend (Created vs Completed over last 7 days)
    const activityData = last7Days.map(day => {
        const formattedDate = day.format('MMM D');
        
        const createdCount = tasks.filter(t => 
            dayjs(t.created_at).isSame(day, 'day')
        ).length;

        const completedCount = tasks.filter(t => 
            t.status === 'done' && 
            dayjs(t.updated_at).isSame(day, 'day')
        ).length;
        
        return {
            date: formattedDate,
            created: createdCount,
            completed: completedCount
        };
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      statusDistribution,
      priorityDistribution,
      burndownData,
      activityData,
    };
  }, [tasks]);
}
