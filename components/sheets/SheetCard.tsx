'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SheetMeta } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';

interface SheetCardProps {
  sheet: SheetMeta;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

export function SheetCard({ sheet, onDelete, onRename }: SheetCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(sheet.title);

  const handleOpen = () => {
    router.push(`/sheet/${sheet.id}`);
  };

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== sheet.title) {
      onRename(newTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTitle(sheet.title);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/20 bg-card overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-8 py-0 px-2 font-serif text-lg font-semibold"
            />
          ) : (
            <h3 
              className="font-serif text-lg font-semibold truncate group-hover:text-primary transition-colors cursor-pointer"
              onClick={handleOpen}
              onDoubleClick={() => setIsEditing(true)}
            >
              {sheet.title || 'Untitled Sheet'}
            </h3>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground shrink-0">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2">
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0 cursor-pointer" onClick={handleOpen}>
        <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
          <Calendar className="size-3" />
          <span>Updated {formatDistanceToNow(new Date(sheet.updatedAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-2 border-t border-border/40 bg-muted/30 group-hover:bg-primary/5 transition-colors">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between font-medium group/btn text-muted-foreground hover:text-primary hover:bg-transparent p-0"
          onClick={handleOpen}
        >
          Open Sheet
          <ExternalLink className="size-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </Button>
      </CardFooter>
    </Card>
  );
}
