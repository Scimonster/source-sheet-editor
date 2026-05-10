import React, { useState } from 'react';
import { SourceElement } from '@/lib/types';
import { nextDafRef, SefariaTextResponse, SefariaVersionWithText, TextContent } from '@/lib/sefaria-types';
import gematriya from 'gematriya';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type SourceSegment = {
  text: string;
  sectionRef?: (string | number)[];
}

interface AddSourceDialogProps {
  onAdd: (source: SourceElement) => void;
  onClose: () => void;
}

const getTextDepth = (text: TextContent): number => {
  if (!Array.isArray(text)) return 0;
  const first = text[0];
  if (Array.isArray(first)) return 1 + getTextDepth(first);
  return 0;
}


const textToSegments = (data: SefariaTextResponse, textArr: TextContent, depthOffset: number = 0, startRef?: (string | number)[]): SourceSegment[] => {
  const version = data.versions[0];
  textArr = Array.isArray(textArr) ? textArr : [textArr];

  const resolvedTextDepth = getTextDepth(version.text);
  const currentDepth = data.textDepth - resolvedTextDepth + depthOffset - 1;
  // how many levels of source text, minus the number of levels of text we actually have in this query, plus the depth offset, minus 1 because array is 0-indexed
  const refType = data.addressTypes[currentDepth];
  if (!startRef) startRef = data.sections;

  // compute the next ref in the sequence, depending on the ref type
  const nextRef = (refPart: number | string = 1, offset: number = 1) => refType === 'Talmud' ? nextDafRef(refPart.toString(), 'next', offset) : Number(refPart) + offset;

  return textArr.flatMap((segment, index) => {
    if (Array.isArray(segment)) {
      // increment the current ref part by 1, reset further parts to 1
      return textToSegments(data, segment, depthOffset + 1, [...startRef.slice(0, currentDepth), nextRef(startRef[currentDepth], index), ...(index === 0 && startRef.length > currentDepth + 1 ? startRef.slice(currentDepth + 1) : new Array(data.textDepth - currentDepth - 1).fill(1))]);
    }
    return { text: segment, sectionRef: [...startRef.slice(0, currentDepth), nextRef(startRef[currentDepth], index)] };
  });
}

