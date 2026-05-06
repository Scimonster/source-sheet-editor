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
                  value={displayOptions.layout}
                  onValueChange={(v) =>
                    update({
                      displayOptions: {
                        ...displayOptions,
                        layout: v as SourceElement['displayOptions']['layout'],
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="side-by-side">Side by side</SelectItem>
                    <SelectItem value="stacked">Stacked</SelectItem>
                    <SelectItem value="single">Single language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Primary language</Label>
                <Select
                  value={displayOptions.primaryLanguage}
                  onValueChange={(v) =>
                    update({
                      displayOptions: {
                        ...displayOptions,
                        primaryLanguage: v as 'en' | 'he',
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">Hebrew</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {displayOptions.layout === 'side-by-side' && (
                <div className="space-y-1 col-span-2">
                  <Label>Column ratio (primary language width)</Label>
                  <Select
                    value={displayOptions.columnRatio ?? '50%'}
                    onValueChange={(v) =>
                      update({
                        displayOptions: { ...displayOptions, columnRatio: v },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="33%">33% / 67%</SelectItem>
                      <SelectItem value="50%">50% / 50%</SelectItem>
                      <SelectItem value="67%">67% / 33%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
