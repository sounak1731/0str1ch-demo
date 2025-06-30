"use client";

import { useState } from "react";
import type { Comment } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThreadPopoverProps {
    children: React.ReactNode;
    comments: Comment[];
}

export function ThreadPopover({ children, comments: initialComments }: ThreadPopoverProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    const commentToAdd: Comment = {
      id: `comment-${Date.now()}`,
      user: "Me", // In a real app, this would be the current user
      avatarFallback: "ME",
      text: newComment,
      resolved: false,
    };
    setComments([...comments, commentToAdd]);
    setNewComment("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddComment();
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 flex flex-col h-[400px]">
        <div className="p-4 border-b">
          <h4 className="font-medium leading-none">Comments</h4>
          <p className="text-sm text-muted-foreground">
            Discuss this artifact with your team.
          </p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 flex flex-col gap-4">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-3 items-start">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://placehold.co/40x40.png`} data-ai-hint="person avatar" />
                  <AvatarFallback>{comment.avatarFallback}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{comment.user}</p>
                  <p className="text-sm text-muted-foreground">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center pt-4">No comments yet. Start the conversation!</p>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 flex items-center gap-2 border-t bg-background">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()} aria-label="Send Comment">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
