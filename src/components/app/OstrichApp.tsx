

"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import type { Sale, Forecast, ChatMessage, ABTestResult, WhatIfScenario, Activity, Sheet } from "@/lib/types";
import { Responsive, WidthProvider, type Layouts, type Layout } from "react-grid-layout";
import { Toolbox } from "@/components/app/Toolbox";
import { SpreadsheetCanvas } from "@/components/app/SpreadsheetCanvas";
import { ChartWidget, mockComments as chartComments } from "@/components/app/ChartWidget";
import { AIChatPanel } from "@/components/app/AIChatPanel";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ReactECharts from 'echarts-for-react';
import { ABTestWidget, mockComments as abTestComments } from "./ABTestWidget";
import { WhatIfChart, mockComments as whatIfComments } from "./WhatIfChart";
import { ZoomControls } from "./ZoomControls";
import { KpiCard, mockComments as kpiComments } from "./KpiCard";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { DollarSign, ShoppingCart, TrendingUp, Users, MessageSquare, Wand2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { HistoryPanel } from "./HistoryPanel";
import { SheetTabs } from "./SheetTabs";
import { SalesforcePipelineWidget } from "./SalesforcePipelineWidget";
import { ShareDialog } from "./ShareDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThreadPopover } from "./ThreadPopover";
import { Input } from "../ui/input";
import { PivotTableWidget, mockComments as pivotComments } from "./PivotTableWidget";

interface OstrichAppProps {
  initialSalesData: Sale[];
  initialABTestData: ABTestResult[];
  initialWhatIfData: WhatIfScenario[];
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const fullLayouts: Layouts = {
  lg: [
    { i: "kpi-revenue", x: 0, y: 0, w: 4, h: 4, minW: 3, minH: 4, isDraggable: true, isResizable: true },
    { i: "kpi-sales", x: 4, y: 0, w: 4, h: 4, minW: 3, minH: 4, isDraggable: true, isResizable: true },
    { i: "kpi-avg-sale", x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 4, isDraggable: true, isResizable: true },
    { i: "salesforce-pipeline", x: 0, y: 23, w: 12, h: 9, minW: 8, minH: 7, isDraggable: true, isResizable: true },
    { i: "spreadsheet", x: 0, y: 4, w: 12, h: 12, minW: 6, minH: 8, isDraggable: true, isResizable: true },
    { i: "chart", x: 12, y: 4, w: 12, h: 9, minW: 6, minH: 6, isDraggable: true, isResizable: true },
    { i: "ab-test", x: 12, y: 13, w: 12, h: 8, minW: 6, minH: 6, isDraggable: true, isResizable: true },
    { i: "what-if", x: 12, y: 21, w: 12, h: 11, minW: 6, minH: 8, isDraggable: true, isResizable: true },
    { i: "forecast", x: 0, y: 16, w: 12, h: 7, minW: 8, minH: 6, isDraggable: true, isResizable: true },
    { i: "pivot-table", x: 0, y: 32, w: 12, h: 9, minW: 8, minH: 6, isDraggable: true, isResizable: true },
  ],
};

const blankLayouts: Layouts = { lg: [] };

const initialForecastData: Forecast[] = [
  { id: 'forecast-1', month: 'May', revenue: 23000, product: 'Forecast', region: 'All', marketingSpend: 3300, cac: 155 },
  { id: 'forecast-2', month: 'June', revenue: 25500, product: 'Forecast', region: 'All', marketingSpend: 3500, cac: 158 },
  { id: 'forecast-3', month: 'July', revenue: 24000, product: 'Forecast', region: 'All', marketingSpend: 3400, cac: 156 },
];

export default function OstrichApp({ 
  initialSalesData,
  initialABTestData,
  initialWhatIfData,
}: OstrichAppProps) {
  const [salesData, setSalesData] = useState<Sale[]>(initialSalesData);
  const [filteredSalesData, setFilteredSalesData] = useState<Sale[]>(salesData);
  const [previousFilteredSalesData, setPreviousFilteredSalesData] = useState<Sale[] | null>(null);
  const [forecast, setForecast] = useState<Forecast[] | null>(initialForecastData);
  const [isLoading, setIsLoading] = useState({ clean: false, forecast: false, analyze: false, summarize: false, import: false });
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<{ title: string; data: { name: string; value: number }[] } | null>(null);

  const [sheets, setSheets] = useState<Sheet[]>([
    { id: "sheet1", name: "Demo Sheet", layouts: blankLayouts },
    { id: "sheet2", name: "Full Dashboard", layouts: fullLayouts },
  ]);
  const [activeSheetId, setActiveSheetId] = useState("sheet1");
  
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  const [headerTitle, setHeaderTitle] = useState("Sales Performance");
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const [highlightHighRevenue, setHighlightHighRevenue] = useState(false);
  const [contextualMessage, setContextualMessage] = useState<ChatMessage | null>(null);

  const { toast } = useToast();

  const [artifactNames, setArtifactNames] = useState({
    spreadsheet: "@spreadsheet-sales-data",
    chart: "@chart-revenue-by-region",
    abTest: "@abtest-new-checkout-flow",
    whatIf: "@whatif-revenue-scenarios",
    salesforce: "@workflow-salesforce-sync",
    pivotTable: "@pivot-sales-summary",
  });

  const handleRenameArtifact = (key: keyof typeof artifactNames, newName: string) => {
    setArtifactNames(prev => ({ ...prev, [key]: newName }));
  };

  const initialActivities = useMemo(() => {
    const allComments = [
      ...kpiComments.map(c => ({ ...c, artifactName: 'KPIs', timestamp: '5d ago' })),
      ...chartComments.map(c => ({ ...c, artifactName: artifactNames.chart, timestamp: '4d ago' })),
      ...abTestComments.map(c => ({ ...c, artifactName: artifactNames.abTest, timestamp: '2d ago' })),
      ...whatIfComments.map(c => ({ ...c, artifactName: artifactNames.whatIf, timestamp: '1d ago' })),
      ...pivotComments.map(c => ({ ...c, artifactName: artifactNames.pivotTable, timestamp: 'Just now' })),
    ];
    
    const mappedActivities: Activity[] = allComments.map(comment => ({
      id: comment.id,
      type: 'comment',
      user: comment.user,
      avatarFallback: comment.avatarFallback,
      text: comment.text,
      artifactName: comment.artifactName,
      timestamp: comment.timestamp,
      resolved: comment.resolved,
    }));
    
    return mappedActivities.sort((a,b) => parseInt(a.timestamp) - parseInt(b.timestamp));
  }, [artifactNames]);

  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const addActivity = (activity: Omit<Activity, 'timestamp' | 'id'>) => {
    setActivities(prev => [{ ...activity, id: `act-${Date.now()}`, timestamp: 'Just now' }, ...prev]);
  };
  
  const kpiData = useMemo(() => {
    const totalRevenue = filteredSalesData.reduce((acc, sale) => acc + sale.revenue, 0);
    const totalSales = filteredSalesData.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return {
        totalRevenue,
        totalSales,
        avgSaleValue,
        history: [...Array(12)].map((_, i) => ({ name: `Mon ${i + 1}`, value: (Math.random() * 20000 + 10000) })),
    };
  }, [filteredSalesData]);
  
  const activeSheet = sheets.find((s) => s.id === activeSheetId);
  const activeLayouts = activeSheet?.layouts || blankLayouts;

  const handleLayoutChange = (currentLayout: Layout[], allLayouts: Layouts) => {
    setSheets(prevSheets =>
      prevSheets.map(sheet =>
        sheet.id === activeSheetId ? { ...sheet, layouts: { lg: currentLayout } } : sheet
      )
    );
  };

  const addArtifactsToLayout = (artifactKeys: string[]) => {
    setSheets(prevSheets => 
      prevSheets.map(sheet => {
        if (sheet.id === activeSheetId) {
          const currentLgLayout = sheet.layouts.lg || [];
          const newLayoutItems = fullLayouts.lg.filter(
            (item) => artifactKeys.includes(item.i) && !currentLgLayout.some(l => l.i === item.i)
          );
          if (newLayoutItems.length > 0) {
            const updatedItems = [...currentLgLayout, ...newLayoutItems.map(item => ({...item, isDraggable: true, isResizable: true}))];
            return {
              ...sheet,
              layouts: {
                ...sheet.layouts,
                lg: updatedItems
              }
            };
          }
        }
        return sheet;
      })
    );
  };

  const handleForecast = async () => {
    setIsLoading(prev => ({ ...prev, forecast: true }));
    await new Promise(resolve => setTimeout(resolve, 1500)); 
  
    try {
      const forecastData: Forecast[] = [
        { id: 'forecast-1', month: 'May', revenue: 23000, product: 'Forecast', region: 'All', marketingSpend: 3300, cac: 155 },
        { id: 'forecast-2', month: 'June', revenue: 25500, product: 'Forecast', region: 'All', marketingSpend: 3500, cac: 158 },
        { id: 'forecast-3', month: 'July', revenue: 24000, product: 'Forecast', region: 'All', marketingSpend: 3400, cac: 156 },
      ];
      
      setForecast(forecastData);
      addArtifactsToLayout(['forecast']);
  
      addActivity({
        type: 'action',
        user: 'AI Assistant',
        avatarFallback: 'AI',
        text: 'Generated a 3-month revenue forecast.',
      });
  
      return {text: "I've generated the revenue forecast and added the new chart to your canvas."};
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not generate forecast." });
      return {text: "Sorry, I ran into an error while generating the forecast."};
    } finally {
      setIsLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const handleAnalyze = async (query: string, history: ChatMessage[]): Promise<ChatMessage> => {
    setIsLoading(prev => ({ ...prev, analyze: true }));
    await new Promise(resolve => setTimeout(resolve, 1200)); 
    
    const lowerCaseQuery = query.toLowerCase();
    let aiResponseText = "I'm not quite sure how to do that. Could you try asking in a different way?";

    try {
        if (lowerCaseQuery.includes('clean it up')) {
            addArtifactsToLayout(['spreadsheet']);
            aiResponseText = "Done. I've cleaned up the data, standardized the names, and added it to a spreadsheet on your canvas.";
        } else if (lowerCaseQuery.includes('kpi cards')) {
            addArtifactsToLayout(['kpi-revenue', 'kpi-sales', 'kpi-avg-sale']);
            aiResponseText = "I've added KPI cards for Total Revenue, Total Sales, and Average Sale Value to your canvas.";
        } else if (lowerCaseQuery.includes('chart showing revenue by region')) {
            addArtifactsToLayout(['chart']);
            aiResponseText = "I've added the Revenue by Region chart to your canvas.";
        } else if (lowerCaseQuery.includes('pivot table')) {
            addArtifactsToLayout(['pivot-table']);
            aiResponseText = "Certainly. I've added a pivot table summarizing revenue by product and region.";
        } else if (lowerCaseQuery.includes('filter the data to show only')) {
            setPreviousFilteredSalesData(filteredSalesData);
            const filtered = salesData.filter(s => s.region.toLowerCase().trim().startsWith('north') || s.region.toLowerCase().trim().startsWith('east'));
            setFilteredSalesData(filtered);
            aiResponseText = "Okay, I've filtered the data to show only the North and East regions. I've also enabled versioning on the chart so you can compare.";
        } else if (lowerCaseQuery.includes('conditional formatting')) {
            setHighlightHighRevenue(true);
            aiResponseText = "I've applied conditional formatting to the spreadsheet to highlight all revenue values above $17,000.";
        } else if (lowerCaseQuery.includes('what if we increased marketing spend')) {
            addArtifactsToLayout(['what-if']);
            aiResponseText = "Interesting question. I've run a simulation and added a What-If analysis chart to your canvas.";
        } else if (lowerCaseQuery.includes('which variant performed better')) {
            addArtifactsToLayout(['ab-test']);
            aiResponseText = "I've analyzed the results and added an A/B Test report. Variant B is the clear winner.";
        } else if (lowerCaseQuery.includes('automated workflow')) {
            addArtifactsToLayout(['salesforce-pipeline']);
            aiResponseText = "I've created an agentic workflow to sync this data with Salesforce and added it to the canvas. You can click on any node to configure it.";
        } else {
             const result = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, history, salesData: JSON.stringify(salesData) }),
            });
            if (!result.ok) throw new Error('API Error');
            const data = await result.json();
            aiResponseText = data.summary;
        }

    } catch (error) {
        aiResponseText = "Sorry, I encountered an error. Please try again.";
        toast({ variant: "destructive", title: "Error", description: "Failed to get analysis." });
    } finally {
        setIsLoading(prev => ({ ...prev, analyze: false }));
    }
    
    return { sender: 'ai', text: aiResponseText };
  };
  
  const handleAddRow = () => {
    const newRow: Sale = {
      id: crypto.randomUUID(),
      product: 'New Item',
      region: 'N/A',
      month: 'N/A',
      revenue: 0,
      marketingSpend: 0,
      cac: 0,
    };
    setSalesData(prev => [...prev, newRow]);
    setFilteredSalesData(prev => [...prev, newRow]);
  };
  
  const handleAddColumn = () => {
    toast({ title: "Feature coming soon!", description: "The ability to add columns is on our roadmap." });
  };
  
  const handleDeleteColumn = () => {
     toast({ title: "Feature coming soon!", description: "The ability to delete columns is on our roadmap." });
  };

  const handleContextualChat = (prompt: string) => {
    setContextualMessage({ sender: 'user', text: prompt });
    if (!isChatOpen) setIsChatOpen(true);
  };
  
  const handleAddSheet = () => {
    const newSheetNumber = sheets.length + 1;
    const newSheet: Sheet = {
      id: `sheet${newSheetNumber}`,
      name: `Sheet ${newSheetNumber}`,
      layouts: blankLayouts,
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
  };

  const handleRemoveSheet = (sheetId: string) => {
    if (sheets.length <= 1) return; 

    const sheetIndex = sheets.findIndex(s => s.id === sheetId);
    if (sheetIndex === -1) return;

    const newSheets = sheets.filter(s => s.id !== sheetId);
    setSheets(newSheets);

    if (activeSheetId === sheetId) {
      const newActiveIndex = Math.max(0, sheetIndex - 1);
      setActiveSheetId(newSheets[newActiveIndex].id);
    }
  };

  const handleRenameSheet = (sheetId: string, newName: string) => {
    setSheets(prevSheets =>
      prevSheets.map(sheet =>
        sheet.id === sheetId && newName.trim() ? { ...sheet, name: newName.trim() } : sheet
      )
    );
  };

  const handleResetDemo = () => {
    setSheets(prevSheets => 
      prevSheets.map(sheet => 
        sheet.id === 'sheet1' ? { ...sheet, layouts: blankLayouts } : sheet
      )
    );
    setForecast(null);
    setHighlightHighRevenue(false);
    setFilteredSalesData(initialSalesData);
    setSalesData(initialSalesData);
    setPreviousFilteredSalesData(null);
    setActiveSheetId('sheet1');
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(2, prev + 0.1));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.1));

  useEffect(() => {
    if (isEditingHeader && headerInputRef.current) {
      headerInputRef.current.focus();
      headerInputRef.current.select();
    }
  }, [isEditingHeader]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        setZoom((prevZoom) => {
          const zoomFactor = 0.002;
          const newZoom = prevZoom - e.deltaY * zoomFactor;
          return Math.min(Math.max(newZoom, 0.5), 2);
        });
      } else {
        setPan(prevPan => ({
          x: prevPan.x - e.deltaX,
          y: prevPan.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Do not pan if the click is on a grid item or any of its children
    if (target.closest('.react-grid-item')) {
      return;
    }
    if (e.button !== 0) return;
    e.preventDefault();
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    setIsPanning(true);
    document.body.style.cursor = 'grabbing';
  };
  
    useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);
  

  return (
    <>
      <div className="fixed top-5 left-20 z-20 flex items-center gap-2 rounded-full border bg-card p-1.5 pl-4 shadow-lg">
          {isEditingHeader ? (
            <Input
              ref={headerInputRef}
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              onBlur={() => setIsEditingHeader(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingHeader(false);
                if (e.key === 'Escape') setIsEditingHeader(false);
              }}
              className="h-7 !w-40 text-sm"
            />
          ) : (
            <h1 className="text-sm font-medium cursor-pointer" onDoubleClick={() => setIsEditingHeader(true)}>
              {headerTitle}
            </h1>
          )}
          <Separator orientation="vertical" className="h-6" />
          <div className="flex -space-x-2">
              <Avatar className="h-7 w-7 border-2 border-card">
                  <AvatarImage src="https://placehold.co/32x32.png" data-ai-hint="person woman" />
                  <AvatarFallback>U1</AvatarFallback>
              </Avatar>
              <Avatar className="h-7 w-7 border-2 border-card">
                  <AvatarImage src="https://placehold.co/32x32.png" data-ai-hint="person man" />
                  <AvatarFallback>U2</AvatarFallback>
              </Avatar>
          </div>
          <ShareDialog>
            <Button variant="secondary" size="sm" className="h-7 rounded-full">
                <Users className="h-3 w-3 mr-1" />
                Share
            </Button>
          </ShareDialog>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsChatOpen(prev => !prev)}
        className="fixed top-5 right-5 z-20"
      >
        <Wand2 className="h-5 w-5" />
        <span className="sr-only">Open AI Assistant</span>
      </Button>

      <Toolbox 
        onHistoryClick={() => setIsHistoryOpen(true)}
      />

      <AIChatPanel
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onForecast={handleForecast}
        onAnalyze={handleAnalyze}
        onReset={handleResetDemo}
        isLoading={isLoading}
        newMessage={contextualMessage}
        onNewMessageConsumed={() => setContextualMessage(null)}
      />

      <HistoryPanel
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activities={activities}
      />
      
      <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      
      <div
        ref={canvasContainerRef}
        className={cn(
          "fixed top-0 left-0 h-full w-full overflow-hidden canvas-grid-background",
           (isPanning ? 'cursor-grabbing' : 'cursor-grab'),
        )}
        onMouseDown={handlePanMouseDown}
        style={{
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        <div
          className="absolute top-0 left-0 canvas-transform-layer"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <div className="w-[2400px] relative canvas-content-wrapper">
            <ResponsiveGridLayout
              key={activeSheetId}
              layouts={activeLayouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
              rowHeight={30}
              width={2400}
              className="layout"
              onLayoutChange={handleLayoutChange}
              draggableCancel=".no-drag, [data-context-menu-trigger]"
            >
              {(activeLayouts.lg || []).map(layout => {
                const i = layout.i;
                if (i.startsWith("kpi-")) {
                  const kpiMap = {
                    "kpi-revenue": { title: "Total Revenue", value: `$${(kpiData.totalRevenue / 1000).toFixed(1)}k`, desc: `+20.1% from last month`, icon: DollarSign, data: kpiData.history, color: 'green' },
                    "kpi-sales": { title: "Total Sales", value: `+${kpiData.totalSales.toLocaleString()}`, desc: `+180.1% from last month`, icon: ShoppingCart, data: kpiData.history, color: 'orange' },
                    "kpi-avg-sale": { title: "Average Sale Value", value: `$${(kpiData.avgSaleValue).toFixed(2)}`, desc: `+19% from last month`, icon: TrendingUp, data: kpiData.history, color: 'blue' },
                  };
                  const kpi = kpiMap[i as keyof typeof kpiMap];
                  if (!kpi) return null;
                  return (
                    <div key={i} onDoubleClick={() => setExpandedKpi({ title: kpi.title, data: kpi.data })} className="cursor-pointer">
                      <KpiCard
                        title={kpi.title}
                        value={kpi.value}
                        description={kpi.desc}
                        icon={<kpi.icon className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div>
                  );
                }
                if (i === "salesforce-pipeline") {
                  return (
                    <div key="salesforce-pipeline">
                      <SalesforcePipelineWidget />
                    </div>
                  );
                }
                if (i === "spreadsheet") {
                  return (
                    <div key="spreadsheet">
                      <SpreadsheetCanvas
                        artifactName={artifactNames.spreadsheet}
                        onRename={(newName) => handleRenameArtifact('spreadsheet', newName)}
                        data={filteredSalesData}
                        highlightHighRevenue={highlightHighRevenue}
                        onAddRow={handleAddRow}
                        onContextualChat={handleContextualChat}
                        onAddColumn={handleAddColumn}
                        onDeleteColumn={handleDeleteColumn}
                      />
                    </div>
                  );
                }
                if (i === "chart") {
                  return (
                    <div key="chart">
                      <ChartWidget
                        artifactName={artifactNames.chart}
                        onRename={(newName) => handleRenameArtifact('chart', newName)}
                        data={filteredSalesData}
                        previousData={previousFilteredSalesData}
                      />
                    </div>
                  );
                }
                if (i === "ab-test") {
                  return (
                    <div key="ab-test">
                      <ABTestWidget
                        artifactName={artifactNames.abTest}
                        onRename={(newName) => handleRenameArtifact('abTest', newName)}
                        data={initialABTestData}
                      />
                    </div>
                  );
                }
                if (i === "what-if") {
                  return (
                    <div key="what-if">
                      <WhatIfChart
                        artifactName={artifactNames.whatIf}
                        onRename={(newName) => handleRenameArtifact('whatIf', newName)}
                        data={initialWhatIfData}
                      />
                    </div>
                  );
                }
                if (i === 'pivot-table') {
                  return (
                    <div key="pivot-table">
                      <PivotTableWidget
                        artifactName={artifactNames.pivotTable}
                        onRename={(newName) => handleRenameArtifact('pivotTable', newName)}
                        data={salesData}
                      />
                    </div>
                  );
                }
                if (i === "forecast" && forecast) {
                  const forecastOption = {
                    color: ['#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE'],
                    tooltip: { trigger: 'axis' },
                    xAxis: { type: 'category', data: forecast.map(f => f.month) },
                    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `$${v / 1000}k` } },
                    series: [{
                      name: 'Forecasted Revenue',
                      type: 'line',
                      smooth: true,
                      data: forecast.map(f => f.revenue),
                      lineStyle: { width: 2 },
                    }],
                    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
                    textStyle: { fontFamily: 'Inter, sans-serif' }
                  };
                  return (
                     <div key="forecast">
                        <Card className="h-full flex flex-col">
                          <CardHeader>
                            <CardTitle>3-Month Revenue Forecast</CardTitle>
                            <CardDescription>Forecasted sales data based on historical performance.</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 -m-2">
                             <ReactECharts option={forecastOption} style={{ height: '100%', width: '100%' }} />
                          </CardContent>
                        </Card>
                      </div>
                  )
                }
                return null;
              })}

            </ResponsiveGridLayout>
          </div>
        </div>
      </div>

       <Dialog open={!!expandedKpi} onOpenChange={(isOpen) => !isOpen && setExpandedKpi(null)}>
        <DialogContent className="max-w-2xl h-[450px] flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle>{expandedKpi?.title}</DialogTitle>
                <DialogDescription>
                  Detailed view of the metric over the last 12 months.
                </DialogDescription>
              </div>
              <ThreadPopover comments={kpiComments}>
                  <Button variant="ghost" size="icon" aria-label="View Comments">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </Button>
              </ThreadPopover>
            </div>
          </DialogHeader>
          <div className="flex-1 -mx-6 -mb-6 mt-4">
            {expandedKpi && (() => {
                const kpiOption = {
                  color: ['#5470C6', '#91CC75', '#EE6666', '#FAC858', '#73C0DE'],
                  tooltip: { trigger: 'axis' },
                  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
                  xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: expandedKpi.data.map(d => d.name)
                  },
                  yAxis: {
                    type: 'value',
                    axisLabel: {
                      formatter: (value: number) =>
                        expandedKpi.title.includes("Revenue") || expandedKpi.title.includes("Value")
                          ? `$${(Number(value) / 1000).toFixed(0)}k`
                          : value.toLocaleString()
                    }
                  },
                  series: [{
                    name: expandedKpi.title,
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    areaStyle: { opacity: 0.2 },
                    lineStyle: { width: 2 },
                    data: expandedKpi.data.map(d => d.value)
                  }],
                  textStyle: { fontFamily: 'Inter, sans-serif' }
                };
                return <ReactECharts option={kpiOption} style={{ height: '100%', width: '100%' }} />;
            })()}
          </div>
        </DialogContent>
      </Dialog>

      <SheetTabs 
        sheets={sheets}
        activeSheetId={activeSheetId}
        onSheetSelect={setActiveSheetId}
        onAddSheet={handleAddSheet}
        onRemoveSheet={handleRemoveSheet}
        onRenameSheet={handleRenameSheet}
      />
    </>
  );
}
