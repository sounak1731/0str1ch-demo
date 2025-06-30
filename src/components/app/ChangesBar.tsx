// src/components/app/ChangesBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { History, Trash2, Undo2 } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface ChangesBarProps {
  pendingChangesCount: number;
  onSave: () => void;
  onClear: () => void;
  onRevert: () => void;
  onHistoryClick: () => void;
}

const ActionButton = ({
    onClick,
    disabled,
    'aria-label': ariaLabel,
    icon: Icon,
    label
} : {
    onClick: () => void;
    disabled: boolean;
    'aria-label': string;
    icon: React.ElementType;
    label: string;
}) => (
    <div className="flex flex-col items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted", disabled && "text-muted-foreground/50 hover:bg-transparent hover:text-muted-foreground/50")}
        >
          <Icon className="h-5 w-5" />
        </Button>
        <span className={cn("text-[10px] font-medium text-muted-foreground", disabled && "text-muted-foreground/50")}>
            {label}
        </span>
    </div>
);

export function ChangesBar({
  pendingChangesCount,
  onSave,
  onClear,
  onRevert,
  onHistoryClick,
}: ChangesBarProps) {
  const hasPendingChanges = pendingChangesCount > 0;

  return (
    <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2">
      <Card className="flex items-center gap-2 p-2 pl-3 pr-3 shadow-lg">
        <Button onClick={onSave} disabled={!hasPendingChanges}>
          Save Changes
          {hasPendingChanges && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold text-primary-foreground">
              {pendingChangesCount}
            </span>
          )}
        </Button>
        <Separator orientation="vertical" className="mx-1 h-10" />
        <div className="flex items-center gap-3">
            <ActionButton
                onClick={onClear}
                disabled={!hasPendingChanges}
                aria-label="Clear pending changes"
                icon={Trash2}
                label="Clear"
            />
            <ActionButton
                onClick={onRevert}
                disabled={!hasPendingChanges}
                aria-label="Revert pending changes"
                icon={Undo2}
                label="Revert"
            />
            <ActionButton
                onClick={onHistoryClick}
                disabled={false}
                aria-label="View history"
                icon={History}
                label="History"
            />
        </div>
      </Card>
    </div>
  );
}
