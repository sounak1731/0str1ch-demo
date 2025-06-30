
"use client";

import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-lg border bg-card p-1 shadow-lg">
      <Button variant="ghost" size="icon" onClick={onZoomOut} disabled={zoom <= 0.5} aria-label="Zoom Out" className="h-8 w-8">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium tabular-nums w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="icon" onClick={onZoomIn} disabled={zoom >= 2} aria-label="Zoom In" className="h-8 w-8">
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}
