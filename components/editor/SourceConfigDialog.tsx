'use client';

import { SourceElement } from '@/lib/types';
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
import { RichTextEditor } from './RichTextEditor';

interface Props {
  source: SourceElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SourceConfigDialog({ source, open, onOpenChange }: Props) {
  const { updateElement } = useSheetStore();
  const { ref, displayOptions, directionNote } = source;

  const update = (partial: Partial<SourceElement>) =>
    updateElement(source.id, partial);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Source Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Reference */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Reference</h3>
            <div className="grid gap-2">
              <div className="space-y-1">
                <Label>Hebrew reference</Label>
                <Input
                  value={ref.he}
                  dir="rtl"
                  onChange={(e) => update({ ref: { ...ref, he: e.target.value } })}
                />
              </div>
              <div className="space-y-1">
                <Label>English reference</Label>
                <Input
                  value={ref.en}
                  onChange={(e) => update({ ref: { ...ref, en: e.target.value } })}
                />
              </div>
              <div className="space-y-1">
                <Label>Link (optional)</Label>
                <Input
                  value={ref.link ?? ''}
                  placeholder="https://www.sefaria.org/…"
                  onChange={(e) => update({ ref: { ...ref, link: e.target.value } })}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Display options */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Display</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Layout</Label>
                <Select
                  value={displayOptions.layout ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      displayOptions: {
                        ...displayOptions,
                        layout: v === 'inherit' ? undefined : (v as SourceElement['displayOptions']['layout']),
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="side-by-side">Side by side</SelectItem>
                    <SelectItem value="stacked">Stacked</SelectItem>
                    <SelectItem value="single">Single language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Primary language</Label>
                <Select
                  value={displayOptions.primaryLanguage ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      displayOptions: {
                        ...displayOptions,
                        primaryLanguage: v === 'inherit' ? undefined : (v as 'en' | 'he'),
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="he">Hebrew</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(displayOptions.layout === 'side-by-side' || displayOptions.layout === undefined) && (
                <div className="space-y-1 col-span-2">
                  <Label>Column ratio (primary language width)</Label>
                  <Select
                    value={displayOptions.columnRatio ?? 'inherit'}
                    onValueChange={(v) =>
                      update({
                        displayOptions: { ...displayOptions, columnRatio: v === 'inherit' ? undefined : v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Inherit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">Inherit</SelectItem>
                      <SelectItem value="33%">33% / 67%</SelectItem>
                      <SelectItem value="40%">40% / 60%</SelectItem>
                      <SelectItem value="50%">50% / 50%</SelectItem>
                      <SelectItem value="60%">60% / 40%</SelectItem>
                      <SelectItem value="67%">67% / 33%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Title Display */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Title Display</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Languages</Label>
                <Select
                  value={source.titleDisplay?.languages ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      titleDisplay: {
                        ...(source.titleDisplay ?? {}),
                        languages: v === 'inherit' ? undefined : (v as 'both' | 'he' | 'en'),
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="he">Hebrew only</SelectItem>
                    <SelectItem value="en">English only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Alignment</Label>
                <Select
                  value={source.titleDisplay?.justification ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      titleDisplay: {
                        ...(source.titleDisplay ?? { languages: 'both' }),
                        justification: v === 'inherit' ? undefined : (v as 'left' | 'center' | 'right'),
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Font</Label>
                <Select
                  value={source.titleDisplay?.fontFamily ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      titleDisplay: {
                        ...(source.titleDisplay ?? { languages: 'both' }),
                        fontFamily: v === 'inherit' ? undefined : v,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
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
                  value={source.titleDisplay?.fontSize ?? 'inherit'}
                  onValueChange={(v) =>
                    update({
                      titleDisplay: {
                        ...(source.titleDisplay ?? { languages: 'both' }),
                        fontSize: v === 'inherit' ? undefined : v,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit</SelectItem>
                    <SelectItem value="10pt">10pt</SelectItem>
                    <SelectItem value="12pt">12pt</SelectItem>
                    <SelectItem value="14pt">14pt</SelectItem>
                    <SelectItem value="16pt">16pt</SelectItem>
                    <SelectItem value="18pt">18pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          {/* Direction note */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Direction note (leader only)</h3>
            <RichTextEditor
              value={directionNote ?? ''}
              onChange={(html) => update({ directionNote: html })}
              placeholder="Add a note for the chaburah leader…"
              minHeight="3rem"
            />
          </section>

          <Separator />

          {/* Custom classes */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Custom classes</h3>
            <Input
              value={(source.styles?.customClasses ?? []).join(', ')}
              placeholder="e.g. featured, highlight"
              onChange={(e) => {
                const classes = e.target.value
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean);
                update({
                  styles: {
                    ...source.styles,
                    customClasses: classes.length ? classes : undefined,
                  },
                });
              }}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated class names. Styles from matching global class defaults will be applied.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
