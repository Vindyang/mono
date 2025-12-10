
"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityTrendChartProps {
  data: { date: string; created: number; completed: number }[];
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Activity Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis 
                dataKey="date" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
               <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--popover)", 
                  borderColor: "var(--border)", 
                  color: "var(--popover-foreground)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-soft)"
                }}
                cursor={{ fill: "var(--muted)" }}
              />
              <Legend />
              <Bar dataKey="created" name="Created" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
