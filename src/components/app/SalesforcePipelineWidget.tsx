
"use client";

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, FunctionSquare, LayoutDashboard, Plus } from "lucide-react";
import { cn } from '@/lib/utils';

type NodeData = {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    config: Record<string, any>;
};

const DashedConnector = () => (
    <div className="flex-1 mt-10 h-px border-t border-dashed border-border relative">
        <div className="absolute left-1/2 -top-4 group">
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-background border-2 border-dashed border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted no-drag"
                >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    </div>
);

const TriggerNodeContent = ({ config, onConfigChange }: { config: any, onConfigChange: (newConfig: any) => void }) => (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="trigger-event" className="text-right">Trigger Event</Label>
        <Select value={config.triggerEvent} onValueChange={(value) => onConfigChange({ ...config, triggerEvent: value })}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select event" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="on-new">On new record</SelectItem>
              <SelectItem value="on-update">On updated record</SelectItem>
              <SelectItem value="schedule">On a schedule</SelectItem>
            </SelectContent>
        </Select>
      </div>
       <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="object" className="text-right">Object</Label>
        <Select value={config.object} onValueChange={(value) => onConfigChange({ ...config, object: value })}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select object" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="opportunity">Opportunity</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="account">Account</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="fetch-time" className="text-right">Fetch Time</Label>
        <Select value={config.interval} onValueChange={(value) => onConfigChange({ ...config, interval: value })}>
            <SelectTrigger className="col-span-3"><SelectValue placeholder="Select interval" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
        </Select>
      </div>
    </>
  );

const TransformNodeContent = ({ config, onConfigChange }: { config: any, onConfigChange: (newConfig: any) => void }) => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="nlp-logic">Transformation Logic</Label>
      <p className="text-sm text-muted-foreground">Describe the data transformation in plain English.</p>
      <Textarea
        placeholder="e.g., Filter for all deals where the amount is greater than $5000 and the stage is 'Closed Won'."
        id="nlp-logic"
        className="min-h-[120px]"
        value={config.logic || ''}
        onChange={(e) => onConfigChange({ ...config, logic: e.target.value })}
      />
    </div>
  );

const UpdateNodeContent = ({ config, onConfigChange }: { config: any, onConfigChange: (newConfig: any) => void }) => (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="artifact" className="text-right">Artifact</Label>
      <Select value={config.targetArtifact} onValueChange={(value) => onConfigChange({ ...config, targetArtifact: value })}>
          <SelectTrigger className="col-span-3"><SelectValue placeholder="Select artifact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="@spreadsheet-sales-data">@spreadsheet-sales-data</SelectItem>
            <SelectItem value="@chart-revenue-by-region">@chart-revenue-by-region</SelectItem>
          </SelectContent>
      </Select>
    </div>
  );

const NODE_COMPONENTS: Record<string, React.FC<any>> = {
    trigger: TriggerNodeContent,
    transform: TransformNodeContent,
    update: UpdateNodeContent,
};


export function SalesforcePipelineWidget() {
  const [nodes, setNodes] = useState<NodeData[]>([
    {
      id: 'trigger',
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Salesforce Trigger",
      description: "On new opportunity",
      config: { triggerEvent: 'on-new', object: 'opportunity', interval: 'hourly' }
    },
    {
      id: 'transform',
      icon: <FunctionSquare className="h-8 w-8 text-primary" />,
      title: "Transform Data",
      description: "Apply no-code logic",
      config: { logic: "Filter for all deals where the amount is greater than $5000 and the stage is 'Closed Won'." }
    },
    {
      id: 'update',
      icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
      title: "Update Dashboard",
      description: "Target artifact",
      config: { targetArtifact: '@spreadsheet-sales-data' }
    }
  ]);

  const [editingNode, setEditingNode] = useState<NodeData | null>(null);
  const [draftConfig, setDraftConfig] = useState<Record<string, any> | null>(null);

  const handleOpenDialog = (node: NodeData) => {
    setEditingNode(node);
    setDraftConfig(node.config);
  };

  const handleCloseDialog = () => {
    setEditingNode(null);
    setDraftConfig(null);
  };

  const handleSaveConfig = () => {
    if (editingNode && draftConfig) {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          if (node.id === editingNode.id) {
            let newDescription = node.description;
            if (node.id === 'trigger' && draftConfig.interval) {
              newDescription = `Fetches ${draftConfig.interval}`;
            } else if (node.id === 'transform' && draftConfig.logic) {
              newDescription = `Applies custom logic`;
            } else if (node.id === 'update' && draftConfig.targetArtifact) {
              newDescription = `Updates ${draftConfig.targetArtifact}`;
            }
            return { ...node, config: draftConfig, description: newDescription };
          }
          return node;
        })
      );
    }
    handleCloseDialog();
  };
  
  const NodeContentComponent = editingNode ? NODE_COMPONENTS[editingNode.id] : null;

  return (
    <Card className="shadow-sm h-full w-full flex flex-col justify-center p-4 bg-background/80 backdrop-blur-sm">
      <CardHeader className="items-center text-center pt-2 pb-6">
        <CardTitle>Automated Sales Reporting</CardTitle>
        <CardDescription>
          This workflow runs hourly to sync data and update your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full p-6 flex items-center justify-center overflow-x-auto">
        <div className="flex items-start justify-center w-full min-w-max gap-2">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
                <div 
                    className={cn(
                      "flex flex-col items-center gap-2 text-center group w-32",
                      "no-drag" // Prevent dragging when clicking the node
                    )}
                    onClick={() => handleOpenDialog(node)}
                >
                    <div className="w-20 h-20 rounded-xl bg-background border flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-primary transition-all duration-200 cursor-pointer">
                      {node.icon}
                    </div>
                    <div>
                    <p className="font-semibold text-sm">{node.title}</p>
                    <p className="text-xs text-muted-foreground">{node.description}</p>
                    </div>
                </div>

              {index < nodes.length - 1 && <DashedConnector />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>

      <Dialog open={!!editingNode} onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}>
          <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>Configure: {editingNode?.title}</DialogTitle>
                  <DialogDescription>{editingNode?.description}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                  {NodeContentComponent && draftConfig && (
                      <NodeContentComponent 
                          config={draftConfig} 
                          onConfigChange={setDraftConfig}
                      />
                  )}
              </div>
              <DialogFooter>
                  <DialogClose asChild>
                      <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleSaveConfig}>Save changes</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Card>
  );
}
