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
  const [localValue, setLocalValue] = React.useState(value);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      React.startTransition(() => {
        onChangeValue(val);
      });
    }, 300);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (value !== localValue) {
      React.startTransition(() => {
        onChangeValue(localValue);
      });
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
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
