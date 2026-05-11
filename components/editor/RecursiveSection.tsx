'use client';

import { useState } from 'react';
import { useSheetStore } from '@/lib/store';
import { Section, ContentElement } from '@/lib/types';
import { ContentElementRenderer } from './ContentElementRenderer';
import { AddElementBar } from './AddElementBar';
import { ElementControls } from './ElementControls';
import { SectionConfigDialog } from './SectionConfigDialog';
import { resolveSectionProperties, resolveSectionNumbering } from '@/lib/resolve-styles';
import { cn, formatNumber } from '@/lib/utils';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

interface Props {
  section: Section;
  depth: number;
  /** Index within parent for numbering */
  sectionIndex?: number;
  /** Ancestor sections from root down, for cascading style resolution */
  ancestorSections: Section[];
}

export function RecursiveSection({ section, depth, sectionIndex = 0, ancestorSections }: Props) {
  const { viewMode, addElement, sheet } = useSheetStore();
  const [configOpen, setConfigOpen] = useState(false);
  const isEdit = viewMode === 'edit';

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `INSIDE_${section.id}`,
    disabled: section.children.length > 0 || !isEdit,
  });

  const sectionNumbering = resolveSectionNumbering(ancestorSections, sheet.config);
  const headingTag: 'h2' | 'h3' | 'h4' = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';

  const { showBorder } = resolveSectionProperties(section, ancestorSections, sheet.config);

  // Build title with optional prefix
  const prefix = formatNumber(sectionIndex + 1, sectionNumbering);
  const displayTitle = prefix ? `${prefix}. ${section.title}` : section.title;

  const sectionHeadingClass = cn(
    'font-serif font-semibold text-foreground leading-tight',
    depth === 0 && 'text-xl mt-2 mb-3',
    depth === 1 && 'text-lg mt-1 mb-2',
    depth >= 2 && 'text-base mt-1 mb-1.5'
  );

  const childIds = section.children.map((c) => c.id);

  // Ancestor chain including this section
  const childAncestors = [...ancestorSections, section];

  return (
    <ElementControls
      node={section}
      onConfigure={() => setConfigOpen(true)}
      className="mb-4"
    >
      <div
        className={cn(
          showBorder && 'border border-border rounded-md p-4',
          showBorder && depth > 0 && 'ml-4',
        )}
      >
        {/* Section title */}
        {headingTag === 'h2' && <h2 className={sectionHeadingClass}>{displayTitle}</h2>}
        {headingTag === 'h3' && <h3 className={sectionHeadingClass}>{displayTitle}</h3>}
        {headingTag === 'h4' && <h4 className={sectionHeadingClass}>{displayTitle}</h4>}

        {/* Children */}
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {section.children.map((child, i) => (
            <div key={child.id}>
              {child.type === 'section' ? (
                <RecursiveSection
                  section={child as Section}
                  depth={depth + 1}
                  sectionIndex={section.children.filter((x) => x.type === 'section').indexOf(child)}
                  ancestorSections={childAncestors}
                />
              ) : (
                <ContentElementRenderer
                  element={child as ContentElement}
                  ancestorSections={childAncestors}
                />
              )}
              {isEdit && (
                <AddElementBar afterId={child.id} />
              )}
            </div>
          ))}
        </SortableContext>

        {/* Add bar when section is empty */}
        {isEdit && section.children.length === 0 && (
          <div
            ref={setDroppableRef}
            className={cn(
              "py-4 transition-colors rounded-md -mx-2 px-2",
              isOver && "bg-accent/20 border-2 border-dashed border-accent"
            )}
          >
            <AddElementBar afterId={`INSIDE_${section.id}`} />
          </div>
        )}
      </div>

      <SectionConfigDialog
        section={section}
        open={configOpen}
        onOpenChange={setConfigOpen}
      />
    </ElementControls>
  );
}
