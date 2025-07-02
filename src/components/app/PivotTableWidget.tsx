
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { Sale, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { MessageSquare, Info } from "lucide-react";
import { ThreadPopover } from "./ThreadPopover";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArtifactContextDialog } from "./ArtifactContextDialog";

interface PivotTableWidgetProps {
  data: Sale[];
  artifactName: string;
  onRename: (newName: string) => void;
}

export const mockComments: Comment[] = [
    { id: 'c11', user: 'Sales Ops', avatarFallback: 'SO', text: 'This pivot is super helpful for the QBR deck. Thanks!', resolved: false },
    { id: 'c12', user: 'Regional Head', avatarFallback: 'RH', text: 'Looks like East is our strongest region across all products.', resolved: false },
];

export function PivotTableWidget({ data, artifactName, onRename }: PivotTableWidgetProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(artifactName);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isContextOpen, setIsContextOpen] = useState(false);

  const context = {
    title: `Context for ${artifactName}`,
    dataSource: "@spreadsheet-sales-data",
    aiAction: "Pivoted the sales data to summarize total revenue with products as rows and regions as columns. Calculated grand totals for both.",
    generatedQuery: `// This is a conceptual representation.
// The actual pivot logic is handled in the component.
PIVOT @spreadsheet-sales-data
ON region
FOR SUM(revenue)
ROWS product;`,
  };

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

  const pivotData = useMemo(() => {
    if (!data || data.length === 0) {
        return { headers: [], rows: [] };
    }
    
    const normalizeProductName = (name: string) =>
      name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    const normalizeRegionName = (name: string) => 
      name.trim().charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const products = [...new Set(data.map(item => normalizeProductName(item.product)))].sort();
    const regions = [...new Set(data.map(item => normalizeRegionName(item.region)))].sort();
    
    const pivoted = products.map(product => {
        const row: { [key: string]: number | string } = { 'Product': product };
        let total = 0;
        regions.forEach(region => {
            const sales = data.filter(d => 
                normalizeProductName(d.product) === product && 
                normalizeRegionName(d.region) === region
            );
            const regionRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
            row[region] = regionRevenue;
            total += regionRevenue;
        });
        row['Total'] = total;
        return row;
    });

    const totalsRow: { [key: string]: number | string } = { 'Product': 'Grand Total' };
    let grandTotal = 0;
    regions.forEach(region => {
        const regionTotal = pivoted.reduce((sum, row) => sum + (row[region] as number), 0);
        totalsRow[region] = regionTotal;
        grandTotal += regionTotal;
    });
    totalsRow['Total'] = grandTotal;

    return {
        headers: ['Product', ...regions, 'Total'],
        rows: [...pivoted, totalsRow]
    };
  }, [data]);

  const formatCurrency = (value: number | string) => {
    if (typeof value === 'number') {
        return `$${value.toLocaleString()}`;
    }
    return value;
  }

  return (
    <>
      <Card className="shadow-sm h-full flex flex-col">
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
                <CardDescription>Revenue by Product and Region</CardDescription>
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
        <CardContent className="flex-1 p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {pivotData.headers.map((header) => (
                  <TableHead key={header} className={cn("sticky top-0 bg-card", header !== 'Product' && "text-right")}>
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pivotData.rows.map((row, index) => (
                <TableRow key={index} className={cn(row['Product'] === 'Grand Total' && "bg-muted font-bold")}>
                  {pivotData.headers.map((header) => (
                    <TableCell key={header} className={cn(header !== 'Product' && "text-right font-mono")}>
                      {formatCurrency(row[header])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    
