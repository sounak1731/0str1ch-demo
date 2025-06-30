
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Link, Users, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const initialUsers = [
  { id: 1, name: 'Sam Dy', email: 'sam@ui8.net', access: 'Can edit', avatar: 'https://placehold.co/40x40.png', avatarHint: 'man portrait' },
  { id: 2, name: 'Ellie Joy', email: 'ellie@ui8.net', access: 'Can edit', avatar: 'https://placehold.co/40x40.png', avatarHint: 'woman portrait' },
  { id: 3, name: 'Hellen', email: 'helen@ui8.net', access: 'Owner', avatar: 'https://placehold.co/40x40.png', avatarHint: 'woman smiling' },
];

export function ShareDialog({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://brainwave.co/file/k373nH");
    toast({ title: "Link copied!" });
  };
  
  const handleRemoveUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold">Share Sales Performance</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
            <div className="flex space-x-2">
                <Input placeholder="Email, name..." className="flex-1 h-10" />
                <Select defaultValue="view">
                    <SelectTrigger className="w-[120px] h-10">
                        <SelectValue placeholder="Can view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="edit">Can edit</SelectItem>
                        <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                </Select>
                <Button className="h-10">Invite</Button>
            </div>
            
            <div className="space-y-4">
                <Label className="text-sm font-medium text-muted-foreground">General access</Label>
                <div className="flex items-start space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-background rounded-full border">
                       <Users className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Only those invited</p>
                        <p className="text-sm text-muted-foreground">{users.length} people</p>
                    </div>
                </div>
                <div className="flex items-start space-x-4 p-2 rounded-lg hover:bg-muted cursor-pointer">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-background rounded-full border">
                       <Link className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Link access</p>
                        <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">People with access</Label>
                <div className="mt-2 space-y-1">
                {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between hover:bg-muted p-2 -mx-2 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} data-ai-hint={user.avatarHint} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        {user.access === 'Owner' ? (
                            <span className="text-sm text-muted-foreground px-3">Owner</span>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Select defaultValue={user.access.toLowerCase().replace('can ', '')}>
                                    <SelectTrigger className="w-[110px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="edit">Can edit</SelectItem>
                                        <SelectItem value="view">Can view</SelectItem>
                                    </SelectContent>
                                </Select>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveUser(user.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Remove</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
        </div>

        <div className="bg-muted px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-muted-foreground flex items-center gap-2 max-w-[280px] truncate">
                <Link className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">https://brainwave.co/file/k373nH</span>
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
