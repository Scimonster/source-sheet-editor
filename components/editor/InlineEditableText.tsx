'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InlineEditableTextProps extends React.ComponentProps<'textarea'> {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InlineEditableText({
  value,
  onChangeValue,
  placeholder,
  className,
  ...props
}: InlineEditableTextProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChangeValue(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={1}
      className={cn(
        'w-full bg-transparent border-none outline-none resize-none overflow-hidden p-0 m-0 focus:ring-0 placeholder:opacity-50 text-inherit font-inherit leading-inherit text-center',
        'field-sizing-content',
        className
      )}
      {...props}
    />
  );
}
