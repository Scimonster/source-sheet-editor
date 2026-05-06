'use client';

import { SourceElement } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';

interface Props {
  source: SourceElement;
}

export function SourceRenderer({ source }: Props) {
  const { viewMode, updateElement, getSourceNumber, sheet } = useSheetStore();
  const isEdit = viewMode === 'edit';
  const showNumbers = sheet.config.showSourceNumbers;

  const sourceNum = getSourceNumber(source.id);
  const { ref, content, displayOptions, directionNote } = source;

  // Reference header
  const hasLink = ref.link && ref.link.trim() !== '';
  const refHe = ref.he;
  const refEn = ref.en;

  const refDisplay = (
    <div className="flex flex-wrap items-center gap-2 mb-3 pb-1.5 border-b border-border/60">
      {showNumbers && (
        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-sans tabular-nums">
          {sourceNum}.
        </span>
      )}
      {refHe && (
        <span
          className={cn(
            'font-serif font-semibold text-base text-foreground',
            hasLink && 'text-accent underline-offset-2 underline cursor-pointer hover:opacity-80'
          )}
          dir="rtl"
          onClick={hasLink ? () => window.open(ref.link, '_blank') : undefined}
        >
          {refHe}
        </span>
      )}
      {refEn && (
        <span
          className={cn(
            'font-serif text-sm text-muted-foreground',
            hasLink && 'text-accent underline-offset-2 underline cursor-pointer hover:opacity-80'
          )}
          onClick={hasLink ? () => window.open(ref.link, '_blank') : undefined}
        >
          {refEn}
        </span>
      )}
    </div>
  );

  // Direction note (if any)
  const dirDisplay = directionNote && directionNote.trim() && directionNote !== '<p></p>' && (
    (viewMode === 'edit' || viewMode === 'leader') && (
      <div
        className="text-sm italic text-muted-foreground border-l-2 border-amber-400 pl-3 mb-2 direction-note"
        dangerouslySetInnerHTML={{ __html: directionNote }}
      />
    )
  );

  const layout = displayOptions.layout;
  const primary = displayOptions.primaryLanguage;
  // Parse column ratio: primary language column width
  const primaryRatioPct = parseInt(displayOptions.columnRatio ?? '50') || 50;
  const secondaryRatioPct = 100 - primaryRatioPct;

  const heContent = isEdit ? (
    <RichTextEditor
      key={`${source.id}-he`}
      value={content.he.text}
      onChange={(html) =>
        updateElement(source.id, {
          content: { ...content, he: { ...content.he, text: html } },
        })
      }
      rtl
      placeholder="Hebrew text…"
      minHeight="4rem"
    />
  ) : (
    <div
      className="prose prose-sm max-w-none leading-relaxed"
      dir="rtl"
      dangerouslySetInnerHTML={{ __html: content.he.text }}
    />
  );

  const enContent = isEdit ? (
    <RichTextEditor
      key={`${source.id}-en`}
      value={content.en.text}
      onChange={(html) =>
        updateElement(source.id, {
          content: { ...content, en: { ...content.en, text: html } },
        })
      }
      rtl={false}
      placeholder="English translation…"
      minHeight="4rem"
    />
  ) : (
    <div
      className="prose prose-sm max-w-none leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content.en.text }}
    />
  );

  // For stacked / single, primary language goes first
  const first = primary === 'he' ? heContent : enContent;
  const second = primary === 'he' ? enContent : heContent;

  // Side-by-side: Hebrew always on right, English always on left,
  // column widths determined by columnRatio (applied to the Hebrew column)
  const heWidth = `${primary === 'he' ? primaryRatioPct : secondaryRatioPct}%`;
  const enWidth = `${primary === 'he' ? secondaryRatioPct : primaryRatioPct}%`;

  const sourceBody =
    layout === 'side-by-side' ? (
      // dir="rtl" puts Hebrew (rightmost) first visually
      <div className="flex gap-3" dir="rtl">
        <div className="flex-shrink-0" style={{ width: heWidth }}>
          {heContent}
        </div>
        <div className="flex-shrink-0" style={{ width: enWidth }} dir="ltr">
          {enContent}
        </div>
      </div>
    ) : layout === 'stacked' ? (
      <div className="space-y-2">
        {first}
        {second}
      </div>
    ) : (
      <div>{first}</div>
    );

  return (
    <div
      className={cn(
        'source-element py-2',
        source.styles?.justification && `text-${source.styles.justification}`
      )}
      style={{
        fontFamily: source.styles?.fontFamily,
        fontSize: source.styles?.fontSize,
      }}
    >
      {refDisplay}
      {dirDisplay}
      {sourceBody}
    </div>
  );
}
