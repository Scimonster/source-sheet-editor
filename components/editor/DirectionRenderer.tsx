'use client';

import { DirectionElement } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';

interface Props {
  direction: DirectionElement;
}

export function DirectionRenderer({ direction }: Props) {
  const { viewMode, updateElement } = useSheetStore();
  const isEdit = viewMode === 'edit';
  const isLeader = viewMode === 'leader';

  // Directions are hidden in standard preview
  if (viewMode === 'preview') {
    return null;
  }

  const dm = direction.displayMode;

  const wrapperClass = cn(
    'direction-element py-1',
    // Use CSS custom properties for the warm amber/tawny tones
    '[color:oklch(0.45_0.09_56)]',
    dm.italics && 'italic',
    dm.indent && 'ml-5',
    dm.border && 'border-l-4 pl-3 [border-color:oklch(0.72_0.12_76)]',
    dm.small && 'text-xs',
    isLeader && 'rounded px-2 py-1 [background:oklch(0.972_0.032_82)]'
  );

  if (isEdit) {
    return (
      <div className={wrapperClass}>
        <div className="text-xs font-semibold mb-1 uppercase tracking-wide [color:oklch(0.55_0.09_56)]">
          Direction note
        </div>
        <RichTextEditor
          key={direction.id}
          value={direction.content}
          onChange={(html) => updateElement(direction.id, { content: html })}
          placeholder="Add a direction note for the chaburah leader…"
          minHeight="2.5rem"
        />
      </div>
    );
  }

  // Leader view
  return (
    <div className={wrapperClass}>
      {dm.brackets ? (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: `[${direction.content}]` }}
        />
      ) : (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: direction.content }}
        />
      )}
    </div>
  );
}
