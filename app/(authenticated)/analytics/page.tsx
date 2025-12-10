
"use client";

import { useTasksStatistics } from "@/hooks/use-tasks-statistics";
import { INITIAL_TASKS } from "@/lib/data";
import { KPICard } from "@/components/analytics/kpi-card";
import { BurndownChart } from "@/components/analytics/charts/burndown-chart";
import { CheckCircle2, Clock, AlertCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Task } from "@/lib/types/task";

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In a real app this would be a fetch call or context subscription
    setTasks(INITIAL_TASKS);
  }, []);

  const stats = useTasksStatistics(tasks);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your productivity and task completion
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={Calendar}
          description="All time tasks"
        />
        <KPICard
          title="Completed"
          value={stats.completedTasks}
          icon={CheckCircle2}
          description={`Completion rate: ${stats.completionRate}%`}
        />
        <KPICard
          title="Pending"
          value={stats.pendingTasks}
          icon={Clock}
          description="Tasks remaining"
        />
        <KPICard
          title="Overdue"
          value={stats.overdueTasks}
          icon={AlertCircle}
          description="Past due date"
          className=""
        />
      </div>

      {/* Charts */}
      <div className="mt-8">
        <BurndownChart data={stats.burndownData} />
      </div>
    </div>
  );
}
