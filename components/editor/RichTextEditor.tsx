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
import { useEffect, useRef, useState } from 'react';

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_READ_ERROR = 'The image file could not be read.';
const IMAGE_SIZE_LIMIT_LABEL = '10MB';

const normalizeImageFloat = (value: string | null | undefined): 'left' | 'right' | 'none' => {
  if (value === 'left' || value === 'right') return value;
  return 'none';
};

const normalizeImageWidth = (value: string | null | undefined): string => {
  if (!value) return '100%';
  const match = value.match(/\d{1,3}/);
  if (!match) return '100%';
  const parsed = Number.parseInt(match[0], 10);
  if (!Number.isFinite(parsed)) return '100%';
  return `${Math.min(Math.max(parsed, 10), 100)}%`;
};

const RichImage = Image.extend({
  addAttributes() {
    const parentAttributes = this.parent?.() ?? {};
    return {
      ...parentAttributes,
      width: {
        default: '100%',
        parseHTML: (element) => {
          const attrWidth = element.getAttribute('data-width');
          if (attrWidth) return normalizeImageWidth(attrWidth);
          const styleWidth = element.style.width?.trim();
          return styleWidth?.endsWith('%') ? normalizeImageWidth(styleWidth) : '100%';
        },
      },
      float: {
        default: 'none',
        parseHTML: (element) => normalizeImageFloat(element.getAttribute('data-float') ?? element.style.float),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { width, float, style, ...rest } = HTMLAttributes;
    const safeWidth = normalizeImageWidth(typeof width === 'string' ? width : undefined);
    const safeFloat = normalizeImageFloat(typeof float === 'string' ? float : undefined);
    const existingStyle = typeof style === 'string' ? style : '';

    const mergedStyles: string[] = ['max-width: 100%', 'height: auto'];
    mergedStyles.push(`width: ${safeWidth}`);

    if (safeFloat === 'left') {
      mergedStyles.push('float: left', 'margin: 0.25rem 1rem 0.5rem 0');
    } else if (safeFloat === 'right') {
      mergedStyles.push('float: right', 'margin: 0.25rem 0 0.5rem 1rem');
    } else {
      mergedStyles.push('display: block', 'margin: 0.5rem auto');
    }

    if (existingStyle) {
      mergedStyles.push(existingStyle);
    }

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        'data-width': safeWidth,
        'data-float': safeFloat,
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
  const [uploadError, setUploadError] = useState<string | null>(null);

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
  const parsedWidth = Number.parseInt(normalizeImageWidth(activeImageAttrs?.width), 10);
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
      setUploadError('Only image files can be uploaded.');
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setUploadError(`Image size exceeds the ${IMAGE_SIZE_LIMIT_LABEL} upload limit.`);
      return;
    }

    setUploadError(null);

    let dataUrl = '';
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(IMAGE_READ_ERROR));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : IMAGE_READ_ERROR;
      setUploadError(message);
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
            label="Center image (no text wrap)"
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
        {showToolbar && uploadError && (
          <p className="mt-2 text-xs text-destructive" dir="ltr">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
}
