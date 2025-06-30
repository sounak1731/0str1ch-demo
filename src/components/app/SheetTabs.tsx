
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Sheet } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";

interface SheetTabsProps {
    sheets: Sheet[];
    activeSheetId: string;
    onSheetSelect: (id: string) => void;
    onAddSheet: () => void;
    onRemoveSheet: (id:string) => void;
    onRenameSheet: (id: string, newName: string) => void;
}

export function SheetTabs({ sheets, activeSheetId, onSheetSelect, onAddSheet, onRemoveSheet, onRenameSheet }: SheetTabsProps) {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleStartRename = (sheet: Sheet) => {
        setRenamingId(sheet.id);
        setDraftName(sheet.name);
    };

    const handleFinishRename = () => {
        if (renamingId && draftName.trim()) {
            onRenameSheet(renamingId, draftName.trim());
        }
        setRenamingId(null);
    };

    const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFinishRename();
        } else if (e.key === 'Escape') {
            setRenamingId(null);
        }
    };
    
    useEffect(() => {
        if (renamingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [renamingId]);
    
    return (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-lg border bg-card p-1 shadow-lg">
            {sheets.map((sheet) => (
                <div key={sheet.id}>
                 {renamingId === sheet.id ? (
                    <Input
                        ref={inputRef}
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onBlur={handleFinishRename}
                        onKeyDown={handleRenameKeyDown}
                        className="h-8 w-32 px-2 text-sm"
                    />
                 ) : (
                    <Button
                        variant={activeSheetId === sheet.id ? "secondary" : "ghost"}
                        size="sm"
                        className="group h-8 px-3"
                        onClick={() => onSheetSelect(sheet.id)}
                        onDoubleClick={() => handleStartRename(sheet)}
                    >
                        <span className="max-w-[150px] truncate">{sheet.name}</span>
                        {sheets.length > 1 && (
                            <span
                                role="button"
                                tabIndex={0}
                                className="ml-2 rounded-full p-0.5 group-hover:bg-black/10 dark:group-hover:bg-white/10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveSheet(sheet.id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onRemoveSheet(sheet.id);
                                    }
                                }}
                                aria-label="Remove sheet"
                            >
                                <X className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                            </span>
                        )}
                    </Button>
                 )}
                </div>
            ))}
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddSheet}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