export const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ onAdd, onClose }) => {
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [heData, setHeData] = useState<SefariaTextResponse | null>(null);
  const [enData, setEnData] = useState<SefariaTextResponse | null>(null);
  const [errorData, setErrorData] = useState<string | null>(null);

  const [selectedHeVersion, setSelectedHeVersion] = useState<string | null>(null);
  const [selectedEnVersion, setSelectedEnVersion] = useState<string | null>(null);

  const [layoutMode, setLayoutMode] = useState<'compact' | 'line-by-line'>('compact');
  const [showVerseNumbers, setShowVerseNumbers] = useState(true);
  const [hebrewDisplay, setHebrewDisplay] = useState<'plain' | 'nikud' | 'teamim'>('teamim');
  const [stripHtml, setStripHtml] = useState(false);

  const fetchSource = async (ref: string, lang: 'he' | 'en', versionTitle?: string) => {
    setLoading(true);
    try {
      setErrorData(null);
      let url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?version=${lang === 'he' ? 'hebrew' : 'english'}`;
      if (versionTitle) url += `|${encodeURIComponent(versionTitle)}`;

      const res = await fetch(url);
      const data: SefariaTextResponse = await res.json();
      if (!res.ok) {
        setErrorData((data as any).error || res.statusText);
        return;
      }

      if (lang === 'he') {
        setHeData(data);
        if (!versionTitle) setSelectedHeVersion(data.versions.find(version => version.language === 'he')?.versionTitle || null);
      } else {
        setEnData(data);
        if (!versionTitle) setSelectedEnVersion(data.versions.find(version => version.language === 'en')?.versionTitle || null);
      }
    } catch (err: any) {
      console.error("Sefaria Fetch Error:", err);
      setErrorData(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processText = (data: SefariaTextResponse | null, isHebrew: boolean): string => {
    if (!data || !data.versions.length) return "";
    const version = data.versions[0] as SefariaVersionWithText;
    let textArr = Array.isArray(version.text) ? version.text : [version.text];
    let segments: SourceSegment[] = textToSegments(data, textArr);
    const pasukSectionRefIndex = data.addressTypes.indexOf("Pasuk");

    return segments.map((segment) => {
      let t = segment.text;
      if (stripHtml) t = t
        .replace(/<sup class="footnote-marker">.*?<\/sup><i class="footnote">.*?<\/i>/g, '') // remove footnotes
        .replace(/<[^>]*>?/gm, ''); // remove html tags
      if (showVerseNumbers && segment.sectionRef && pasukSectionRefIndex !== -1
        // for sources nested deeper than verses, eg commentary, only add verse number at the beginning of the commentary for each verse
        && (segment.sectionRef[pasukSectionRefIndex + 1] === 1 || segment.sectionRef[pasukSectionRefIndex + 1] === undefined)
      ) {
        const verseNum = Number(segment.sectionRef[pasukSectionRefIndex]);
        t = `<span class="verse-md">(${isHebrew ? gematriya(verseNum, { punctuate: false }) : verseNum})</span> ${t}`;
      }
      if (isHebrew) {
        if (hebrewDisplay === 'plain') t = t.replace(/[\u0591-\u05C7]/g, "");
        else if (hebrewDisplay === 'nikud') t = t.replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C4\u05C5]/g, "");
      }
      return t;
    }).map((segment) => layoutMode === 'compact' ? segment : `<p>${segment}</p>`).join(' ');
  };

  const handleComplete = () => {
    if (!heData || !enData) return;
    onAdd({
      id: crypto.randomUUID(),
      type: 'source',
      ref: { en: enData.ref, he: heData.heRef, link: `https://www.sefaria.org/${enData.ref}` },
      content: {
        he: { text: processText(heData, true), license: { name: heData.versions[0].license } },
        en: { text: processText(enData, false), license: { name: enData.versions[0].license } }
      },
      displayOptions: { layout: 'side-by-side', primaryLanguage: 'he' }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-background border shadow-2xl">

        {/* Header */}
        <div className="border-b bg-muted/30 p-4">
          <h2 className="mb-4 text-xl font-bold">Add Source</h2>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); fetchSource(refInput, 'he'); fetchSource(refInput, 'en'); }}>
            <Input
              className="flex-1"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g., Esther 1:1-5, Brachot 31b, Rashi on Bereshit 1:1, etc."
            />
            <Button
              type="submit"
              disabled={loading}
              className="px-6"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-6 border-b bg-background p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Layout:</span>
            <Select value={layoutMode} onValueChange={(v: any) => setLayoutMode(v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line-by-line">Line by Line</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Hebrew:</span>
            <Select value={hebrewDisplay} onValueChange={(v: any) => setHebrewDisplay(v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamim">Teamim</SelectItem>
                <SelectItem value="nikud">Nikud Only</SelectItem>
                <SelectItem value="plain">Plain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-foreground">
            <Checkbox checked={showVerseNumbers} onCheckedChange={(c) => setShowVerseNumbers(c === true)} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Verse Numbers</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-foreground">
            <Checkbox checked={stripHtml} onCheckedChange={(c) => setStripHtml(c === true)} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Plain Text</span>
          </label>
        </div>

        {/* Content Area */}
        {errorData ? (
          <div className="p-4 text-destructive bg-destructive/10 border-b">
            {errorData}
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-hidden p-4">
            {/* English Panel */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
              <div className="bg-muted/30 p-2 text-xs">
                <label className="block font-bold text-muted-foreground uppercase mb-1">English Version</label>
                <Select
                  value={selectedEnVersion || ''}
                  onValueChange={(v) => { setSelectedEnVersion(v); fetchSource(refInput, 'en', v); }}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {enData?.available_versions.filter(v => v.language === 'en').map(v => (
                      <SelectItem key={v.versionTitle} value={v.versionTitle}>{v.versionTitle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 text-left leading-relaxed text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: processText(enData, false) }}
              />
            </div>

            {/* Hebrew Panel */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
              <div className="bg-muted/30 p-2 text-xs" dir="rtl">
                <label className="block font-bold text-muted-foreground uppercase mb-1">גרסה</label>
                <Select
                  value={selectedHeVersion || ''}
                  onValueChange={(v) => { setSelectedHeVersion(v); fetchSource(refInput, 'he', v); }}
                >
                  <SelectTrigger className="h-8 text-xs bg-background" dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {heData?.available_versions.filter(v => v.language === 'he').map(v => (
                      <SelectItem key={v.versionTitle} value={v.versionTitle}>{v.versionTitleInHebrew || v.versionTitle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                dir="rtl"
                className="flex-1 overflow-y-auto p-4 text-right font-serif text-xl leading-loose text-foreground"
                dangerouslySetInnerHTML={{ __html: processText(heData, true) }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-muted/30 p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!heData || !enData || !!errorData}
          >
            Add to Page
          </Button>
        </div>
      </div>
    </div>
  );
};
