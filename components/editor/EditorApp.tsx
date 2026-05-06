'use client';

import { EditorToolbar } from './EditorToolbar';
import { EditorCanvas } from './EditorCanvas';
import { PrintStylesInjector } from './PrintStylesInjector';

export function EditorApp() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <PrintStylesInjector />
      <EditorToolbar />
      <EditorCanvas />
    </div>
  );
}
