"use client";

import { useState, useRef, useEffect } from "react";
import type { ABTestResult, Comment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThreadPopover } from "./ThreadPopover";
import { Button } from "../ui/button";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ABTestWidgetProps {
  data: ABTestResult[];
  artifactName: string;
  onRename: (newName: string) => void;
}

export const mockComments: Comment[] = [
    { id: 'c1', user: 'Product Manager', avatarFallback: 'PM', text: 'Variant B is a clear winner on conversion rate, and the CPC is acceptable. Let\'s roll it out to 100%.', resolved: false },
    { id: 'c2', user: 'Marketing Head', avatarFallback: 'MH', text: 'Agreed. The higher spend is justified by the excellent cost per conversion.', resolved: false },
];

export function ABTestWidget({ data, artifactName, onRename }: ABTestWidgetProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(artifactName);
  const inputRef = useRef<HTMLInputElement>(null);

  const calculateCR = (conversions: number, users: number) => {
    if (users === 0) return "0.00%";
    return `${((conversions / users) * 100).toFixed(2)}%`;
  };

  const calculateCPC = (spend: number, conversions: number) => {
    if (conversions === 0) return "$0.00";
    return `$${(spend / conversions).toFixed(2)}`;
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

  const winner = data.reduce((prev, current) => (prev.conversions / prev.users > current.conversions / current.users) ? prev : current);

  return (
    <Card className="shadow-sm h-full flex flex-col">
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
              <CardDescription>Performance of the new checkout flow against the original.</CardDescription>
            </div>
            <ThreadPopover comments={mockComments}>
                <Button variant="ghost" size="icon" aria-label="View Comments">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </Button>
            </ThreadPopover>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Conv. Rate</TableHead>
              <TableHead className="text-right">Marketing Spend</TableHead>
              <TableHead className="text-right">Cost / Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((result) => (
              <TableRow key={result.variant} className={cn(result.variant === winner.variant && "bg-green-100/50")}>
                <TableCell className="font-medium">{`Variant ${result.variant}`}</TableCell>
                <TableCell className="text-right">{result.users.toLocaleString()}</TableCell>
                <TableCell className="text-right">{result.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold">{calculateCR(result.conversions, result.users)}</TableCell>
                <TableCell className="text-right">{`$${result.marketingSpend.toLocaleString()}`}</TableCell>
                <TableCell className="text-right font-bold">{calculateCPC(result.marketingSpend, result.conversions)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
