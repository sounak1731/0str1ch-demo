"use client";

import { useState, useRef, useMemo } from "react";
import Draggable from "react-draggable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, X, CheckCircle2, MessageSquare, Trash2, Send } from "lucide-react";
import type { Activity } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  activities: Activity[];
}

export function HistoryPanel({ open, onClose, activities: initialActivities }: HistoryPanelProps) {
  const nodeRef = useRef(null);
  const [activities, setActivities] = useState(initialActivities);
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const handleResolveComment = (activityId: string) => {
    setActivities(prev => 
      prev.map(act => act.id === activityId ? { ...act, resolved: true } : act)
    );
  };

  const handleScrapComment = (activityId: string) => {
    setActivities(prev => prev.filter(act => act.id !== activityId));
  };
  
  const handleAddComment = (artifactName: string) => {
    const text = newComments[artifactName];
    if (!text || !text.trim()) return;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      type: 'comment',
      user: 'Me',
      avatarFallback: 'ME',
      timestamp: 'Just now',
      text,
      artifactName,
      resolved: false
    };

    setActivities(prev => [newActivity, ...prev]);
    setNewComments(prev => ({ ...prev, [artifactName]: '' }));
  };
  
  const { actionActivities, commentsByArtifact, unresolvedCount } = useMemo(() => {
    const actionActivities = activities.filter(a => a.type === 'action');
    const commentActivities = activities.filter(a => a.type === 'comment');
    
    const commentsByArtifact = commentActivities.reduce((acc, comment) => {
      const artifactName = comment.artifactName || 'General Comments';
      if (!acc[artifactName]) {
        acc[artifactName] = [];
      }
      acc[artifactName].push(comment);
      return acc;
    }, {} as Record<string, Activity[]>);

    for (const artifactName in commentsByArtifact) {
        commentsByArtifact[artifactName].sort((a, b) => {
            if (a.timestamp === 'Just now') return 1;
            if (b.timestamp === 'Just now') return -1;
            const timeA = parseInt(a.timestamp);
            const timeB = parseInt(b.timestamp);
            return timeA - timeB;
        });
    }

    const unresolvedCount = commentActivities.filter(c => !c.resolved).length;

    return { actionActivities, commentsByArtifact, unresolvedCount };
  }, [activities]);

  if (!open) return null;

  return (
    <Draggable handle=".drag-handle" nodeRef={nodeRef}>
      <div ref={nodeRef} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
        <Card className="w-[600px] h-[650px] shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b drag-handle cursor-move bg-card">
            <h2 className="flex items-center gap-2 font-semibold">
              <History className="h-5 w-5 text-primary" />
              Version History
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="comments" className="flex-1 flex flex-col min-h-0">
            <TabsList className="m-3 mx-auto grid w-full max-w-sm grid-cols-2">
              <TabsTrigger value="comments">
                  Comments
                  {unresolvedCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                          {unresolvedCount}
                      </span>
                  )}
              </TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="flex-1 overflow-y-auto mt-0">
              <ScrollArea className="h-full">
                <div className="p-4 pt-0">
                  {Object.keys(commentsByArtifact).length > 0 ? (
                    <Accordion type="single" collapsible className="w-full" defaultValue={Object.keys(commentsByArtifact)[0]}>
                      {Object.entries(commentsByArtifact).map(([artifactName, comments]) => (
                        <AccordionItem value={artifactName} key={artifactName}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                                <span className="font-medium">{artifactName}</span>
                                <span className="text-xs text-muted-foreground">({comments.filter(c => !c.resolved).length} open)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pl-4">
                              {comments.map(comment => (
                                <div key={comment.id} className={cn("flex flex-col", comment.resolved && "opacity-50")}>
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                                            <AvatarFallback>{comment.avatarFallback}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm">{comment.user}</p>
                                                <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                                            </div>
                                            <blockquote className={cn("mt-1 text-sm", comment.resolved && "italic line-through")}>
                                              {comment.text}
                                            </blockquote>
                                        </div>
                                    </div>

                                    {!comment.resolved && (
                                        <div className="flex items-center gap-2 mt-2 self-end">
                                            <Button size="sm" variant="outline" onClick={() => handleResolveComment(comment.id)}>
                                                <CheckCircle2 className="h-4 w-4 mr-2" /> Resolve
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleScrapComment(comment.id)}>
                                                 <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                              ))}
                               <div className="flex items-center gap-2 pt-4 mt-4 border-t">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person user" />
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                                <Input 
                                  placeholder={`Reply in ${artifactName}...`} 
                                  value={newComments[artifactName] || ''}
                                  onChange={(e) => setNewComments(prev => ({...prev, [artifactName]: e.target.value}))}
                                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(artifactName)}
                                />
                                <Button size="icon" onClick={() => handleAddComment(artifactName)} disabled={!newComments[artifactName]?.trim()}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center text-muted-foreground pt-10">
                        <MessageSquare className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold">No comments yet</p>
                        <p className="text-sm">Start a conversation on any artifact.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-y-auto mt-0">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                    {actionActivities.map((activity) => (
                        <div key={activity.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                            <AvatarFallback>{activity.avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>
                            <span className="text-muted-foreground ml-2">{activity.timestamp}</span>
                            </p>
                            <div className="text-sm text-foreground mt-1">
                                <span>{activity.text}</span>
                            </div>
                        </div>
                        </div>
                    ))}
                    {actionActivities.length === 0 && (
                        <div className="text-center text-muted-foreground pt-10">
                        <p>No actions logged yet.</p>
                        <p className="text-xs">Data cleaning and forecasts will appear here.</p>
                        </div>
                    )}
                    </div>
                </ScrollArea>
            </TabsContent>

          </Tabs>
        </Card>
      </div>
    </Draggable>
  );
}
