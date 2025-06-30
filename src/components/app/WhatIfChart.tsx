
"use client";

import { useState, useRef, useEffect } from "react";
import type { WhatIfScenario, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";

interface WhatIfChartProps {
  data: WhatIfScenario[];
  artifactName: string;
  onRename: (newName: string) => void;
}

const chartConfig = {
  pessimistic: { label: "Pessimistic", color: "hsl(var(--chart-5))" },
  neutral: { label: "Neutral", color: "hsl(var(--chart-3))" },
  optimistic: { label: "Optimistic", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export const mockComments: Comment[] = [
    { id: 'c7', user: 'CFO', avatarFallback: 'CFO', text: 'Let\'s plan for the neutral scenario but be prepared for the pessimistic case.', resolved: false },
    { id: 'c8', user: 'CEO', avatarFallback: 'CEO', text: 'What initiatives can we launch to hit the optimistic forecast?', resolved: false },
];

export function WhatIfChart({ data, artifactName, onRename }: WhatIfChartProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(artifactName);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameDoubleClick = () => setIsRenaming(true);

  const handleNameBlur = () => {
    if (draftName.trim() && draftName !== artifactName) {
      onRename(draftName.trim());
    }
    setIsRenaming(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setDraftName(artifactName);
      setIsRenaming(false);
    }
  };

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    setDraftName(artifactName);
  }, [artifactName]);

  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              {isRenaming ? (
                <Input
                  ref={inputRef}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="text-lg h-8 py-0"
                />
              ) : (
                <CardTitle onDoubleClick={handleNameDoubleClick} className="text-lg cursor-pointer">
                  {artifactName}
                </CardTitle>
              )}
              <CardDescription>Projected revenue under different growth scenarios.</CardDescription>
            </div>
            <ThreadPopover comments={mockComments}>
                <Button variant="ghost" size="icon" aria-label="View Comments">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </Button>
            </ThreadPopover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig} className="w-full h-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${Number(value) / 1000}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="optimistic"
                type="natural"
                fill="var(--color-optimistic)"
                fillOpacity={0.4}
                stroke="var(--color-optimistic)"
                stackId="a"
              />
              <Area
                dataKey="neutral"
                type="natural"
                fill="var(--color-neutral)"
                fillOpacity={0.4}
                stroke="var(--color-neutral)"
                stackId="a"
              />
              <Area
                dataKey="pessimistic"
                type="natural"
                fill="var(--color-pessimistic)"
                fillOpacity={0.4}
                stroke="var(--color-pessimistic)"
                stackId="a"
              />
            </AreaChart>
            </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
