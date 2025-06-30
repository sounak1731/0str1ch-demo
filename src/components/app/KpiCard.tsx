
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Comment } from "@/lib/types";

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export const mockComments: Comment[] = [
    { id: 'c9', user: 'Finance Analyst', avatarFallback: 'FA', text: 'Revenue is tracking nicely against our Q2 goals.', resolved: false },
    { id: 'c10', user: 'Sales Ops', avatarFallback: 'SO', text: 'Let\'s keep an eye on the average sale value. It dipped slightly last week.', resolved: false },
];

export function KpiCard({ title, value, description, icon }: KpiCardProps) {
    const isPositive = description.startsWith('+');
  return (
    <Card className="flex flex-col h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn("text-xs", isPositive ? "text-green-500" : "text-red-500")}>
            {description}
        </p>
      </CardContent>
    </Card>
  );
}
