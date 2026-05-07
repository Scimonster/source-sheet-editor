'use client';

import { TextElement, ElementStyles } from '@/lib/types';
import { useSheetStore } from '@/lib/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Props {
  text: TextElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TextConfigDialog({ text, open, onOpenChange }: Props) {
  const { updateElement } = useSheetStore();

  const update = (styles: Partial<TextElement['styles']>) =>
    updateElement(text.id, { styles: { ...text.styles, ...styles } });

  const classesStr = (text.styles?.customClasses ?? []).join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Text Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Font</Label>
            <Select
              value={text.styles?.fontFamily ?? 'inherit'}
              onValueChange={(v) => update({ fontFamily: v === 'inherit' ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Inherit from sheet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Inherit</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="David">David</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Font size</Label>
            <Select
              value={text.styles?.fontSize ?? 'inherit'}
              onValueChange={(v) => update({ fontSize: v === 'inherit' ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Inherit from sheet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Inherit</SelectItem>
                <SelectItem value="10pt">10pt</SelectItem>
                <SelectItem value="11pt">11pt</SelectItem>
                <SelectItem value="12pt">12pt</SelectItem>
                <SelectItem value="14pt">14pt</SelectItem>
                <SelectItem value="16pt">16pt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Alignment</Label>
            <Select
              value={text.styles?.justification ?? 'inherit'}
              onValueChange={(v) =>
                update({
                  justification:
                    v === 'inherit'
                      ? undefined
                      : (v as ElementStyles['justification']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Inherit from sheet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Inherit</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justify">Justify</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label>Custom classes</Label>
            <Input
              value={classesStr}
              placeholder="e.g. hebrew, instruction"
              onChange={(e) => {
                const classes = e.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean);
                update({ customClasses: classes.length ? classes : undefined });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated class names. Styles from matching global class defaults will be applied.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
