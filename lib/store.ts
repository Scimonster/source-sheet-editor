import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  SourceSheet,
  Section,
  ContentElement,
  ViewMode,
  SourceElement,
  TextElement,
  DirectionElement,
  GlobalConfig,
} from './types';
import { seedSheet } from './seed-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Deep-clone a node tree */
function cloneNode<T>(node: T): T {
  return JSON.parse(JSON.stringify(node));
}

/**
 * Walk the tree and apply a mapping function to every node.
 * If the mapper returns null the node is removed.
 */
function mapNodes(
  nodes: (Section | ContentElement)[],
  fn: (node: Section | ContentElement) => (Section | ContentElement) | null
): (Section | ContentElement)[] {
  const result: (Section | ContentElement)[] = [];
  for (const node of nodes) {
    const mapped = fn(node);
    if (mapped === null) continue;
    if (mapped.type === 'section') {
      result.push({
        ...mapped,
        children: mapNodes((mapped as Section).children, fn),
      } as Section);
    } else {
      result.push(mapped);
    }
  }
  return result;
}

/** Find the parent array that contains a given id, plus the index */
function findParentList(
  nodes: (Section | ContentElement)[],
  id: string
): { list: (Section | ContentElement)[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { list: nodes, index: i };
    if (nodes[i].type === 'section') {
      const found = findParentList((nodes[i] as Section).children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Count sources in a flat list for numbering */
function countSourcesBefore(
  allContent: (Section | ContentElement)[],
  targetId: string,
  count = { n: 0, found: false }
): { n: number; found: boolean } {
  for (const node of allContent) {
    if (count.found) break;
    if (node.id === targetId) {
      count.found = true;
      break;
    }
    if (node.type === 'source') count.n++;
    if (node.type === 'section') {
      countSourcesBefore((node as Section).children, targetId, count);
    }
  }
  return count;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface SheetState {
  sheet: SourceSheet;
  viewMode: ViewMode;
  selectedId: string | null;

  // Metadata
  updateMetadata: (updates: Partial<SourceSheet['metadata']>) => void;
  updateConfig: (updates: Partial<GlobalConfig>) => void;

  // View
  setViewMode: (mode: ViewMode) => void;
  setSelectedId: (id: string | null) => void;

  // Content CRUD
  addElement: (
    afterId: string | null,
    element: Section | ContentElement
  ) => void;
  updateElement: (
    id: string,
    updates: Partial<Section | ContentElement>
  ) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Move
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;

  // Drag & drop – move a node to a new position
  moveNode: (dragId: string, overId: string, position: 'before' | 'after' | 'inside') => void;

  // Helpers
  getSourceNumber: (id: string) => number;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSheetStore = create<SheetState>()(
  temporal(
    (set, get) => ({
      sheet: cloneNode(seedSheet),
      viewMode: 'edit',
      selectedId: null,

      updateMetadata: (updates) =>
        set((s) => ({
          sheet: { ...s.sheet, metadata: { ...s.sheet.metadata, ...updates } },
        })),

      updateConfig: (updates) =>
        set((s) => ({
          sheet: { ...s.sheet, config: { ...s.sheet.config, ...updates } },
        })),

      setViewMode: (mode) => set({ viewMode: mode }),
      setSelectedId: (id) => set({ selectedId: id }),

      addElement: (afterId, element) => {
        set((s) => {
          const content = cloneNode(s.sheet.content) as Section[];
          if (afterId === null) {
            content.push(element as Section);
          } else {
            const found = findParentList(content, afterId);
            if (found) {
              found.list.splice(found.index + 1, 0, element);
            } else {
              content.push(element as Section);
            }
          }
          return { sheet: { ...s.sheet, content } };
        });
      },

      updateElement: (id, updates) => {
        set((s) => ({
          sheet: {
            ...s.sheet,
            content: mapNodes(s.sheet.content, (node) => {
              if (node.id !== id) return node;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return { ...(node as any), ...(updates as any) } as Section | ContentElement;
            }) as Section[],
          },
        }));
      },

      deleteElement: (id) => {
        set((s) => ({
          sheet: {
            ...s.sheet,
            content: mapNodes(s.sheet.content, (node) =>
              node.id === id ? null : node
            ) as Section[],
          },
        }));
      },

      duplicateElement: (id) => {
        set((s) => {
          const content = cloneNode(s.sheet.content) as Section[];
          const found = findParentList(content, id);
          if (!found) return s;
          const clone = cloneNode(found.list[found.index]);
          // Re-assign ids recursively
          const reassignIds = (node: Section | ContentElement): Section | ContentElement => {
            const newNode = { ...node, id: generateId(node.type) };
            if (newNode.type === 'section') {
              (newNode as Section).children = (newNode as Section).children.map(reassignIds);
            }
            return newNode;
          };
          const newClone = reassignIds(clone);
          found.list.splice(found.index + 1, 0, newClone);
          return { sheet: { ...s.sheet, content } };
        });
      },

      moveUp: (id) => {
        set((s) => {
          const content = cloneNode(s.sheet.content) as Section[];
          const found = findParentList(content, id);
          if (!found || found.index === 0) return s;
          const [item] = found.list.splice(found.index, 1);
          found.list.splice(found.index - 1, 0, item);
          return { sheet: { ...s.sheet, content } };
        });
      },

      moveDown: (id) => {
        set((s) => {
          const content = cloneNode(s.sheet.content) as Section[];
          const found = findParentList(content, id);
          if (!found || found.index >= found.list.length - 1) return s;
          const [item] = found.list.splice(found.index, 1);
          found.list.splice(found.index + 1, 0, item);
          return { sheet: { ...s.sheet, content } };
        });
      },

      moveNode: (dragId, overId, position) => {
        set((s) => {
          if (dragId === overId) return s;
          const content = cloneNode(s.sheet.content) as Section[];

          // Extract the dragged node
          const fromFound = findParentList(content, dragId);
          if (!fromFound) return s;
          const [dragNode] = fromFound.list.splice(fromFound.index, 1);

          if (position === 'inside') {
            // Drop inside a section
            const toFound = findParentList(content, overId);
            if (!toFound) { fromFound.list.splice(fromFound.index, 0, dragNode); return s; }
            const overNode = toFound.list[toFound.index];
            if (overNode.type !== 'section') { fromFound.list.splice(fromFound.index, 0, dragNode); return s; }
            (overNode as Section).children.push(dragNode);
          } else {
            const toFound = findParentList(content, overId);
            if (!toFound) { fromFound.list.splice(fromFound.index, 0, dragNode); return s; }
            const insertAt = position === 'before' ? toFound.index : toFound.index + 1;
            toFound.list.splice(insertAt, 0, dragNode);
          }

          return { sheet: { ...s.sheet, content } };
        });
      },

      getSourceNumber: (id) => {
        const { n } = countSourcesBefore(get().sheet.content, id);
        return n + 1;
      },
    }),
    { limit: 30 }
  )
);

// Expose undo/redo from the temporal store
export const useTemporalStore = () => useSheetStore.temporal.getState();

export function newSourceElement(): SourceElement {
  return {
    id: generateId('source'),
    type: 'source',
    ref: { en: '', he: '', link: '' },
    content: {
      en: { text: '' },
      he: { text: '' },
    },
    displayOptions: {
      layout: 'side-by-side',
      primaryLanguage: 'he',
      columnRatio: '50%',
    },
  };
}

export function newTextElement(): TextElement {
  return {
    id: generateId('text'),
    type: 'text',
    content: '',
  };
}

export function newDirectionElement(): DirectionElement {
  return {
    id: generateId('direction'),
    type: 'direction',
    content: '',
    displayMode: {
      italics: true,
      indent: true,
      border: true,
      brackets: false,
      small: false,
    },
  };
}

export function newSection(): Section {
  return {
    id: generateId('section'),
    type: 'section',
    title: 'New Section',
    showBorder: false,
    children: [],
  };
}

export { generateId };
