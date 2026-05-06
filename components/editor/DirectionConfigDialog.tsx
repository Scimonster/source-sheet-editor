'use client';

import { DirectionElement } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Props {
  direction: DirectionElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DirectionConfigDialog({ direction, open, onOpenChange }: Props) {
  const { updateElement } = useSheetStore();

  const toggle = (key: keyof DirectionElement['displayMode']) => {
    updateElement(direction.id, {
      displayMode: {
        ...direction.displayMode,
        [key]: !direction.displayMode[key],
      },
    });
  };

  const dm = direction.displayMode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Direction Note Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-xs text-muted-foreground">
            Direction notes only appear in Edit mode and Leader View. Toggle display options below.
          </p>
          {(
            [
              { key: 'italics', label: 'Italics' },
              { key: 'indent', label: 'Indent' },
              { key: 'border', label: 'Left border' },
              { key: 'brackets', label: 'Wrap in brackets' },
              { key: 'small', label: 'Small text' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Switch
                id={`dm-${key}`}
                checked={dm[key]}
                onCheckedChange={() => toggle(key)}
              />
              <Label htmlFor={`dm-${key}`}>{label}</Label>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
