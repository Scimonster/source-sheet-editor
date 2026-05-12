'use client';

import { EditorApp } from '@/components/editor/EditorApp';
import { useParams } from 'next/navigation';

export default function SheetPage() {
  const params = useParams();
  const id = params.id as string;

  return <EditorApp sheetId={id} />;
}
