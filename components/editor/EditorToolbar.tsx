'use client';

import { useSheetStore } from '@/lib/store';
import { ViewMode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Undo2,
  Redo2,
  Eye,
  Pencil,
  BookOpen,
  Printer,
  Settings2,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalSettingsDialog } from './GlobalSettingsDialog';
import { AddElementButtons } from './AddElementButtons';
import { useState } from 'react';
import Link from 'next/link';

export function EditorToolbar() {
  const { viewMode, setViewMode, sheet } = useSheetStore();
  const temporalStore = useSheetStore.temporal.getState();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const views: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> },
    { mode: 'preview', label: 'Preview', icon: <Eye className="size-4" /> },
    { mode: 'leader', label: "Leader's View", icon: <BookOpen className="size-4" /> },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <header className="h-12 bg-primary text-primary-foreground border-b border-primary/80 flex items-center px-4 gap-3 shrink-0 print:hidden">
        {/* Back to library */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              className="flex items-center text-primary-foreground/70 hover:text-primary-foreground transition-colors shrink-0"
              aria-label="Back to sheets"
            >
              <ChevronLeft className="size-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>All Sheets</TooltipContent>
        </Tooltip>

        <div className="w-px h-5 bg-white/20 shrink-0" />

        {/* Title */}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className="font-serif text-base font-semibold text-primary-foreground truncate leading-tight">
            {sheet.metadata.title || 'Untitled Sheet'}
          </span>
          {sheet.metadata.subtitle && (
            <span className="text-xs text-primary-foreground/60 truncate hidden sm:inline">
              — {sheet.metadata.subtitle}
            </span>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                onClick={() => temporalStore.undo()}
                aria-label="Undo"
              >
                <Undo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                onClick={() => temporalStore.redo()}
                aria-label="Redo"
              >
                <Redo2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-5 bg-white/20" />

        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 bg-white/10 rounded-md p-0.5">
          {views.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors',
                viewMode === mode
                  ? 'bg-white/20 text-primary-foreground shadow-sm'
                  : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/10'
              )}
              aria-label={label}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-white/20" />

        {viewMode === 'edit' && (
          <>
            <div className="flex items-center gap-0.5">
              <AddElementButtons 
                insertPosition="END" 
                variant="toolbar" 
                onAdded={(id) => {
                  if (id) {
                    setTimeout(() => {
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }
                }}
              />
            </div>
            <div className="w-px h-5 bg-white/20" />
          </>
        )}

        {/* Print */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              onClick={() => window.print()}
              aria-label="Print"
            >
              <Printer className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Print</TooltipContent>
        </Tooltip>

        {/* Global settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
              onClick={() => setSettingsOpen(true)}
              aria-label="Sheet settings"
            >
              <Settings2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sheet settings</TooltipContent>
        </Tooltip>

        <GlobalSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </header>
    </TooltipProvider>
  );
}
