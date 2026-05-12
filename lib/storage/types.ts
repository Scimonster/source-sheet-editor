import { SourceSheet } from '../types';

/** Lightweight summary of a sheet used in the library listing. */
export interface SheetMeta {
  id: string;
  title: string;
  updatedAt: string; // ISO-8601
}

/**
 * Swappable storage interface for source sheets.
 * The current implementation is localStorage-backed; a cloud adapter can be
 * dropped in by replacing the singleton in `lib/storage/index.ts`.
 */
export interface SheetStorageAdapter {
  /** Return metadata for all sheets, sorted newest-first. */
  listSheets(): Promise<SheetMeta[]>;

  /** Load a full sheet by id. Returns null when not found. */
  getSheet(id: string): Promise<SourceSheet | null>;

  /**
   * Persist a sheet (create or update).
   * Also updates the metadata index entry for the sheet.
   */
  saveSheet(sheet: SourceSheet): Promise<void>;

  /** Permanently remove a sheet and its index entry. */
  deleteSheet(id: string): Promise<void>;
}
