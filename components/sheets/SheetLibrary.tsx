'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storageAdapter, createBlankSheet, SheetMeta } from '@/lib/storage';
import { SheetCard } from '@/components/sheets/SheetCard';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';

export function SheetLibrary() {
  const [sheets, setSheets] = useState<SheetMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSheets();
  }, []);

  async function loadSheets() {
    setIsLoading(true);
    const list = await storageAdapter.listSheets();
    setSheets(list);
    setIsLoading(false);
  }

  async function handleCreateSheet() {
    const newSheet = createBlankSheet();
    await storageAdapter.saveSheet(newSheet);
    router.push(`/sheet/${newSheet.id}`);
  }

  async function handleDelete(id: string) {
    await storageAdapter.deleteSheet(id);
    loadSheets();
  }

  async function handleRename(id: string, newTitle: string) {
    const sheet = await storageAdapter.getSheet(id);
    if (sheet) {
      sheet.metadata.title = newTitle;
      await storageAdapter.saveSheet(sheet);
      loadSheets();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center px-6 justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-md text-primary-foreground">
            <BookOpen className="size-5" />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight">Mekorly</h1>
        </div>
        <Button onClick={handleCreateSheet} className="gap-2">
          <Plus className="size-4" />
          New Sheet
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-serif font-semibold">Your Sheets</h2>
            <p className="text-muted-foreground">Manage and edit your collection of source sheets.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border-2 border-dashed border-border text-center px-4">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <BookOpen className="size-8" />
            </div>
            <h3 className="text-lg font-medium">No sheets yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs">
              Create your first source sheet to get started with the editor.
            </p>
            <Button onClick={handleCreateSheet} variant="outline" className="mt-6 gap-2">
              <Plus className="size-4" />
              Create your first sheet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map((sheet) => (
              <SheetCard
                key={sheet.id}
                sheet={sheet}
                onDelete={() => handleDelete(sheet.id)}
                onRename={(newTitle) => handleRename(sheet.id, newTitle)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
