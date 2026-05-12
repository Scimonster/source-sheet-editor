'use client';

import { useEffect, useRef, useState } from 'react';
import { useSheetStore } from '@/lib/store';
import { storageAdapter } from '@/lib/storage';
import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { PrintStylesInjector } from './PrintStylesInjector';

interface EditorAppProps {
  sheetId: string;
}

export function EditorApp({ sheetId }: EditorAppProps) {
  const loadSheet = useSheetStore((s) => s.loadSheet);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Load the sheet from storage on mount
  useEffect(() => {
    let cancelled = false;
    storageAdapter.getSheet(sheetId).then((sheet) => {
      if (cancelled) return;
      if (sheet) {
        loadSheet(sheet);
        setIsLoading(false);
      } else {
        setNotFound(true);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [sheetId, loadSheet]);

  // Autosave: subscribe to store changes and debounce saves
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const unsubscribe = useSheetStore.subscribe((state) => {
      if (!state.sheet.id) return; // don't save blank skeleton
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        storageAdapter.saveSheet(state.sheet);
      }, 400);
    });
    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        Sheet not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <PrintStylesInjector />
      <EditorToolbar />
      <EditorCanvas />
    </div>
  );
}
