'use client';

import { useState, useRef, useEffect } from 'react';
import { TextElement, Section } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';
import { resolveStyles } from '@/lib/resolve-styles';

interface Props {
  text: TextElement;
  ancestorSections: Section[];
}

export function TextRenderer({ text, ancestorSections }: Props) {
  const { viewMode, updateElement, sheet } = useSheetStore();
  const isEdit = viewMode === 'edit';
  const [isEditing, setIsEditing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close editor on click outside
  useEffect(() => {
    if (!isEditing) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const isEmpty = !text.content || text.content === '<p></p>' || text.content.trim() === '';

  // Resolve cascading styles
  const resolved = resolveStyles(text, ancestorSections, sheet.config);

  const styleProps: React.CSSProperties = {
    fontFamily: resolved.fontFamily,
    fontSize: resolved.fontSize,
    textAlign: resolved.justification,
  };

  // Preview / non-edit mode
  if (!isEdit) {
    return (
      <div
        className="text-element prose prose-sm max-w-none leading-relaxed py-1"
        style={styleProps}
        dangerouslySetInnerHTML={{ __html: text.content }}
      />
    );
  }

  // Edit mode: click-to-edit
  if (!isEditing) {
    return (
      <div
        className={cn(
          'text-element py-1 cursor-text rounded transition-colors',
          'hover:bg-muted/40',
          isEmpty && 'min-h-[2rem] flex items-center'
        )}
        style={styleProps}
        onClick={() => setIsEditing(true)}
      >
        {isEmpty ? (
          <span className="text-muted-foreground/50 text-sm italic select-none">
            Click to add text…
          </span>
        ) : (
          <div
            className="prose prose-sm max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{ __html: text.content }}
          />
        )}
      </div>
    );
  }

  // Active editing
  return (
    <div ref={wrapperRef} className="text-element py-1" style={styleProps}>
      <RichTextEditor
        key={text.id}
        value={text.content}
        onChange={(html) => updateElement(text.id, { content: html })}
        placeholder="Add commentary, questions, or instructions…"
        minHeight="2.5rem"
      />
    </div>
  );
}
