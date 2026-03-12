"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Specialist } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface StatsChartsProps {
  specialists: Specialist[];
}

export function StatsCharts({ specialists }: StatsChartsProps) {
  const categoryData = useMemo(() => {
    const counts = specialists.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [specialists]);

  const roleData = useMemo(() => {
    const counts = specialists.reduce((acc, curr) => {
      acc[curr.role] = (acc[curr.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [specialists]);

  if (specialists.length === 0) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Category distribution</p>
            <CardTitle className="mt-2 text-2xl">Where the directory is deepest.</CardTitle>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            These slices show where the strongest representation currently sits inside the public list.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6 md:grid-cols-[240px_minmax(0,1fr)] md:items-center">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" innerRadius={62} outerRadius={94} paddingAngle={4} stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => [`${value} specialists`, "Profiles"]}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "var(--color-foreground)",
                    boxShadow: "0 18px 34px -28px rgba(0,0,128,0.45)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {categoryData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between rounded-[22px] border border-border/70 bg-white/72 px-4 py-3">
                <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
                <span className="text-sm font-semibold text-primary">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/70 pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Role concentration</p>
          <CardTitle className="mt-2 text-2xl">Most common operating titles.</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData} layout="vertical" margin={{ top: 0, right: 8, left: 12, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--color-foreground)" }}
                />
                <RechartsTooltip
                  formatter={(value: number) => [`${value} specialists`, "Profiles"]}
                  cursor={{ fill: "rgba(84,160,155,0.08)" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    color: "var(--color-foreground)",
                    boxShadow: "0 18px 34px -28px rgba(0,0,128,0.45)",
                  }}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[0, 999, 999, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
