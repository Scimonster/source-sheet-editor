'use client';

import { useSheetStore } from '@/lib/store';
import { Section, ContentElement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Settings2,
  GripVertical,
  Outdent,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface Props {
  node: Section | ContentElement;
  onConfigure: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ElementControls({ node, onConfigure, children, className }: Props) {
  const { deleteElement, duplicateElement, moveUp, moveDown, unnestElement, viewMode } =
    useSheetStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: node.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (viewMode !== 'edit') {
    return <div className={className}>{children}</div>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        ref={setNodeRef}
        style={style}
        className={cn('group relative', className)}
      >
        {/* Hover action strip */}
        <div
          className={cn(
            'absolute -left-9 top-1 flex flex-col gap-0.5',
            'opacity-0 group-hover:opacity-100 transition-opacity z-10'
          )}
        >
          {/* Drag handle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                {...attributes}
                {...listeners}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Drag to reorder</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => moveUp(node.id)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Move up"
              >
                <ChevronUp className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Move up</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => moveDown(node.id)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Move down"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Move down</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => unnestElement(node.id)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                aria-label="Move out of section"
              >
                <Outdent className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">Move out of section</TooltipContent>
          </Tooltip>
        </div>

        {/* Right-side action strip */}
        <div
          className={cn(
            'absolute -right-20 top-1 flex items-center gap-0.5',
            'opacity-0 group-hover:opacity-100 transition-opacity z-10'
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={onConfigure}
                aria-label="Configure"
              >
                <Settings2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Configure</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => duplicateElement(node.id)}
                aria-label="Duplicate"
              >
                <Copy className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Duplicate</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 hover:text-destructive"
                onClick={() => deleteElement(node.id)}
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Delete</TooltipContent>
          </Tooltip>
        </div>

        {children}
      </div>
    </TooltipProvider>
  );
}
