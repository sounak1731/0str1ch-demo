
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

interface ArtifactContext {
  title: string;
  dataSource: string;
  aiAction: string;
  generatedQuery: string;
}

interface ArtifactContextDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: ArtifactContext;
}

export function ArtifactContextDialog({ isOpen, onClose, context }: ArtifactContextDialogProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `
Data Source: ${context.dataSource}

AI Action: ${context.aiAction}

Generated Query/Logic:
${context.generatedQuery}
    `;
    navigator.clipboard.writeText(textToCopy.trim());
    setHasCopied(true);
    toast({ title: "Context copied to clipboard!" });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{context.title}</DialogTitle>
          <DialogDescription>
            This shows the work the AI did to generate this artifact.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Data Source</h4>
            <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">{context.dataSource}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">AI Action</h4>
            <p className="text-sm text-muted-foreground">{context.aiAction}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Generated Query / Logic</h4>
            <div className="relative">
                <pre className="bg-muted/50 p-4 rounded-md text-sm text-foreground overflow-x-auto">
                    <code>{context.generatedQuery}</code>
                </pre>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={handleCopy}
                >
                    {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
