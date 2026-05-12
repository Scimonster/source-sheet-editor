import { SourceSheet } from '../types';
import { SheetMeta, SheetStorageAdapter } from './types';

const INDEX_KEY = 'sheet-index';

function sheetKey(id: string) {
  return `sheet:${id}`;
}

function readIndex(): SheetMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as SheetMeta[]) : [];
  } catch {
    return [];
  }
}

function writeIndex(index: SheetMeta[]): void {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

export class LocalStorageAdapter implements SheetStorageAdapter {
  async listSheets(): Promise<SheetMeta[]> {
    const index = readIndex();
    // Newest-first
    return [...index].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getSheet(id: string): Promise<SourceSheet | null> {
    try {
      const raw = localStorage.getItem(sheetKey(id));
      return raw ? (JSON.parse(raw) as SourceSheet) : null;
    } catch {
      return null;
    }
  }

  async saveSheet(sheet: SourceSheet): Promise<void> {
    const now = new Date().toISOString();
    localStorage.setItem(sheetKey(sheet.id), JSON.stringify(sheet));

    // Update or insert the index entry
    const index = readIndex();
    const existing = index.findIndex((m) => m.id === sheet.id);
    const meta: SheetMeta = { id: sheet.id, title: sheet.metadata.title, updatedAt: now };
    if (existing >= 0) {
      index[existing] = meta;
    } else {
      index.push(meta);
    }
    writeIndex(index);
  }

  async deleteSheet(id: string): Promise<void> {
    localStorage.removeItem(sheetKey(id));
    const index = readIndex().filter((m) => m.id !== id);
    writeIndex(index);
  }
}
