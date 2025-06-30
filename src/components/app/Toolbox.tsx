
"use client";

import {
  Table,
  BarChart,
  MessageSquare,
  Upload,
  Bold,
  Italic,
  Underline,
  PaintBucket,
  Baseline,
  Filter,
  FunctionSquare,
  PlusSquare,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Link,
  Database,
  ArrowDownUp,
  ListX,
  CheckSquare,
  SplitSquareHorizontal,
  LineChart,
  PieChart,
  AreaChart,
  History,
  File,
  Save,
  Download,
  Printer,
  Share2,
  FileUp,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";

interface ToolboxProps {
  onHistoryClick: () => void;
}

const formattingTools = [
  { icon: Bold, name: "Bold" },
  { icon: Italic, name: "Italic" },
  { icon: Underline, name: "Underline" },
  { icon: Strikethrough, name: "Strikethrough" },
  { icon: PaintBucket, name: "Fill Color" },
  { icon: Baseline, name: "Text Color" },
  { icon: AlignLeft, name: "Align Left" },
  { icon: AlignCenter, name: "Align Center" },
  { icon: AlignRight, name: "Align Right" },
];

const insertTools = [
  { icon: Table, name: "Table" },
  { icon: BarChart, name: "Bar Chart" },
  { icon: LineChart, name: "Line Chart" },
  { icon: PieChart, name: "Pie Chart" },
  { icon: AreaChart, name: "Area Chart" },
  { icon: Image, name: "Image" },
  { icon: MessageSquare, name: "Comment" },
  { icon: Link, name: "Link" },
  { icon: Upload, name: "Upload" },
];

const dataTools = [
    { icon: Filter, name: "Filter Data" },
    { icon: Table2, name: "Pivot Table" },
    { icon: PaintBucket, name: "Conditional Formatting" },
    { icon: ArrowDownUp, name: "Sort Data" },
    { icon: ListX, name: "Remove Duplicates" },
    { icon: CheckSquare, name: "Data Validation" },
    { icon: SplitSquareHorizontal, name: "Text to Columns" },
];

const connectorTools = [
    { name: "Salesforce" },
    { name: "Google Analytics" },
    { name: "HubSpot" },
    { name: "QuickBooks" },
];

const formulae = [
    { name: "SUM", template: "=SUM(A1:A10)" },
    { name: "AVERAGE", template: "=AVERAGE(A1:A10)" },
    { name: "COUNT", template: "=COUNT(A1:A10)" },
    { name: "MAX", template: "=MAX(A1:A10)" },
    { name: "MIN", template: "=MIN(A1:A10)" },
    { name: "IF", template: "=IF(condition, value_if_true, value_if_false)" },
    { name: "VLOOKUP", template: "=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])" },
];

const fileTools = [
  { icon: FileUp, name: "Import" },
  { icon: Save, name: "Save" },
  { icon: Download, name: "Export..." },
  { icon: Printer, name: "Print" },
];

export function Toolbox({ 
    onHistoryClick,
}: ToolboxProps) {
    const handleDragStart = (e: React.DragEvent, toolName: string) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ tool: toolName }));
    };

  return (
    <div className="fixed top-20 left-5 z-20 hidden md:flex flex-col items-center bg-card shadow-lg rounded-lg p-1 space-y-2 h-fit">
      
      {/* Formatting Tools Popover */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Formatting Tools" className="h-9 w-9">
                <Baseline className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Formatting</p></TooltipContent>
        </Tooltip>
        <PopoverContent side="right" className="w-60 p-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1">
                {formattingTools.map((tool) => (
                    <Tooltip key={tool.name}>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={tool.name} className="h-8 w-8">
                        <tool.icon className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{tool.name}</p></TooltipContent>
                    </Tooltip>
                ))}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                <Select defaultValue="inter">
                    <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="times">Times</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="12">
                    <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="14">14</SelectItem>
                    <SelectItem value="18">18</SelectItem>
                    </SelectContent>
                </Select>
                </div>
            </div>
        </PopoverContent>
      </Popover>

      {/* Insert Tools Popover */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button draggable onDragStart={(e) => handleDragStart(e, 'Insert')} variant="ghost" size="icon" aria-label="Insert Tools" className="h-9 w-9 cursor-grab">
                <PlusSquare className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Insert</p></TooltipContent>
        </Tooltip>
        <PopoverContent side="right" className="w-auto p-1 rounded-lg shadow-lg">
          <div className="flex flex-wrap gap-1 max-w-[120px]">
            {insertTools.map((tool) => (
              <Tooltip key={tool.name}>
                <TooltipTrigger asChild>
                  <Button draggable onDragStart={(e) => handleDragStart(e, tool.name)} variant="ghost" size="icon" aria-label={tool.name} className="h-8 w-8 cursor-grab">
                    <tool.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>{tool.name}</p></TooltipContent>
              </Tooltip>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Connectors Popover */}
      <Popover>
          <Tooltip>
              <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Data Connectors" className="h-9 w-9">
                          <Share2 className="h-5 w-5" />
                      </Button>
                  </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Connectors</p></TooltipContent>
          </Tooltip>
          <PopoverContent side="right" className="w-60 p-2">
              <div className="flex flex-col gap-2">
                  <p className="font-medium text-sm px-2">Connect to Apps</p>
                  <Separator />
                  {connectorTools.map((tool) => (
                    <Button key={tool.name} variant="ghost" className="w-full justify-start">
                        {tool.name}
                    </Button>
                  ))}
                  <Separator className="my-1" />
                  <Button className="w-full">Create Agentic Workflow</Button>
              </div>
          </PopoverContent>
      </Popover>

      {/* Data Tools Popover */}
      <Popover>
          <Tooltip>
              <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                      <Button draggable onDragStart={(e) => handleDragStart(e, 'Data')} variant="ghost" size="icon" aria-label="Data Tools" className="h-9 w-9 cursor-grab">
                          <Database className="h-5 w-5" />
                      </Button>
                  </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Data Tools</p></TooltipContent>
          </Tooltip>
          <PopoverContent side="right" className="w-auto p-1">
              <div className="flex flex-wrap gap-1 max-w-[120px]">
                  {dataTools.map((tool) => (
                      <Tooltip key={tool.name}>
                          <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label={tool.name} className="h-8 w-8">
                                  <tool.icon className="h-4 w-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>{tool.name}</p></TooltipContent>
                      </Tooltip>
                  ))}
              </div>
          </PopoverContent>
      </Popover>

      {/* Formulae Tools Popover */}
      <Popover>
          <Tooltip>
              <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                      <Button draggable onDragStart={(e) => handleDragStart(e, 'Function')} variant="ghost" size="icon" aria-label="Insert Function" className="h-9 w-9 cursor-grab">
                          <FunctionSquare className="h-5 w-5" />
                      </Button>
                  </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Insert Function</p></TooltipContent>
          </Tooltip>
          <PopoverContent side="right" className="w-80 p-2">
              <div className="flex flex-col gap-2">
                  <div className="p-2">
                      <p className="font-medium text-sm mb-2">Formula Bar</p>
                      <Input placeholder="=SUM(A1:A10)" />
                  </div>
                  <Separator />
                  <p className="font-medium text-sm px-2 pt-1">Pre-built Formulae</p>
                  {formulae.map((formula) => (
                    <Tooltip key={formula.name}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start">
                                {formula.name}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start">
                            <p className="font-mono text-xs">{formula.template}</p>
                        </TooltipContent>
                    </Tooltip>
                  ))}
              </div>
          </PopoverContent>
      </Popover>

      <Separator />
      
      {/* History button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="View History" className="h-9 w-9" onClick={onHistoryClick}>
            <History className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right"><p>View History</p></TooltipContent>
      </Tooltip>

      <Separator />

      {/* File Tools Popover */}
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="File Options" className="h-9 w-9">
                <File className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="right"><p>File</p></TooltipContent>
        </Tooltip>
        <PopoverContent side="right" className="w-40 p-2">
          <div className="flex flex-col gap-1">
            {fileTools.map((tool) => (
              <Button
                key={tool.name}
                variant="ghost"
                className="w-full justify-start gap-2"
              >
                <tool.icon className="h-4 w-4" />
                <span>{tool.name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
