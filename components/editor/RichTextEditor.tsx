'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** If true, use RTL text direction */
  rtl?: boolean;
  className?: string;
  minHeight?: string;
  showToolbar?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing…',
  rtl = false,
  className,
  minHeight = '3rem',
  showToolbar = true,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, underline: false }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'outline-none prose prose-sm max-w-none',
          rtl ? 'text-right' : 'text-left',
          'leading-relaxed'
        ),
        dir: rtl ? 'rtl' : 'ltr',
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Sync external changes (e.g. load from store)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const ToolbarButton = ({
    active,
    onClick,
    children,
    label,
  }: {
    active?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    label: string;
  }) => (
    <Toggle
      size="sm"
      pressed={active}
      onPressedChange={() => onClick()}
      aria-label={label}
      className="h-7 w-7 p-0"
    >
      {children}
    </Toggle>
  );

  return (
    <div className={cn('rounded-md border border-border bg-background', className)}>
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border">
          <ToolbarButton
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Bold"
          >
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Italic"
          >
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Underline"
          >
            <UnderlineIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('superscript')}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            label="Superscript"
          >
            <SuperscriptIcon className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('subscript')}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            label="Subscript"
          >
            <SubscriptIcon className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <ToolbarButton
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Bullet list"
          >
            <List className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Ordered list"
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <ToolbarButton
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            label="Align left"
          >
            <AlignLeft className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            label="Align center"
          >
            <AlignCenter className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            label="Align right"
          >
            <AlignRight className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            label="Justify"
          >
            <AlignJustify className="size-3.5" />
          </ToolbarButton>
        </div>
      )}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
