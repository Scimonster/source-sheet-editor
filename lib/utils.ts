import { clsx, type ClassValue } from 'clsx'
import gematriya from 'gematriya';
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toRoman(n: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  let num = n;
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}

export function toAlpha(n: number): string {
  let result = '';
  let num = n;
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}

export function toGematriya(n: number): string {
  return gematriya(n);
}

export function formatNumber(n: number, scheme: 'arabic' | 'alpha' | 'roman' | 'gematriya' | 'none'): string {
  switch (scheme) {
    case 'arabic':
      return n.toString();
    case 'alpha':
      return toAlpha(n);
    case 'roman':
      return toRoman(n);
    case 'gematriya':
      return toGematriya(n);
    case 'none':
    default:
      return '';
  }
}
