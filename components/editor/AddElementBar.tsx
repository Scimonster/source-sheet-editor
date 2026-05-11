'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { AddElementButtons } from './AddElementButtons';

interface Props {
  afterId: string | 'START' | 'END';
}

export function AddElementBar({ afterId }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center h-6 my-0 group/bar'
      )}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Line */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-border opacity-0 group-hover/bar:opacity-100 transition-opacity" />

      {/* Plus button */}
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className={cn(
          'relative z-10 flex items-center justify-center size-5 rounded-full',
          'bg-background border border-border text-muted-foreground',
          'hover:bg-primary hover:text-primary-foreground hover:border-primary',
          'opacity-0 group-hover/bar:opacity-100 transition-all',
          open && 'opacity-100 bg-primary text-primary-foreground border-primary'
        )}
        aria-label="Add element"
      >
        <Plus className="size-3" />
      </button>

      {/* Popup menu */}
      <div className={cn(
        "absolute z-20 top-full mt-0 left-1/2 -translate-x-1/2 flex gap-1 bg-popover border border-border rounded-lg shadow-md p-1",
        !open && "hidden"
      )}>
        <AddElementButtons insertPosition={afterId} onAdded={() => setOpen(false)} variant="bar" />
      </div>
    </div>
  );
}
