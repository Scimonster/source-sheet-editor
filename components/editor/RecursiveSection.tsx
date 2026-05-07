'use client';

import { useState } from 'react';
import { useSheetStore } from '@/lib/store';
import { Section, ContentElement } from '@/lib/types';
import { ContentElementRenderer } from './ContentElementRenderer';
import { AddElementBar } from './AddElementBar';
import { ElementControls } from './ElementControls';
import { SectionConfigDialog } from './SectionConfigDialog';
import { cn } from '@/lib/utils';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Roman numeral conversion
function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

interface Props {
  section: Section;
  depth: number;
  /** Index within parent for Roman numeral display */
  sectionIndex?: number;
  /** Ancestor sections from root down, for cascading style resolution */
  ancestorSections: Section[];
}

export function RecursiveSection({ section, depth, sectionIndex = 0, ancestorSections }: Props) {
  const { viewMode, addElement, sheet } = useSheetStore();
  const [configOpen, setConfigOpen] = useState(false);
  const isEdit = viewMode === 'edit';

  const showSectionNumbers = sheet.config.showSectionNumbers;
  const headingTag: 'h2' | 'h3' | 'h4' = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';

  // Build title with optional Roman numeral prefix (only depth-0)
  const displayTitle =
    showSectionNumbers && depth === 0
      ? `${toRoman(sectionIndex + 1)}. ${section.title}`
      : section.title;

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
          section.showBorder && 'border border-border rounded-md p-4',
          section.showBorder && depth > 0 && 'ml-4',
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
                  sectionIndex={i}
                  ancestorSections={childAncestors}
                />
              ) : (
                <ContentElementRenderer
                  element={child as ContentElement}
                  ancestorSections={childAncestors}
                />
              )}
              {isEdit && (
                <AddElementBar afterId={child.id} onAdd={addElement} />
              )}
            </div>
          ))}
        </SortableContext>

        {/* Add bar when section is empty */}
        {isEdit && section.children.length === 0 && (
          <AddElementBar afterId={section.id} onAdd={addElement} />
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
