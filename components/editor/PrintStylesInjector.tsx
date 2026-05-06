'use client';

import { useEffect } from 'react';
import { useSheetStore } from '@/lib/store';

/**
 * Injects a <style> tag before printing that sets @page margins to match
 * the sheet's configured margins, so the browser's physical page margins
 * match the on-screen paper padding exactly.
 */
export function PrintStylesInjector() {
  const { sheet } = useSheetStore();
  const { margins } = sheet.config;

  useEffect(() => {
    const styleId = 'source-sheet-print-styles';

    const inject = () => {
      // Remove any previous injected style
      document.getElementById(styleId)?.remove();

      const style = document.createElement('style');
      style.id = styleId;
      // Set @page to zero margin (the paper div carries the padding), and ensure
      // the paper renders at full width when printing.
      style.textContent = `
        @page {
          margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
          size: ${sheet.config.paperSize === 'Letter' ? 'letter' : 'A4'} portrait;
        }
        @media print {
          html, body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Remove paper div's padding — @page margins handle the whitespace */
          main > div > .mx-auto {
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    window.addEventListener('beforeprint', inject);
    return () => {
      window.removeEventListener('beforeprint', inject);
      document.getElementById(styleId)?.remove();
    };
  }, [margins, sheet.config.paperSize]);

  return null;
}
