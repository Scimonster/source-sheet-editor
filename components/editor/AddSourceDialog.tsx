import React, { useState, useEffect, useMemo } from 'react';
import {
  SourceElement
} from '@/lib/types';
import { SefariaTextResponse, SefariaVersion, SefariaVersionWithText } from '@/lib/sefaria-types';

interface AddSourceDialogProps {
  onAdd: (source: SourceElement) => void;
  onClose: () => void;
}

export const AddSourceDialog: React.FC<AddSourceDialogProps> = ({ onAdd, onClose }) => {
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [heData, setHeData] = useState<SefariaTextResponse | null>(null);
  const [enData, setEnData] = useState<SefariaTextResponse | null>(null);
  const [errorData, setErrorData] = useState<string | null>(null);
  console.log({heData, enData, errorData});

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
        console.log({ data });
        setErrorData((data as any).error || res.statusText);
        return;
      }

      if (lang === 'he') {
        setHeData(data);
        if (!versionTitle) setSelectedHeVersion(data.versions.find(version => version.language==='he')?.versionTitle || null);
      } else {
        setEnData(data);
        if (!versionTitle) setSelectedEnVersion(data.versions.find(version => version.language==='en')?.versionTitle || null);
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
    let textArr = Array.isArray(version.text) ? version.text.flat() : [version.text];

    return textArr.map((segment) => {
      let t = segment;
      if (stripHtml) t = t
          .replace(/<sup class="footnote-marker">.*?<\/sup><i class="footnote">.*?<\/i>/g, '') // remove footnotes
          .replace(/<[^>]*>?/gm, ''); // remove html tags
      if (!showVerseNumbers) {
        t = t.replace(/<span class="verse-md">.*?<\/span>/g, '');
        t = t.replace(/^\d+\s*/, '');
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
      <div className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b bg-gray-50 p-4">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Add Source</h2>
          <form className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              placeholder="e.g., Esther 1:1 or פתח תקוה 5"
            />
            <button
              onClick={() => { fetchSource(refInput, 'he'); fetchSource(refInput, 'en'); }}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-6 border-b bg-white p-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">Layout:</span>
            <select
              className="rounded border p-1"
              value={layoutMode}
              onChange={e => setLayoutMode(e.target.value as any)}
            >
              <option value="line-by-line">Line by Line</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">Hebrew:</span>
            <select
              className="rounded border p-1"
              value={hebrewDisplay}
              onChange={e => setHebrewDisplay(e.target.value as any)}
            >
              <option value="teamim">Teamim</option>
              <option value="nikud">Nikud Only</option>
              <option value="plain">Plain</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded" checked={showVerseNumbers} onChange={e => setShowVerseNumbers(e.target.checked)} />
            <span>Verse Numbers</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded" checked={stripHtml} onChange={e => setStripHtml(e.target.checked)} />
            <span>Plain Text</span>
          </label>
        </div>

        {/* Content Area */}
        {errorData ? (
          <div className="p-4 text-red-600 bg-red-50 border-b">
            {errorData}
          </div>
        ) : (
          <div className="flex flex-1 gap-4 overflow-hidden p-4">
          {/* English Panel */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-gray-100 p-2 text-xs">
              <label className="block font-bold text-gray-500 uppercase mb-1">English Version</label>
              <select
                className="w-full rounded border bg-white p-1"
                value={selectedEnVersion || ''}
                onChange={(e) => { setSelectedEnVersion(e.target.value); fetchSource(refInput, 'en', e.target.value); }}
              >
                {enData?.available_versions.filter(v => v.language === 'en').map(v => <option key={v.versionTitle} value={v.versionTitle}>{v.versionTitle}</option>)}
              </select>
            </div>
            <div
              className="flex-1 overflow-y-auto p-4 text-left leading-relaxed text-gray-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: processText(enData, false) }}
            />
          </div>

          {/* Hebrew Panel */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-gray-100 p-2 text-xs" dir="rtl">
              <label className="block font-bold text-gray-500 uppercase mb-1">גרסה</label>
              <select
                className="w-full rounded border bg-white p-1"
                value={selectedHeVersion || ''}
                onChange={(e) => { setSelectedHeVersion(e.target.value); fetchSource(refInput, 'he', e.target.value); }}
              >
                {heData?.available_versions.filter(v => v.language === 'he').map(v => <option key={v.versionTitle} value={v.versionTitle}>{v.versionTitleInHebrew || v.versionTitle}</option>)}
              </select>
            </div>
            <div
              dir="rtl"
              className="flex-1 overflow-y-auto p-4 text-right font-serif text-xl leading-loose text-gray-900"
              dangerouslySetInnerHTML={{ __html: processText(heData, true) }}
            />
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={!heData || !enData || !!errorData}
            className="rounded-lg bg-green-600 px-6 py-2 font-bold text-white shadow-md transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            Add to Page
          </button>
        </div>
      </div>
    </div>
  );
};
