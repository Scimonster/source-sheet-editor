'use client';

import { useSheetStore } from '@/lib/store';
import { Section, ContentElement } from '@/lib/types';
import { RecursiveSection } from './RecursiveSection';
import { ContentElementRenderer } from './ContentElementRenderer';
import { AddElementBar } from './AddElementBar';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function DropZone({ id, className, children }: { id: string; className?: string; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={cn(className, isOver && "bg-accent/20 border-2 border-dashed border-accent")}>
      {children}
    </div>
  );
}

export function EditorCanvas() {
  const { sheet, viewMode, moveNode, addElement } = useSheetStore();
  const { metadata, config, content } = sheet;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overIdStr = String(over.id);
    if (overIdStr === 'START') {
      moveNode(String(active.id), '', 'start');
    } else if (overIdStr === 'END') {
      moveNode(String(active.id), '', 'end');
    } else if (overIdStr.startsWith('INSIDE_')) {
      moveNode(String(active.id), overIdStr.replace('INSIDE_', ''), 'inside');
    } else {
      moveNode(String(active.id), overIdStr, 'before');
    }
  }

  const isEdit = viewMode === 'edit';

  // Paper width for A4 vs Letter (in mm at 96dpi – we use px approximations on screen)
  const paperClass = config.paperSize === 'Letter' ? 'max-w-[816px]' : 'max-w-[794px]';

  const marginStyle = {
    paddingTop: `${config.margins.top}mm`,
    paddingBottom: `${config.margins.bottom}mm`,
    paddingLeft: `${config.margins.left}mm`,
    paddingRight: `${config.margins.right}mm`,
    fontFamily: config.defaultStyles.fontFamily ?? 'Times New Roman',
    fontSize: config.defaultStyles.fontSize ?? '12pt',
    textAlign: config.defaultStyles.justification ?? 'justify',
  } as React.CSSProperties;

  // Header text
  const hdr = metadata.header;
  const ftr = metadata.footer;
  const hasHeader = hdr && (hdr.left || hdr.center || hdr.right);
  const hasFooter = ftr && (ftr.left || ftr.center || ftr.right || ftr.showPageNumbers);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      {/* View-mode status bar */}
      {viewMode !== 'edit' && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 py-1.5 text-xs font-medium print:hidden',
            viewMode === 'preview' && 'bg-accent/10 text-accent border-b border-accent/20',
            viewMode === 'leader' && 'bg-amber-50 text-amber-700 border-b border-amber-200'
          )}
          role="status"
          aria-live="polite"
        >
          {viewMode === 'preview' && (
            <>
              <span className="size-1.5 rounded-full bg-accent inline-block" aria-hidden />
              Print preview — editing is disabled
            </>
          )}
          {viewMode === 'leader' && (
            <>
              <span className="size-1.5 rounded-full bg-amber-500 inline-block" aria-hidden />
              Leader&apos;s view — direction notes are visible
            </>
          )}
        </div>
      )}

      <main
        className={cn(
          'flex-1 overflow-auto bg-background py-8',
          viewMode === 'preview' && 'bg-muted/30'
        )}
      >
        {/* Extra horizontal padding so hover controls (absolutely positioned) don't clip */}
        <div className="px-12">
          <div
            className={cn(
              'mx-auto bg-card shadow-sm border border-border/60',
              paperClass
            )}
            style={marginStyle}
          >
            {/* Header (screen) */}
            {hasHeader && (
              <div className="flex justify-between items-center text-xs text-muted-foreground pb-2 mb-4 border-b border-border">
                <span>{hdr?.left}</span>
                <span className="font-medium">{hdr?.center}</span>
                <span>{hdr?.right}</span>
              </div>
            )}

            {/* Sheet title */}
            <header className="mb-8 text-center pb-5">
              {metadata.title && (
                <h1 className="font-serif text-3xl font-semibold text-foreground leading-tight text-balance">
                  {metadata.title}
                </h1>
              )}
              {metadata.subtitle && (
                <p className="font-serif text-lg text-muted-foreground mt-1.5 italic text-balance">
                  {metadata.subtitle}
                </p>
              )}
            </header>

            {/* Add bar before first section */}
            {isEdit && (
              <DropZone id="START" className="py-2 -mx-2 px-2 rounded-md transition-colors">
                <AddElementBar afterId="START" />
              </DropZone>
            )}

            {/* Content items (sections and elements) */}
            <SortableContext items={content.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {content.map((item, i) => (
                <div key={item.id}>
                  {item.type === 'section' ? (
                    <RecursiveSection
                      section={item as Section}
                      depth={0}
                      sectionIndex={content.filter((x) => x.type === 'section').indexOf(item)}
                      ancestorSections={[]}
                    />
                  ) : (
                    <ContentElementRenderer
                      element={item as ContentElement}
                      ancestorSections={[]}
                    />
                  )}
                  {isEdit && (
                    <AddElementBar afterId={item.id} />
                  )}
                </div>
              ))}
            </SortableContext>

            {/* Drop zone for the very end of the page */}
            {isEdit && content.length > 0 && (
              <DropZone id="END" className="h-16 flex items-center justify-center border-2 border-transparent mt-4 rounded-md transition-colors text-muted-foreground text-sm" />
            )}

            {/* Footer (screen) */}
            {hasFooter && (
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 mt-4 border-t border-border">
                <span>{ftr?.left}</span>
                <span>{ftr?.center}</span>
                <span>{ftr?.right}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </DndContext>
  );
}
