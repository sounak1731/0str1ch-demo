
"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { Sale, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Info } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArtifactContextDialog } from "./ArtifactContextDialog";


interface ChartWidgetProps {
  data: Sale[];
  previousData?: Sale[] | null;
  artifactName: string;
  onRename: (newName: string) => void;
}

export const mockComments: Comment[] = [
    { id: 'c3', user: 'Jane Doe', avatarFallback: 'JD', text: 'Great numbers for the East region! Let\'s double down.', resolved: false },
    { id: 'c4', user: 'Steve Miller', avatarFallback: 'SM', text: 'Agreed. The West region needs a new strategy.', resolved: true },
];

export function ChartWidget({ data, previousData, artifactName, onRename }: ChartWidgetProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(artifactName);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);
  
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

  const context = {
    title: `Context for ${artifactName}`,
    dataSource: "@spreadsheet-sales-data",
    aiAction: "Grouped data by region and summed the revenue for each. Visualized the result as a bar chart.",
    generatedQuery: `SELECT
  region,
  SUM(revenue) as total_revenue
FROM @spreadsheet-sales-data
GROUP BY region
ORDER BY total_revenue DESC;`,
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
      const regionName = sale.region.trim().toLowerCase();
      const region = regionName.charAt(0).toUpperCase() + regionName.slice(1);
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
  
  const getOption = (chartData: { region: string; revenue: number }[]) => {
    const chartColors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'];

    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
        type: 'category',
        data: chartData.map((d) => d.region),
        axisTick: { show: false },
        axisLine: { show: false },
        },
        yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => `$${value / 1000}k` },
        splitLine: { lineStyle: { type: 'dashed' } },
        },
        series: [{
        name: 'Revenue',
        type: 'bar',
        barWidth: '60%',
        data: chartData.map((d, index) => ({
            value: d.revenue,
            itemStyle: {
                color: chartColors[index % chartColors.length],
                borderRadius: [5, 5, 0, 0]
            }
        })),
        }],
        textStyle: {
            fontFamily: 'Inter, sans-serif'
        }
    };
  };

  const renderChart = (d: { region: string; revenue: number }[]) => (
    <ReactECharts
        option={getOption(d)}
        style={{ height: '100%', width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
    />
  );

  return (
    <>
      <Card className="shadow-sm flex flex-col h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="no-drag">
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
            <div className="flex items-center no-drag">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="View Context" onClick={() => setIsContextOpen(true)}>
                      <Info className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Show Context</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ThreadPopover comments={mockComments}>
                <Button variant="ghost" size="icon" aria-label="View Comments" className="no-drag">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </Button>
              </ThreadPopover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4 min-h-0">
          {previousData ? (
            <Tabs defaultValue="current" className="w-full h-full flex flex-col no-drag">
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
      <ArtifactContextDialog
        isOpen={isContextOpen}
        onClose={() => setIsContextOpen(false)}
        context={context}
      />
    </>
  );
}
