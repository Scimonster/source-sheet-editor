'use client';

import { Section } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface Props {
  section: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionConfigDialog({ section, open, onOpenChange }: Props) {
  const { updateElement } = useSheetStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Section Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Section title</Label>
            <Input
              value={section.title}
              onChange={(e) => updateElement(section.id, { title: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="showBorder"
              checked={section.showBorder}
              onCheckedChange={(checked) =>
                updateElement(section.id, { showBorder: checked })
              }
            />
            <Label htmlFor="showBorder">Show border around section</Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
