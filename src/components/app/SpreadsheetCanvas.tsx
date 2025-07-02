

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import type { Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { MessageSquare, Plus, MessageCircle, MoreVertical, Trash2, ArrowUp, ArrowDown, Filter, Columns } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetCanvasProps {
  data: Sale[];
  artifactName: string;
  onRename: (newName: string) => void;
  highlightHighRevenue?: boolean;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  onContextualChat: (prompt: string) => void;
}

export const mockComments: Comment[] = [
    { id: 'c5', user: 'Data Team', avatarFallback: 'DT', text: 'Q1 data is now final. Ready for analysis.', resolved: false },
    { id: 'c6', user: 'Sales Lead', avatarFallback: 'SL', text: 'Thanks! Let\'s pull this into the regional meeting.', resolved: false },
];

const allHeaders = [
    { key: 'product', label: 'Product' },
    { key: 'region', label: 'Region' },
    { key: 'month', label: 'Month' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'marketingSpend', label: 'Marketing Spend' },
    { key: 'cac', label: 'CAC' },
    { key: 'status', label: 'Status' }
];

export function SpreadsheetCanvas({ data, artifactName, onRename, highlightHighRevenue, onAddRow, onDeleteRow, onContextualChat }: SpreadsheetCanvasProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(artifactName);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>(allHeaders.map(h => h.key));
  const [sortConfig, setSortConfig] = useState<{ key: keyof Sale; direction: 'ascending' | 'descending' } | null>(null);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof Sale) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleHideColumn = (keyToHide: string) => {
    setVisibleColumns(prev => prev.filter(key => key !== keyToHide));
  };
  
  const headers = allHeaders.filter(h => visibleColumns.includes(h.key));

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

  const renderCellContent = (sale: Sale, headerKey: string) => {
    switch (headerKey) {
        case 'product': return sale.product;
        case 'region': return sale.region;
        case 'month': return sale.month;
        case 'revenue': return `$${sale.revenue.toLocaleString()}`;
        case 'marketingSpend': return `$${sale.marketingSpend.toLocaleString()}`;
        case 'cac': return `$${sale.cac.toFixed(2)}`;
        case 'status':
            let status: 'Active' | 'Paused' | 'Canceled' = 'Active';
            if (sale.revenue < 12000) status = 'Canceled';
            else if (sale.revenue < 16000) status = 'Paused';
            return (
                <Badge variant="outline" className={cn(
                    "font-medium",
                    status === 'Active' && 'bg-green-100 text-green-700 border-green-200',
                    status === 'Paused' && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    status === 'Canceled' && 'bg-red-100 text-red-700 border-red-200'
                )}>
                    {status}
                </Badge>
            );
        default: return null;
    }
  }

  return (
    <Card className="shadow-sm w-full h-full flex flex-col rounded-lg">
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
            <CardDescription>Raw sales data for the first quarter.</CardDescription>
          </div>
          <ThreadPopover comments={mockComments}>
             <Button variant="ghost" size="icon" aria-label="View Comments" className="no-drag">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
             </Button>
          </ThreadPopover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 border-t min-h-0 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="border-b-0">
               <TableHead className="w-16 text-center border-r border-b">
                  #
               </TableHead>
               {headers.map(header => (
                  <TableHead 
                      key={header.key}
                      className={cn("border-r border-b", ['revenue', 'marketingSpend', 'cac'].includes(header.key) && "text-right")}
                  >
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <div className="flex items-center gap-1 cursor-pointer w-full" data-context-menu-trigger>
                                  <span className="flex-1">{header.label}</span>
                                  {sortConfig && sortConfig.key === header.key && (
                                      sortConfig.direction === 'ascending' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                  )}
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                              <DropdownMenuItem onSelect={() => requestSort(header.key as keyof Sale)}>
                                  <ArrowUp className="mr-2 h-4 w-4" /> Sort A-Z
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => requestSort(header.key as keyof Sale)}>
                                  <ArrowDown className="mr-2 h-4 w-4" /> Sort Z-A
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => toast({ title: "Feature coming soon!" })}>
                                  <Filter className="mr-2 h-4 w-4" /> Filter by...
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleHideColumn(header.key)} className="text-destructive focus:text-destructive">
                                  <Columns className="mr-2 h-4 w-4" /> Hide column
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableHead>
               ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((sale, index) => (
              <TableRow 
                  key={sale.id}
                  className={cn("cursor-context-menu", highlightHighRevenue && sale.revenue > 17000 && "bg-green-100/50 hover:bg-green-100/80")}
              >
                  <TableCell className="text-center text-muted-foreground border-r border-b">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <div className="flex items-center justify-center cursor-pointer" data-context-menu-trigger>
                                  {index + 1}
                                  <MoreVertical className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100" />
                              </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                              <DropdownMenuItem onSelect={() => onContextualChat(`Let's discuss row ${index + 1} (${sale.product})`)}>
                                  <MessageCircle className="mr-2 h-4 w-4" />
                                  <span>Discuss this row</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => onDeleteRow(sale.id)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete row</span>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>

                  {headers.map(header => (
                      <TableCell 
                          key={header.key}
                          className={cn(
                              "font-medium border-r border-b",
                              ['revenue', 'marketingSpend', 'cac'].includes(header.key) && "text-right font-mono tabular-nums",
                              highlightHighRevenue && header.key === 'revenue' && sale.revenue > 17000 && "text-green-700"
                          )}
                      >
                          <div className="w-full h-full">{renderCellContent(sale, header.key)}</div>
                      </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <Button variant="ghost" size="sm" onClick={onAddRow}><Plus className="h-4 w-4 mr-2" />Add Row</Button>
      </CardFooter>
    </Card>
  );
}
