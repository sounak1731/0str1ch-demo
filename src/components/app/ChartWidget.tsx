
"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { Sale, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface ChartWidgetProps {
  data: Sale[];
  previousData?: Sale[] | null;
  artifactName: string;
  onRename: (newName: string) => void;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const mockComments: Comment[] = [
    { id: 'c3', user: 'Jane Doe', avatarFallback: 'JD', text: 'Great numbers for the East region! Let\'s double down.', resolved: false },
    { id: 'c4', user: 'Steve Miller', avatarFallback: 'SM', text: 'Agreed. The West region needs a new strategy.', resolved: true },
];

export function ChartWidget({ data, previousData, artifactName, onRename }: ChartWidgetProps) {
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
  
  const processDataForChart = (chartData: Sale[]) => {
    const revenueByRegion = chartData.reduce((acc, sale) => {
      const region = sale.region.charAt(0).toUpperCase() + sale.region.slice(1).toLowerCase();
      acc[region] = (acc[region] || 0) + sale.revenue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByRegion).map(([region, revenue]) => ({
      region,
      revenue,
    })).sort((a, b) => b.revenue - a.revenue);
  };

  const currentChartData = useMemo(() => processDataForChart(data), [data]);
  const previousChartData = useMemo(() => previousData ? processDataForChart(previousData) : null, [previousData]);

  const renderChart = (d: { region: string; revenue: number }[]) => (
    <ResponsiveContainer width="100%" height="100%">
        <ChartContainer config={chartConfig} className="w-full h-full">
        <BarChart 
            accessibilityLayer 
            data={d} 
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
            barCategoryGap="20%"
        >
            <XAxis 
                dataKey="region" 
                tickLine={false} 
                axisLine={false} 
                tickMargin={10} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
            />
            <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `$${Number(value) / 1000}k`} 
                tickMargin={10}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.1, radius: 'var(--radius)' }}
                content={<ChartTooltipContent 
                    indicator="dot"
                    labelClassName="font-bold"
                    className="rounded-lg shadow-lg border-border/50 bg-background" 
                />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[5, 5, 0, 0]} />
        </BarChart>
        </ChartContainer>
    </ResponsiveContainer>
  );

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
            <CardDescription>Total sales revenue for each region.</CardDescription>
          </div>
          <ThreadPopover comments={mockComments}>
             <Button variant="ghost" size="icon" aria-label="View Comments">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
             </Button>
          </ThreadPopover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4 min-h-0">
        {previousChartData ? (
          <Tabs defaultValue="current" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="previous">Previous</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="flex-1 mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {renderChart(currentChartData)}
            </TabsContent>
            <TabsContent value="previous" className="flex-1 mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {renderChart(previousChartData)}
            </TabsContent>
          </Tabs>
        ) : (
          renderChart(currentChartData)
        )}
      </CardContent>
    </Card>
  );
}
