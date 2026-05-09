'use client';

import { useState } from 'react';
import { Section, ContentElement } from '@/lib/types';
import {
  newSourceElement,
  newTextElement,
  newDirectionElement,
  newSection,
} from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Plus,
  BookText,
  Type,
  Navigation,
  Layers,
} from 'lucide-react';

interface Props {
  afterId: string | null;
  onAdd: (afterId: string | null, element: Section | ContentElement) => void;
}

const items = [
  { label: 'Source', icon: BookText, create: newSourceElement },
  { label: 'Text', icon: Type, create: newTextElement },
  { label: 'Direction', icon: Navigation, create: newDirectionElement },
  { label: 'Section', icon: Layers, create: newSection },
] as const;

export function AddElementBar({ afterId, onAdd }: Props) {
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
      {open && (
        <div className="absolute z-20 top-full mt-0 left-1/2 -translate-x-1/2 flex gap-1 bg-popover border border-border rounded-lg shadow-md p-1">
          {items.map(({ label, icon: Icon, create }) => (
            <button
              key={label}
              onClick={() => {
                onAdd(afterId, create() as Section | ContentElement);
                setOpen(false);
              }}
              className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground hover:text-foreground transition-colors min-w-[52px]"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
