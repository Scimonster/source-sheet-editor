'use client';

import { Section, ElementStyles, SectionStyleOverrides } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  section: Section;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FONT_OPTIONS = [
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'David', label: 'David' },
  { value: 'Taamey Frank CLM', label: 'Taamey Frank CLM' },
];

const SIZE_OPTIONS = ['10pt', '11pt', '12pt', '13pt', '14pt', '16pt', '18pt'];

const OVERRIDE_KEYS = [
  { key: 'source', label: 'Sources' },
  { key: 'text', label: 'Text elements' },
  { key: 'hebrew', label: 'Hebrew text' },
  { key: 'english', label: 'English text' },
  { key: 'sectionHeader', label: 'Section headers' },
  { key: 'sourceTitle', label: 'Source titles' },
] as const;

function StyleOverrideRow({
  label,
  styles,
  onChange,
}: {
  label: string;
  styles: Partial<ElementStyles> | undefined;
  onChange: (styles: Partial<ElementStyles>) => void;
}) {
  const update = (partial: Partial<ElementStyles>) => {
    onChange({ ...styles, ...partial });
  };

  return (
    <div className="space-y-1.5 py-2 border-b border-border/30 last:border-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <Select
          value={styles?.fontFamily ?? 'inherit'}
          onValueChange={(v) => update({ fontFamily: v === 'inherit' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inherit">Inherit</SelectItem>
            {FONT_OPTIONS.map((f) => (
              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={styles?.fontSize ?? 'inherit'}
          onValueChange={(v) => update({ fontSize: v === 'inherit' ? undefined : v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inherit">Inherit</SelectItem>
            {SIZE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={styles?.justification ?? 'inherit'}
          onValueChange={(v) =>
            update({
              justification: v === 'inherit' ? undefined : (v as ElementStyles['justification']),
            })
          }
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Align" />
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
  );
}

export function SectionConfigDialog({ section, open, onOpenChange }: Props) {
  const { updateElement } = useSheetStore();

  const handleOverrideChange = (key: string, styles: Partial<ElementStyles>) => {
    const current = section.styleOverrides ?? {};
    // Clean out fully-undefined styles
    const cleaned: Partial<ElementStyles> = {};
    if (styles.fontFamily) cleaned.fontFamily = styles.fontFamily;
    if (styles.fontSize) cleaned.fontSize = styles.fontSize;
    if (styles.justification) cleaned.justification = styles.justification;
    if (styles.customClasses?.length) cleaned.customClasses = styles.customClasses;

    const newOverrides: SectionStyleOverrides = { ...current, [key]: cleaned };
    updateElement(section.id, { styleOverrides: newOverrides });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Section Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-1">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="overrides" className="flex-1">Style Overrides</TabsTrigger>
            <TabsTrigger value="sources" className="flex-1">Source Defaults</TabsTrigger>
          </TabsList>

          {/* ── General ──────────────────────────────────────────── */}
          <TabsContent value="general" className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Section title</Label>
              <Input
                value={section.title}
                onChange={(e) => updateElement(section.id, { title: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Show border around section</Label>
              <Select
                value={section.showBorder.toString()}
                onValueChange={(v) =>
                  updateElement(section.id, {
                    showBorder: v === 'inherit' ? 'inherit' : v === 'true',
                  })
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Inherit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Inherit from sheet</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* ── Style Overrides ───────────────────────────────────── */}
          <TabsContent value="overrides" className="pt-2">
            <p className="text-xs text-muted-foreground mb-2">
              Override styles for elements within this section. &ldquo;Inherit&rdquo; uses the global/class default.
            </p>
            {OVERRIDE_KEYS.map(({ key, label }) => (
              <StyleOverrideRow
                key={key}
                label={label}
                styles={section.styleOverrides?.[key]}
                onChange={(styles) => handleOverrideChange(key, styles)}
              />
            ))}
          </TabsContent>

          {/* ── Source Defaults ───────────────────────────────────── */}
          <TabsContent value="sources" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Default display settings for sources in this section. Individual sources can still override these.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Layout</Label>
                <Select
                  value={section.sourceDefaults?.layout ?? 'inherit'}
                  onValueChange={(v) =>
                    updateElement(section.id, {
                      sourceDefaults: {
                        ...section.sourceDefaults,
                        layout: v === 'inherit' ? undefined : (v as 'side-by-side' | 'stacked' | 'single'),
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit from sheet</SelectItem>
                    <SelectItem value="side-by-side">Side by side</SelectItem>
                    <SelectItem value="stacked">Stacked</SelectItem>
                    <SelectItem value="single">Single language</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Primary language</Label>
                <Select
                  value={section.sourceDefaults?.primaryLanguage ?? 'inherit'}
                  onValueChange={(v) =>
                    updateElement(section.id, {
                      sourceDefaults: {
                        ...section.sourceDefaults,
                        primaryLanguage: v === 'inherit' ? undefined : (v as 'en' | 'he'),
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Inherit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inherit">Inherit from sheet</SelectItem>
                    <SelectItem value="he">Hebrew</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Title Display
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Languages</Label>
                <Select
                  value={section.titleDefaults?.languages ?? 'inherit'}
                  onValueChange={(v) =>
                    updateElement(section.id, {
                      titleDefaults: {
                        ...section.titleDefaults,
                        languages: v === 'inherit' ? undefined : (v as 'both' | 'he' | 'en'),
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
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
                <Label className="text-xs">Alignment</Label>
                <Select
                  value={section.titleDefaults?.justification ?? 'inherit'}
                  onValueChange={(v) =>
                    updateElement(section.id, {
                      titleDefaults: {
                        ...section.titleDefaults,
                        justification: v === 'inherit' ? undefined : (v as 'left' | 'center' | 'right'),
                      },
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
