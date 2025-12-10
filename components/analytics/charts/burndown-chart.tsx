
"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BurndownChartProps {
  data: { date: string; remaining: number }[];
}

export function BurndownChart({ data }: BurndownChartProps) {
  return (
    <Card className="col-span-4 shadow-sm border-border/50">
      <CardHeader className="pb-8">
        <CardTitle className="text-lg font-medium tracking-tight">Remaining Tasks</CardTitle>
        <p className="text-sm text-muted-foreground">
          Burndown chart showing pending tasks over time
        </p>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickMargin={20}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`}
                tickMargin={20}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--popover)", 
                  borderColor: "var(--border)", 
                  color: "var(--popover-foreground)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "12px"
                }}
                cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Line 
                type="monotone" 
                dataKey="remaining" 
                name="Remaining Tasks" 
                stroke="var(--primary)" 
                strokeWidth={2}
                dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4, stroke: "var(--background)" }}
                activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
