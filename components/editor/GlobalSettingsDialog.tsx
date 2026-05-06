'use client';

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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSettingsDialog({ open, onOpenChange }: Props) {
  const { sheet, updateMetadata, updateConfig } = useSheetStore();
  const { metadata, config } = sheet;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sheet Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="metadata" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
            <TabsTrigger value="page" className="flex-1">Page Setup</TabsTrigger>
            <TabsTrigger value="numbering" className="flex-1">Numbering</TabsTrigger>
          </TabsList>

          {/* ── Metadata ─────────────────────────────────────────── */}
          <TabsContent value="metadata" className="space-y-4 pt-3">
            <div className="space-y-1">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => updateMetadata({ title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={metadata.subtitle ?? ''}
                onChange={(e) => updateMetadata({ subtitle: e.target.value })}
              />
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">
              Header
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <div key={pos} className="space-y-1">
                  <Label className="capitalize text-xs">{pos}</Label>
                  <Input
                    value={metadata.header?.[pos] ?? ''}
                    onChange={(e) =>
                      updateMetadata({
                        header: { ...metadata.header, [pos]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">
              Footer
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <div key={pos} className="space-y-1">
                  <Label className="capitalize text-xs">{pos}</Label>
                  <Input
                    value={metadata.footer?.[pos] ?? ''}
                    onChange={(e) =>
                      updateMetadata({
                        footer: {
                          ...(metadata.footer ?? { showPageNumbers: true }),
                          [pos]: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="pageNumbers"
                checked={metadata.footer?.showPageNumbers ?? true}
                onCheckedChange={(checked) =>
                  updateMetadata({
                    footer: { ...(metadata.footer ?? {}), showPageNumbers: checked },
                  })
                }
              />
              <Label htmlFor="pageNumbers">Show page numbers in footer</Label>
            </div>
          </TabsContent>

          {/* ── Page Setup ───────────────────────────────────────── */}
          <TabsContent value="page" className="space-y-4 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Paper size</Label>
                <Select
                  value={config.paperSize}
                  onValueChange={(v) =>
                    updateConfig({ paperSize: v as 'A4' | 'Letter' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default font</Label>
                <Select
                  value={config.defaultStyles.fontFamily ?? 'Times New Roman'}
                  onValueChange={(v) =>
                    updateConfig({
                      defaultStyles: { ...config.defaultStyles, fontFamily: v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="David">David (Hebrew)</SelectItem>
                    <SelectItem value="Taamey Frank CLM">Taamey Frank CLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default font size</Label>
                <Select
                  value={config.defaultStyles.fontSize ?? '12pt'}
                  onValueChange={(v) =>
                    updateConfig({
                      defaultStyles: { ...config.defaultStyles, fontSize: v },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10pt">10pt</SelectItem>
                    <SelectItem value="11pt">11pt</SelectItem>
                    <SelectItem value="12pt">12pt (default)</SelectItem>
                    <SelectItem value="13pt">13pt</SelectItem>
                    <SelectItem value="14pt">14pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default alignment</Label>
                <Select
                  value={config.defaultStyles.justification ?? 'justify'}
                  onValueChange={(v) =>
                    updateConfig({
                      defaultStyles: {
                        ...config.defaultStyles,
                        justification: v as 'left' | 'center' | 'right' | 'justify',
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">
              Margins (mm)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <div key={side} className="space-y-1">
                  <Label className="capitalize text-xs">{side}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={config.margins[side]}
                    onChange={(e) =>
                      updateConfig({
                        margins: { ...config.margins, [side]: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Numbering ────────────────────────────────────────── */}
          <TabsContent value="numbering" className="space-y-4 pt-3">
            <p className="text-sm text-muted-foreground">
              Control automatic numbering displayed on the sheet.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="sectionNumbers"
                  checked={config.showSectionNumbers}
                  onCheckedChange={(checked) =>
                    updateConfig({ showSectionNumbers: checked })
                  }
                />
                <div>
                  <Label htmlFor="sectionNumbers" className="text-sm font-medium">
                    Section numbers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Prefix top-level sections with Roman numerals (I, II, III…)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="sourceNumbers"
                  checked={config.showSourceNumbers}
                  onCheckedChange={(checked) =>
                    updateConfig({ showSourceNumbers: checked })
                  }
                />
                <div>
                  <Label htmlFor="sourceNumbers" className="text-sm font-medium">
                    Source numbers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Number each source sequentially across the entire sheet
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
