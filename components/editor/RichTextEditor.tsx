'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
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
  ImagePlus,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { useEffect, useRef } from 'react';

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;

const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('data-width') ?? element.style.width ?? '100%',
      },
      float: {
        default: 'none',
        parseHTML: (element) => element.getAttribute('data-float') ?? element.style.float ?? 'none',
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, float, style, ...rest } = HTMLAttributes as {
      width?: string;
      float?: string;
      style?: string;
    };

    const mergedStyles: string[] = ['max-width: 100%', 'height: auto'];
    if (width) {
      mergedStyles.push(`width: ${width}`);
    }

    if (float === 'left') {
      mergedStyles.push('float: left', 'margin: 0.25rem 1rem 0.5rem 0');
    } else if (float === 'right') {
      mergedStyles.push('float: right', 'margin: 0.25rem 0 0.5rem 1rem');
    } else {
      mergedStyles.push('display: block', 'margin: 0.5rem auto');
    }

    if (style) {
      mergedStyles.push(style);
    }

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        'data-width': width,
        'data-float': float ?? 'none',
        style: mergedStyles.join('; '),
      }),
    ];
  },
});

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
  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false, underline: false }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['paragraph'] }),
      Placeholder.configure({ placeholder }),
      RichImage,
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

  const isImageSelected = editor.isActive('image');
  const activeImageAttrs = editor.getAttributes('image') as { width?: string; float?: string };
  const parsedWidth = parseInt(activeImageAttrs?.width ?? '100', 10);
  const activeImageWidth = Number.isFinite(parsedWidth) ? Math.min(Math.max(parsedWidth, 10), 100) : 100;

  const setImageFloat = (float: 'left' | 'right' | 'none') => {
    editor.chain().focus().updateAttributes('image', { float }).run();
  };

  const onSelectImage = () => {
    imageUploadInputRef.current?.click();
  };

  const onImageFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Only image files can be uploaded.');
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      window.alert('Image upload is limited to 10MB.');
      return;
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    }).catch(() => '');

    if (!dataUrl) {
      window.alert('Could not read image file.');
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({ src: dataUrl, alt: file.name })
      .updateAttributes('image', { width: '100%', float: 'none' })
      .run();
  };

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
        <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border" dir="ltr">
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

          <Separator orientation="vertical" className="h-5 mx-0.5" />

          <ToolbarButton
            onClick={onSelectImage}
            label="Upload image"
          >
            <ImagePlus className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isImageSelected && (activeImageAttrs.float ?? 'none') === 'none'}
            onClick={() => setImageFloat('none')}
            label="Break text around image"
          >
            <AlignCenter className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isImageSelected && activeImageAttrs.float === 'left'}
            onClick={() => setImageFloat('left')}
            label="Wrap text on the right of image"
          >
            <AlignLeft className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            active={isImageSelected && activeImageAttrs.float === 'right'}
            onClick={() => setImageFloat('right')}
            label="Wrap text on the left of image"
          >
            <AlignRight className="size-3.5" />
          </ToolbarButton>
          <input
            ref={imageUploadInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageFileSelected}
          />
        </div>
      )}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
        {showToolbar && isImageSelected && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" dir="ltr">
            <span className="whitespace-nowrap">Image size</span>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={activeImageWidth}
              onChange={(event) =>
                editor.chain().focus().updateAttributes('image', { width: `${event.target.value}%` }).run()
              }
              className="h-2 w-36 accent-primary"
            />
            <span className="tabular-nums">{activeImageWidth}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
