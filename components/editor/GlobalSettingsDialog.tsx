'use client';

import { startTransition } from 'react';
import { useSheetStore } from '@/lib/store';
import { ElementStyles } from '@/lib/types';
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
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Shared set of font options */
const FONT_OPTIONS = [
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'David', label: 'David (Hebrew)' },
  { value: 'Taamey Frank CLM', label: 'Taamey Frank CLM' },
];

const SIZE_OPTIONS = ['10pt', '11pt', '12pt', '13pt', '14pt', '16pt', '18pt'];

const DEFAULT_CLASS_NAMES = [
  { key: 'sectionHeader', label: 'Section Header' },
  { key: 'source', label: 'Source' },
  { key: 'text', label: 'Text' },
  { key: 'hebrew', label: 'Hebrew' },
  { key: 'english', label: 'English' },
  { key: 'sourceTitle', label: 'Source Title' },
] as const;

/** Reusable style editor row for a single class */
function ClassStyleRow({
  label,
  classKey,
  styles,
  onChange,
}: {
  label: string;
  classKey: string;
  styles: Partial<ElementStyles> | undefined;
  onChange: (classKey: string, styles: Partial<ElementStyles>) => void;
}) {
  const update = (partial: Partial<ElementStyles>) => {
    onChange(classKey, { ...styles, ...partial });
  };

  return (
    <div className="space-y-2 py-3 border-b border-border/40 last:border-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Font</Label>
          <Select
            value={styles?.fontFamily ?? 'inherit'}
            onValueChange={(v) => update({ fontFamily: v === 'inherit' ? undefined : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Inherit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit</SelectItem>
              {FONT_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Size</Label>
          <Select
            value={styles?.fontSize ?? 'inherit'}
            onValueChange={(v) => update({ fontSize: v === 'inherit' ? undefined : v })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Inherit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Inherit</SelectItem>
              {SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Align</Label>
          <Select
            value={styles?.justification ?? 'inherit'}
            onValueChange={(v) =>
              update({
                justification: v === 'inherit' ? undefined : (v as ElementStyles['justification']),
              })
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Inherit" />
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
      </div>
    </div>
  );
}

export function GlobalSettingsDialog({ open, onOpenChange }: Props) {
  const { sheet, updateMetadata: storeUpdateMetadata, updateConfig: storeUpdateConfig } = useSheetStore();
  const updateMetadata = (partial: any) => startTransition(() => storeUpdateMetadata(partial));
  const updateConfig = (partial: any) => startTransition(() => storeUpdateConfig(partial));
  const { metadata, config } = sheet;

  const handleClassChange = (classKey: string, styles: Partial<ElementStyles>) => {
    const current = config.classDefaults ?? {};
    // Remove keys that are undefined so they fall back to inherit
    const cleaned: ElementStyles = {};
    if (styles.fontFamily) cleaned.fontFamily = styles.fontFamily;
    if (styles.fontSize) cleaned.fontSize = styles.fontSize;
    if (styles.justification) cleaned.justification = styles.justification;
    if (styles.customClasses?.length) cleaned.customClasses = styles.customClasses;

    updateConfig({
      classDefaults: {
        ...current,
        [classKey]: cleaned,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sheet Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="metadata" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="metadata" className="flex-1">Metadata</TabsTrigger>
            <TabsTrigger value="page" className="flex-1">Page Setup</TabsTrigger>
            <TabsTrigger value="classes" className="flex-1">Class Styles</TabsTrigger>
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
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
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
                    {SIZE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}{s === '12pt' ? ' (default)' : ''}</SelectItem>
                    ))}
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

            <Separator />

            {/* Section Defaults */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Default Section Settings
            </p>
            <div className="flex items-center gap-2">
              <Switch
                id="globalShowBorder"
                checked={config.sectionDefaults?.showBorder ?? false}
                onCheckedChange={(checked) =>
                  updateConfig({
                    sectionDefaults: { ...config.sectionDefaults, showBorder: checked },
                  })
                }
              />
              <Label htmlFor="globalShowBorder">Show border around sections</Label>
            </div>

            <Separator />

            {/* Source Defaults */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Default Source Display
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Layout</Label>
                <Select
                  value={config.sourceDefaults?.layout ?? 'side-by-side'}
                  onValueChange={(v) =>
                    updateConfig({
                      sourceDefaults: {
                        ...config.sourceDefaults,
                        layout: v as 'side-by-side' | 'stacked' | 'single',
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <Label className="text-xs">Primary language</Label>
                <Select
                  value={config.sourceDefaults?.primaryLanguage ?? 'he'}
                  onValueChange={(v) =>
                    updateConfig({
                      sourceDefaults: {
                        ...config.sourceDefaults,
                        primaryLanguage: v as 'en' | 'he',
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he">Hebrew</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(config.sourceDefaults?.layout === 'side-by-side' || config.sourceDefaults?.layout === undefined) && (
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs">Column ratio (primary language width)</Label>
                  <Select
                    value={config.sourceDefaults?.columnRatio ?? '40%'}
                    onValueChange={(v) =>
                      updateConfig({
                        sourceDefaults: {
                          ...config.sourceDefaults,
                          columnRatio: v,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
            <Separator />

            {/* Title Defaults */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Default Title Display
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Languages</Label>
                <Select
                  value={config.titleDefaults?.languages ?? 'both'}
                  onValueChange={(v) =>
                    updateConfig({
                      titleDefaults: {
                        ...config.titleDefaults,
                        languages: v as 'both' | 'he' | 'en',
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="he">Hebrew only</SelectItem>
                    <SelectItem value="en">English only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Alignment</Label>
                <Select
                  value={config.titleDefaults?.justification ?? 'left'}
                  onValueChange={(v) =>
                    updateConfig({
                      titleDefaults: {
                        ...config.titleDefaults,
                        justification: v as 'left' | 'center' | 'right',
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* ── Class Styles ──────────────────────────────────────── */}
          <TabsContent value="classes" className="pt-3">
            <p className="text-sm text-muted-foreground mb-2">
              Set default styles per element class. These override the sheet defaults and can be further overridden at the section and element level.
            </p>
            {DEFAULT_CLASS_NAMES.map(({ key, label }) => (
              <ClassStyleRow
                key={key}
                label={label}
                classKey={key}
                styles={config.classDefaults?.[key]}
                onChange={handleClassChange}
              />
            ))}
          </TabsContent>

          {/* ── Numbering ────────────────────────────────────────── */}
          <TabsContent value="numbering" className="space-y-6 pt-3">
            <p className="text-sm text-muted-foreground">
              Control automatic numbering displayed on the sheet.
            </p>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sectionNumbering" className="text-sm font-medium">
                  Section numbering
                </Label>
                <Select
                  value={config.sectionNumbering}
                  onValueChange={(v) =>
                    updateConfig({ sectionNumbering: v as any })
                  }
                >
                  <SelectTrigger id="sectionNumbering">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="arabic">Arabic (1, 2, 3)</SelectItem>
                    <SelectItem value="alpha">Alpha (A, B, C)</SelectItem>
                    <SelectItem value="roman">Roman Numerals (I, II, III)</SelectItem>
                    <SelectItem value="gematriya">Gematriya (א, ב, ג)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Format for numbering sections.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceNumbering" className="text-sm font-medium">
                  Source numbering
                </Label>
                <Select
                  value={config.sourceNumbering}
                  onValueChange={(v) =>
                    updateConfig({ sourceNumbering: v as any })
                  }
                >
                  <SelectTrigger id="sourceNumbering">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="arabic">Arabic (1, 2, 3)</SelectItem>
                    <SelectItem value="alpha">Alpha (A, B, C)</SelectItem>
                    <SelectItem value="roman">Roman Numerals (I, II, III)</SelectItem>
                    <SelectItem value="gematriya">Gematriya (א, ב, ג)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Format for numbering sources sequentially.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
