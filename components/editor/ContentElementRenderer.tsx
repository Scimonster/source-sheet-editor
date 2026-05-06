'use client';

import { useState } from 'react';
import { ContentElement, SourceElement, TextElement, DirectionElement } from '@/lib/types';
import { SourceRenderer } from './SourceRenderer';
import { TextRenderer } from './TextRenderer';
import { DirectionRenderer } from './DirectionRenderer';
import { ElementControls } from './ElementControls';
import { SourceConfigDialog } from './SourceConfigDialog';
import { TextConfigDialog } from './TextConfigDialog';
import { DirectionConfigDialog } from './DirectionConfigDialog';

interface Props {
  element: ContentElement;
}

export function ContentElementRenderer({ element }: Props) {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <ElementControls
      node={element}
      onConfigure={() => setConfigOpen(true)}
      className="mb-3"
    >
      {element.type === 'source' && (
        <>
          <SourceRenderer source={element as SourceElement} />
          <SourceConfigDialog
            source={element as SourceElement}
            open={configOpen}
            onOpenChange={setConfigOpen}
          />
        </>
      )}
      {element.type === 'text' && (
        <>
          <TextRenderer text={element as TextElement} />
          <TextConfigDialog
            text={element as TextElement}
            open={configOpen}
            onOpenChange={setConfigOpen}
          />
        </>
      )}
      {element.type === 'direction' && (
        <>
          <DirectionRenderer direction={element as DirectionElement} />
          <DirectionConfigDialog
            direction={element as DirectionElement}
            open={configOpen}
            onOpenChange={setConfigOpen}
          />
        </>
      )}
    </ElementControls>
  );
}
