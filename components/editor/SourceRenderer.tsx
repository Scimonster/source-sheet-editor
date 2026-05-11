'use client';

import { useState, useRef, useEffect } from 'react';
import { SourceElement, Section } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';
import {
  resolveStyles,
  resolveSourceDisplayOptions,
  resolveTitleDisplay,
} from '@/lib/resolve-styles';
import { formatNumber } from '@/lib/utils';

interface Props {
  source: SourceElement;
  ancestorSections: Section[];
}

/** Click-to-edit wrapper for a single language pane */
function EditablePane({
  html,
  onChange,
  rtl,
  placeholder,
  sourceId,
  langKey,
}: {
  html: string;
  onChange: (html: string) => void;
  rtl: boolean;
  placeholder: string;
  sourceId: string;
  langKey: string;
}) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setEditing(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing]);

  const isEmpty = !html || html === '<p></p>' || html.trim() === '';

  if (!editing) {
    return (
      <div
        className={cn(
          'cursor-text rounded transition-colors hover:bg-muted/40',
          isEmpty && 'min-h-[2.5rem] flex items-center'
        )}
        dir={rtl ? 'rtl' : 'ltr'}
        onClick={() => setEditing(true)}
      >
        {isEmpty ? (
          <span className="text-muted-foreground/50 text-sm italic select-none">
            {placeholder}
          </span>
        ) : (
          <div
            className="prose prose-sm max-w-none leading-relaxed"
            style={{ textAlign: rtl ? 'right' : 'left' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    );
  }

  return (
    <div ref={ref}>
      <RichTextEditor
        key={`${sourceId}-${langKey}`}
        value={html}
        onChange={onChange}
        rtl={rtl}
        placeholder={placeholder}
        minHeight="4rem"
      />
    </div>
  );
}

export function SourceRenderer({ source, ancestorSections }: Props) {
  const { viewMode, updateElement, getSourceNumber, sheet } = useSheetStore();
  const isEdit = viewMode === 'edit';
  const sourceNumbering = sheet.config.sourceNumbering;
  const config = sheet.config;

  const sourceNum = getSourceNumber(source.id);
  const formattedNum = formatNumber(sourceNum, sourceNumbering);
  const { ref, content, directionNote } = source;

  // ─── Resolved cascading config ──────────────────────────────────────
  const resolvedStyles = resolveStyles(source, ancestorSections, config);
  const resolvedDisplay = resolveSourceDisplayOptions(source, ancestorSections, config);
  const resolvedTitle = resolveTitleDisplay(source, ancestorSections, config);
  const resolvedHeStyles = resolveStyles(source, ancestorSections, config, 'hebrew');
  const resolvedEnStyles = resolveStyles(source, ancestorSections, config, 'english');
  const resolvedTitleStyles = resolveStyles(source, ancestorSections, config, 'sourceTitle');

  // ─── Reference header ───────────────────────────────────────────────
  const hasLink = ref.link && ref.link.trim() !== '';
  const refHe = ref.he;
  const refEn = ref.en;
  const titleLangs = resolvedTitle.languages ?? 'both';
  const showHeRef = titleLangs === 'both' || titleLangs === 'he';
  const showEnRef = titleLangs === 'both' || titleLangs === 'en';

  const refStyle: React.CSSProperties = {
    justifyContent: resolvedTitle.justification === 'center' ? 'center'
      : resolvedTitle.justification === 'right' ? 'flex-end'
      : resolvedTitle.justification === 'left' ? 'flex-start'
      : undefined,
    fontFamily: resolvedTitle.fontFamily ?? resolvedTitleStyles.fontFamily,
    fontSize: resolvedTitle.fontSize ?? resolvedTitleStyles.fontSize,
  };

  const refDisplay = (
    <div
      className="flex flex-wrap items-center gap-2 mb-3 pb-1.5 border-b border-border/60"
      style={refStyle}
    >
      {formattedNum && (
        <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-1.5 py-0.5 font-sans tabular-nums">
          {formattedNum}.
        </span>
      )}
      {showHeRef && refHe && (
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
      {showEnRef && refEn && (
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

  const layout = resolvedDisplay.layout;
  const primary = resolvedDisplay.primaryLanguage;
  const primaryRatioPct = parseInt(resolvedDisplay.columnRatio ?? '50') || 50;
  const secondaryRatioPct = 100 - primaryRatioPct;

  const heStyle: React.CSSProperties = {
    fontFamily: resolvedHeStyles.fontFamily,
    fontSize: resolvedHeStyles.fontSize,
    textAlign: resolvedHeStyles.justification ?? 'right',
  };

  const enStyle: React.CSSProperties = {
    fontFamily: resolvedEnStyles.fontFamily,
    fontSize: resolvedEnStyles.fontSize,
    textAlign: resolvedEnStyles.justification ?? 'left',
  };

  const heContent = isEdit ? (
    <div style={heStyle}>
      <EditablePane
        html={content.he.text}
        onChange={(html) =>
          updateElement(source.id, {
            content: { ...content, he: { ...content.he, text: html } },
          })
        }
        rtl
        placeholder="Hebrew text…"
        sourceId={source.id}
        langKey="he"
      />
    </div>
  ) : (
    <div
      className="prose prose-sm max-w-none leading-relaxed"
      dir="rtl"
      style={heStyle}
      dangerouslySetInnerHTML={{ __html: content.he.text }}
    />
  );

  const enContent = isEdit ? (
    <div style={enStyle}>
      <EditablePane
        html={content.en.text}
        onChange={(html) =>
          updateElement(source.id, {
            content: { ...content, en: { ...content.en, text: html } },
          })
        }
        rtl={false}
        placeholder="English translation…"
        sourceId={source.id}
        langKey="en"
      />
    </div>
  ) : (
    <div
      className="prose prose-sm max-w-none leading-relaxed"
      style={enStyle}
      dangerouslySetInnerHTML={{ __html: content.en.text }}
    />
  );

  // For stacked / single, primary language goes first
  const first = primary === 'he' ? heContent : enContent;
  const second = primary === 'he' ? enContent : heContent;

  // Side-by-side: Hebrew always on right, English always on left
  const heWidth = `${primary === 'he' ? primaryRatioPct : secondaryRatioPct}%`;
  const enWidth = `${primary === 'he' ? secondaryRatioPct : primaryRatioPct}%`;

  const sourceBody =
    layout === 'side-by-side' ? (
      <div className="flex gap-3">
        <div className="flex-shrink-0" style={{ width: enWidth }} dir="ltr">
          {enContent}
        </div>
        <div className="flex-shrink-0" style={{ width: heWidth }} dir="rtl">
          {heContent}
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
        resolvedStyles.justification && `text-${resolvedStyles.justification}`
      )}
      style={{
        fontFamily: resolvedStyles.fontFamily,
        fontSize: resolvedStyles.fontSize,
      }}
    >
      {refDisplay}
      {dirDisplay}
      {sourceBody}
    </div>
  );
}
