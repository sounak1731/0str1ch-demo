


"use client";

import { useState, useRef, useEffect } from "react";
import type { Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { MessageSquare, Plus, Trash2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

interface SpreadsheetCanvasProps {
  data: Sale[];
  artifactName: string;
  onRename: (newName: string) => void;
  highlightHighRevenue?: boolean;
  onAddRow: () => void;
  onContextualChat: (prompt: string) => void;
  onAddColumn: () => void;
  onDeleteColumn: () => void;
}

export const mockComments: Comment[] = [
    { id: 'c5', user: 'Data Team', avatarFallback: 'DT', text: 'Q1 data is now final. Ready for analysis.', resolved: false },
    { id: 'c6', user: 'Sales Lead', avatarFallback: 'SL', text: 'Thanks! Let\'s pull this into the regional meeting.', resolved: false },
];

const ColumnHeader = ({ children, onAdd, onDelete }: { children: React.ReactNode, onAdd: () => void, onDelete: () => void }) => (
    <div className="flex items-center justify-between group">
      <span>{children}</span>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); onAdd();}}><Plus className="h-3.5 w-3.5" /></Button>
            </TooltipTrigger>
            <TooltipContent><p>Add column</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {e.stopPropagation(); onDelete();}}><Trash2 className="h-3.5 w-3.5" /></Button>
            </TooltipTrigger>
            <TooltipContent><p>Delete column</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

export function SpreadsheetCanvas({ data, artifactName, onRename, highlightHighRevenue, onAddRow, onContextualChat, onAddColumn, onDeleteColumn }: SpreadsheetCanvasProps) {
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

  const headers = [
    { key: 'product', label: 'Product' },
    { key: 'region', label: 'Region' },
    { key: 'month', label: 'Month' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'marketingSpend', label: 'Marketing Spend' },
    { key: 'cac', label: 'CAC' },
    { key: 'status', label: 'Status' }
  ];

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
            <CardDescription>Raw sales data for the first quarter.</CardDescription>
          </div>
          <ThreadPopover comments={mockComments}>
             <Button variant="ghost" size="icon" aria-label="View Comments">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
             </Button>
          </ThreadPopover>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="overflow-y-auto h-full">
          <Table>
            <TableHeader>
              <TableRow>
                 {headers.map(header => (
                    <DropdownMenu key={header.key}>
                        <DropdownMenuTrigger asChild>
                            <TableHead 
                                className={cn("cursor-context-menu", ['revenue', 'marketingSpend', 'cac'].includes(header.key) && "text-right")}
                                onContextMenu={(e) => e.preventDefault()}
                                data-context-menu-trigger
                            >
                                <ColumnHeader onAdd={onAddColumn} onDelete={onDeleteColumn}>
                                    {header.label}
                                </ColumnHeader>
                            </TableHead>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => onContextualChat(`Let's discuss the "${header.label}" column.`)}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                <span>Discuss in Chat</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sale, index) => (
                <DropdownMenu key={sale.id}>
                    <DropdownMenuTrigger asChild>
                        <TableRow 
                            onContextMenu={(e) => e.preventDefault()} 
                            className={cn("cursor-context-menu", highlightHighRevenue && sale.revenue > 17000 && "bg-green-100/50 hover:bg-green-100/80")}
                            data-context-menu-trigger
                        >
                            {headers.map(header => (
                                <TableCell 
                                    key={header.key}
                                    className={cn(
                                        "font-medium",
                                        ['revenue', 'marketingSpend', 'cac'].includes(header.key) && "text-right",
                                        highlightHighRevenue && header.key === 'revenue' && sale.revenue > 17000 && "text-green-700"
                                    )}
                                >
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="w-full h-full cursor-context-menu">{renderCellContent(sale, header.key)}</div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => onContextualChat(`In row ${index + 1}, what about the value in the "${header.label}" column?`)}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                <span>Discuss in Chat</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            ))}
                        </TableRow>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onContextualChat(`Let's discuss row ${index + 1} (${sale.product})`)}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            <span>Discuss this entire row</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <Button variant="ghost" size="sm" onClick={onAddRow}><Plus className="h-4 w-4 mr-2" />Add Row</Button>
      </CardFooter>
    </Card>
  );
}
