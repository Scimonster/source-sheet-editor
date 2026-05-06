'use client';

import { TextElement } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import { RichTextEditor } from './RichTextEditor';

interface Props {
  text: TextElement;
}

export function TextRenderer({ text }: Props) {
  const { viewMode, updateElement } = useSheetStore();
  const isEdit = viewMode === 'edit';

  if (isEdit) {
    return (
      <div
        className="text-element py-1"
        style={{
          fontFamily: text.styles?.fontFamily,
          fontSize: text.styles?.fontSize,
        }}
      >
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

  return (
    <div
      className="text-element prose prose-sm max-w-none leading-relaxed py-1"
      style={{
        fontFamily: text.styles?.fontFamily,
        fontSize: text.styles?.fontSize,
        textAlign: text.styles?.justification,
      }}
      dangerouslySetInnerHTML={{ __html: text.content }}
    />
  );
}
