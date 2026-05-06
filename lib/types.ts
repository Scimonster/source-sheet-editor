export type RichText = string;

export interface LicenseInfo {
  name: string;
  url?: string;
}

export interface ElementStyles {
  fontFamily?: string;
  fontSize?: string;
  justification?: 'left' | 'center' | 'right' | 'justify';
  customClasses?: string[];
}

export interface SourceContent {
  text: RichText;
  license?: LicenseInfo;
}

export interface SourceElement {
  id: string;
  type: 'source';
  ref: {
    en: string;
    he: string;
    link?: string;
  };
  content: {
    en: SourceContent;
    he: SourceContent;
  };
  displayOptions: {
    layout: 'side-by-side' | 'stacked' | 'single';
    primaryLanguage: 'en' | 'he';
    columnRatio?: string;
  };
  titleDisplay?: {
    languages: 'both' | 'he' | 'en';
    justification?: 'left' | 'center' | 'right';
    fontFamily?: string;
    fontSize?: string;
  };
  directionNote?: RichText;
  styles?: ElementStyles;
}

export interface TextElement {
  id: string;
  type: 'text';
  content: RichText;
  styles?: ElementStyles;
}

export interface DirectionElement {
  id: string;
  type: 'direction';
  content: RichText;
  styles?: ElementStyles;
  displayMode: {
    italics: boolean;
    indent: boolean;
    border: boolean;
    brackets: boolean;
    small: boolean;
  };
}

export type ContentElement = SourceElement | TextElement | DirectionElement;

export interface Section {
  id: string;
  type: 'section';
  title: string;
  showBorder: boolean;
  styles?: ElementStyles;
  children: (Section | ContentElement)[];
}

export interface GlobalConfig {
  paperSize: 'A4' | 'Letter';
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  defaultStyles: ElementStyles;
  showSectionNumbers: boolean;
  showSourceNumbers: boolean;
}

export interface SourceSheet {
  id: string;
  version: string;
  metadata: {
    title: string;
    subtitle?: string;
    header?: { left?: string; center?: string; right?: string };
    footer?: { left?: string; center?: string; right?: string; showPageNumbers: boolean };
    authorId: string;
    username: string;
    visibility: 'private' | 'public' | 'link-only';
    collaborators: string[];
  };
  config: GlobalConfig;
  content: (Section | ContentElement)[];
}

export type ViewMode = 'edit' | 'preview' | 'leader';

export type AddElementType = 'section' | 'source' | 'text' | 'direction';
