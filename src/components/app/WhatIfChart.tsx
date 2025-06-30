
"use client";

import { useState, useRef, useEffect } from "react";
import type { WhatIfScenario, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactECharts from 'echarts-for-react';
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";

interface WhatIfChartProps {
  data: WhatIfScenario[];
  artifactName: string;
  onRename: (newName: string) => void;
}

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
  
  const getOption = (chartData: WhatIfScenario[]) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: {
      data: ['Optimistic', 'Neutral', 'Pessimistic'],
      bottom: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map(d => d.name),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => `$${value / 1000}k` },
    },
    series: [
      {
        name: 'Optimistic',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: 'hsl(var(--chart-1))',
        },
        emphasis: { focus: 'series' },
        data: chartData.map(d => d.optimistic),
      },
      {
        name: 'Neutral',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: 'hsl(var(--chart-3))'
        },
        emphasis: { focus: 'series' },
        data: chartData.map(d => d.neutral),
      },
      {
        name: 'Pessimistic',
        type: 'line',
        stack: 'Total',
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: 'hsl(var(--chart-5))',
        },
        emphasis: { focus: 'series' },
        data: chartData.map(d => d.pessimistic),
      },
    ],
    textStyle: {
      fontFamily: 'Inter, sans-serif'
    }
  });

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
        <ReactECharts
            option={getOption(data)}
            style={{ height: '100%', width: '100%' }}
        />
      </CardContent>
    </Card>
  );
}
