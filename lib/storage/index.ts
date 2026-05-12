import { SourceSheet, GlobalConfig } from '../types';
import { LocalStorageAdapter } from './localStorage';

export type { SheetMeta, SheetStorageAdapter } from './types';

/**
 * Singleton storage adapter.
 * To switch to a cloud backend, swap `LocalStorageAdapter` for your new adapter here.
 */
export const storageAdapter = new LocalStorageAdapter();

// ─── Default config used for new sheets ─────────────────────────────────────

const DEFAULT_CONFIG: GlobalConfig = {
  paperSize: 'A4',
  margins: { top: 20, bottom: 20, left: 15, right: 15 },
  defaultStyles: {
    fontFamily: 'Times New Roman',
    fontSize: '12pt',
    justification: 'justify',
  },
  sectionNumbering: 'roman',
  sourceNumbering: 'arabic',
};

// ─── Factory ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a brand-new blank sheet with sensible defaults. */
export function createBlankSheet(title: string = 'Untitled Sheet'): SourceSheet {
  return {
    id: generateId(),
    version: '1.0',
    metadata: {
      title,
      subtitle: '',
      header: { left: '', center: '', right: '' },
      footer: { left: '', center: '', right: '', showPageNumbers: true },
      authorId: '',
      username: '',
      visibility: 'private',
      collaborators: [],
    },
    config: DEFAULT_CONFIG,
    content: [],
  };
}
