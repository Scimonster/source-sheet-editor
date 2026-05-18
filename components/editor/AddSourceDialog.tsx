import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SourceElement } from '@/lib/types';
import { nextDafRef, SefariaTextResponse, SefariaVersionWithText, TextContent } from '@/lib/sefaria-types';
import gematriya from 'gematriya';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Info } from 'lucide-react';
import { newSourceElement } from '@/lib/store';

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

// support numbering for various subdivisions: pasuk (tanach), mishnah, seif (shulchan aruch), halakhah (rambam)
const subdivisionTypes = ["Pasuk", "Mishnah", "Seif", "Halakhah"];


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
  const [footnotesMode, setFootnotesMode] = useState<'in-place' | 'remove' | 'at-bottom'>('at-bottom');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

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

  const processText = (data: SefariaTextResponse | null, isHebrew: boolean, forDisplay: boolean = false): string => {
    if (!data || !data.versions.length) return "";
    const version = data.versions[0] as SefariaVersionWithText;
    let textArr = Array.isArray(version.text) ? version.text : [version.text];
    let segments: SourceSegment[] = textToSegments(data, textArr);

    const verseSectionRefIndex = Math.max(...subdivisionTypes.map(t => data.addressTypes.indexOf(t)));

    return segments.map((segment) => {
      let t = segment.text;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = t;

      const isRemove = footnotesMode === 'remove' || stripHtml;
      if (isRemove) {
        tempDiv.querySelectorAll('.footnote-marker, .footnote').forEach(el => el.remove());
      } else if (footnotesMode === 'at-bottom') {
        const notes = Array.from(tempDiv.querySelectorAll('.footnote'));
        if (notes.length > 0) {
          const bottomDiv = document.createElement('div');
          bottomDiv.className = 'footnotes-bottom';
          notes.forEach((note, index) => {
            const marker = note.previousElementSibling;
            if (marker && marker.classList.contains('footnote-marker')) {
              if (index > 0) {
                // Add some spacing between footnotes at the bottom
                const space = document.createTextNode(' ');
                bottomDiv.appendChild(space);
              }
              bottomDiv.appendChild(marker.cloneNode(true));
            }
            bottomDiv.appendChild(note.cloneNode(true));
            note.remove();
          });
          tempDiv.appendChild(bottomDiv);
        }
      }

      t = tempDiv.innerHTML;

      if (stripHtml) {
        t = t.replace(/<[^>]*>?/gm, '');
      }
      if (showVerseNumbers && segment.sectionRef && verseSectionRefIndex !== -1
        // for sources nested deeper than verses, eg commentary, only add verse number at the beginning of the commentary for each verse
        && (segment.sectionRef[verseSectionRefIndex + 1] === 1 || segment.sectionRef[verseSectionRefIndex + 1] === undefined)
      ) {
        const verseNum = Number(segment.sectionRef[verseSectionRefIndex]);
        t = `<span class="verse-md">(${isHebrew ? gematriya(verseNum, { punctuate: false }) : verseNum})</span> ${t}`;
      }
      if (isHebrew) {
        if (hebrewDisplay === 'plain') t = t.replace(/[\u0591-\u05C7]/g, "");
        else if (hebrewDisplay === 'nikud') t = t.replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C4\u05C5]/g, "");
      }
      if (forDisplay) {
        const refStr = segment.sectionRef ? segment.sectionRef.join(':') : '';
        const safeIndex = data.indexTitle.replace(/"/g, '&quot;');
        t = `<span data-segment-index="${safeIndex}" data-segment-ref="${refStr}">${t}</span>`;
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
        he: { text: processText(heData, true, false), license: { name: heData.versions[0]?.license } },
        en: { text: processText(enData, false, false), license: { name: enData.versions[0]?.license } }
      },
      displayOptions: { layout: 'side-by-side', primaryLanguage: 'he' }
    });
    onClose();
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const startNode = range.startContainer;
    const endNode = range.endContainer;

    let startElement = startNode.nodeType === Node.TEXT_NODE ? startNode.parentElement : startNode as HTMLElement;
    let endElement = endNode.nodeType === Node.TEXT_NODE ? endNode.parentElement : endNode as HTMLElement;

    // Fallback if the user selected text surrounding the spans
    if (startElement && !startElement.closest('[data-segment-ref]')) {
      if (startNode.nodeType === Node.TEXT_NODE && startNode.nextSibling) {
        startElement = startNode.nextSibling as HTMLElement;
      } else if (startElement.firstElementChild) {
        startElement = startElement.firstElementChild as HTMLElement;
      }
    }
    if (endElement && !endElement.closest('[data-segment-ref]')) {
      if (endNode.nodeType === Node.TEXT_NODE && endNode.previousSibling) {
        endElement = endNode.previousSibling as HTMLElement;
      } else if (endElement.lastElementChild) {
        endElement = endElement.lastElementChild as HTMLElement;
      }
    }

    const startSpan = startElement?.closest('[data-segment-ref]');
    const endSpan = endElement?.closest('[data-segment-ref]');

    if (startSpan && endSpan) {
      const startIndex = startSpan.getAttribute('data-segment-index');
      const startRef = startSpan.getAttribute('data-segment-ref');
      const endIndex = endSpan.getAttribute('data-segment-index');
      const endRef = endSpan.getAttribute('data-segment-ref');

      if (startIndex && endIndex && startIndex === endIndex) {
        if (startRef === endRef) {
          setRefInput(startRef ? `${startIndex} ${startRef}` : startIndex);
        } else if (startRef && endRef) {
          const startSecParts = startRef.split(':');
          const endSecParts = endRef.split(':');

          let commonPrefixIndex = -1;
          for (let i = 0; i < startSecParts.length - 1; i++) {
            if (startSecParts[i] === endSecParts[i]) {
              commonPrefixIndex = i;
            } else {
              break;
            }
          }

          if (commonPrefixIndex >= 0 && commonPrefixIndex === startSecParts.length - 2) {
            setRefInput(`${startIndex} ${startRef}-${endSecParts[endSecParts.length - 1]}`);
          } else {
            setRefInput(`${startIndex} ${startRef}-${endRef}`);
          }
        }
      } else {
        const s = startRef ? `${startIndex} ${startRef}` : startIndex;
        const e = endRef ? `${endIndex} ${endRef}` : endIndex;
        if (s && e) setRefInput(`${s}-${e}`);
      }
    } else if (startSpan) {
      const startIndex = startSpan.getAttribute('data-segment-index');
      const startRef = startSpan.getAttribute('data-segment-ref');
      if (startIndex) setRefInput(startRef ? `${startIndex} ${startRef}` : startIndex);
    } else if (endSpan) {
      const endIndex = endSpan.getAttribute('data-segment-index');
      const endRef = endSpan.getAttribute('data-segment-ref');
      if (endIndex) setRefInput(endRef ? `${endIndex} ${endRef}` : endIndex);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm text-foreground">
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
          <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              <strong>Tip:</strong> Need to quote a specific section of Gemara or a longer text without clear divisions? Search for the broader reference (e.g., <em>Brachot 2a-2b</em>), then highlight the lines you want in the results below to automatically refine your search.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-6 border-b bg-background p-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Hebrew:</span>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={hebrewDisplay}
              onValueChange={(v: any) => v && setHebrewDisplay(v)}
              className="ml-1"
            >
              <ToggleGroupItem value="plain" aria-label="Plain Aleph" className="text-lg font-serif px-3">
                א
              </ToggleGroupItem>
              <ToggleGroupItem value="nikud" aria-label="Aleph with Nikud" className="text-lg font-serif px-3">
                אָ
              </ToggleGroupItem>
              <ToggleGroupItem value="teamim" aria-label="Aleph with Teamim" className="text-lg font-serif px-3">
                אָ֑
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-foreground">
            <Checkbox checked={showVerseNumbers} onCheckedChange={(c) => setShowVerseNumbers(c === true)} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Verse Numbers</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-foreground">
            <Checkbox checked={stripHtml} onCheckedChange={(c) => setStripHtml(c === true)} />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Plain Text</span>
          </label>

          {showAdvancedOptions && (
            <>
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
                <span className="font-semibold text-foreground">Footnotes:</span>
                <Select
                  value={stripHtml ? 'remove' : footnotesMode}
                  onValueChange={(v: any) => setFootnotesMode(v)}
                  disabled={stripHtml}
                >
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-place">In-Place</SelectItem>
                    <SelectItem value="at-bottom">At Bottom</SelectItem>
                    <SelectItem value="remove">Remove</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 text-xs"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </Button>
        </div>

        {/* Content Area */}
        {errorData ? (
          <div className="p-4 text-destructive bg-destructive/10 border-b">
            {errorData}
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-hidden p-4">
            {/* English Panel */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border" onMouseUp={handleSelection}>
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
                className="flex-1 overflow-y-auto p-4 text-left leading-relaxed text-foreground prose dark:prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: processText(enData, false, true) }}
              />
            </div>

            {/* Hebrew Panel */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-lg border" onMouseUp={handleSelection}>
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
                dangerouslySetInnerHTML={{ __html: processText(heData, true, true) }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-muted/30 p-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => {
            onAdd(newSourceElement());
            onClose();
          }}>
            Add empty source
          </Button>
          <Button
            onClick={handleComplete}
            disabled={!heData || !enData || !!errorData}
          >
            Add to Page
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
