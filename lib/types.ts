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

export interface SourceDisplayOptions {
  layout?: 'side-by-side' | 'stacked' | 'single';
  primaryLanguage?: 'en' | 'he';
  columnRatio?: string;
}

export interface TitleDisplayOptions {
  languages?: 'both' | 'he' | 'en';
  justification?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: string;
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
  titleDisplay?: TitleDisplayOptions;
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

/** Style class name — used for per-class defaults */
export type StyleClassName =
  | 'sectionHeader'
  | 'source'
  | 'text'
  | 'hebrew'
  | 'english'
  | 'sourceTitle'
  | string;  // user-defined classes

/**
 * Style overrides that can be set at the section level.
 * Each key maps to element styles for that category.
 */
export interface SectionStyleOverrides {
  source?: Partial<ElementStyles>;
  text?: Partial<ElementStyles>;
  hebrew?: Partial<ElementStyles>;
  english?: Partial<ElementStyles>;
  sectionHeader?: Partial<ElementStyles>;
  sourceTitle?: Partial<ElementStyles>;
  [className: string]: Partial<ElementStyles> | undefined;
}

export interface Section {
  id: string;
  type: 'section';
  title: string;
  showBorder: boolean;
  styles?: ElementStyles;
  children: (Section | ContentElement)[];
  /** Override styles for child elements by class/category */
  styleOverrides?: SectionStyleOverrides;
  /** Override default source display options for sources in this section */
  sourceDefaults?: SourceDisplayOptions;
  /** Override default source title display for sources in this section */
  titleDefaults?: TitleDisplayOptions;
}

/** Per-class style defaults stored at the global level */
export interface ClassStyleDefaults {
  [className: string]: ElementStyles;
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
  /** Per-class style defaults (e.g. sectionHeader, source, text, hebrew, english, sourceTitle) */
  classDefaults?: ClassStyleDefaults;
  /** Default source display options (layout, language, column ratio) */
  sourceDefaults?: SourceDisplayOptions;
  /** Default source title display */
  titleDefaults?: TitleDisplayOptions;
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
