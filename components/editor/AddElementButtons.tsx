'use client';

import { useState } from 'react';
import { Section, ContentElement } from '@/lib/types';
import {
  newSourceElement,
  newTextElement,
  newDirectionElement,
  newSection,
  useSheetStore,
} from '@/lib/store';
import {
  BookText,
  Type,
  Navigation,
  Layers,
} from 'lucide-react';
import { AddSourceDialog } from './AddSourceDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export const addElementItems = [
  { label: 'Source', icon: BookText, create: newSourceElement },
  { label: 'Text', icon: Type, create: newTextElement },
  { label: 'Direction', icon: Navigation, create: newDirectionElement },
  { label: 'Section', icon: Layers, create: newSection },
] as const;

interface Props {
  insertPosition: string | 'START' | 'END';
  onAdded?: (id?: string) => void;
  variant?: 'bar' | 'toolbar';
}

export function AddElementButtons({ insertPosition, onAdded, variant = 'bar' }: Props) {
  const { addElement } = useSheetStore();
  const [sourceAdderOpen, setSourceAdderOpen] = useState(false);

  const handleAdd = (label: string, create: () => Section | ContentElement) => {
    if (label === 'Source') {
      setSourceAdderOpen(true);
      return;
    }
    const newElement = create();
    addElement(insertPosition, newElement);
    onAdded?.(newElement.id);
  };

  return (
    <>
      {addElementItems.map(({ label, icon: Icon, create }) => {
        if (variant === 'toolbar') {
          return (
            <Tooltip key={label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                  onClick={() => handleAdd(label, create)}
                  aria-label={`Add ${label}`}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add {label}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <button
            key={label}
            onClick={() => handleAdd(label, create)}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground hover:text-foreground transition-colors min-w-[52px]"
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}

      {sourceAdderOpen && (
        <AddSourceDialog
          onAdd={(element) => {
            addElement(insertPosition, element);
            onAdded?.(element.id);
            setSourceAdderOpen(false);
          }}
          onClose={() => setSourceAdderOpen(false)}
        />
      )}
    </>
  );
}
