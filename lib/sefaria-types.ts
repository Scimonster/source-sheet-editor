/**
 * Base definition for a text version in the Sefaria system.
 */
export interface SefariaVersion {
  status: string;
  priority: number;
  license: string;
  versionNotes: string;
  formatAsPoetry: string | boolean;
  digitizedBySefaria: string | boolean;
  method: string;
  heversionSource: string;
  versionUrl: string;
  versionTitleInHebrew: string;
  versionNotesInHebrew: string;
  shortVersionTitle: string;
  shortVersionTitleInHebrew: string;
  extendedNotes: string;
  extendedNotesHebrew: string;
  purchaseInformationImage: string;
  purchaseInformationURL: string;
  hasManuallyWrappedRefs: string | boolean;
  language: "en" | "he";
  versionSource: string;
  versionTitle: string;
  actualLanguage: string;
  languageFamilyName: string;
  isSource: boolean;
  isPrimary: boolean;
  direction: "ltr" | "rtl";
  title?: string; // Present in some version objects
}

/**
 * Extends the base version to include the actual text content.
 */
export interface SefariaVersionWithText extends SefariaVersion {
  text: string | string[] | string[][];
}

/**
 * The full response from Sefaria's text API.
 */
export interface SefariaTextResponse {
  ref: string;
  heRef: string;
  sections: string[];
  toSections: string[];
  sectionRef: string;
  heSectionRef: string;
  firstAvailableSectionRef: string;
  isSpanning: boolean;
  next: string | null;
  prev: string | null;
  title: string;
  book: string;
  heTitle: string;
  primary_category: string;
  type: string;
  indexTitle: string;
  categories: string[];
  heIndexTitle: string;
  isComplex: boolean;
  isDependant: boolean;
  order: number[];
  collectiveTitle: string;
  heCollectiveTitle: string;
  alts: any[];
  lengths: number[];
  length: number;
  textDepth: number;
  sectionNames: string[];
  addressTypes: string[];
  titleVariants: string[];
  heTitleVariants: string[];
  index_offsets_by_depth: Record<string, any>;
  warnings: any[];

  // The version arrays
  versions: SefariaVersionWithText[];
  available_versions: SefariaVersion[];
}
