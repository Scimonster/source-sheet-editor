import {
  ElementStyles,
  GlobalConfig,
  Section,
  ContentElement,
  SourceElement,
  SourceDisplayOptions,
  TitleDisplayOptions,
  NumberingScheme,
} from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Merge two partial style objects; later values win over earlier ones. */
function mergeStyles(
  base: Partial<ElementStyles>,
  override: Partial<ElementStyles> | undefined
): ElementStyles {
  if (!override) return { ...base };
  return {
    fontFamily: override.fontFamily ?? base.fontFamily,
    fontSize: override.fontSize ?? base.fontSize,
    justification: override.justification ?? base.justification,
    customClasses: override.customClasses?.length
      ? [...(base.customClasses ?? []), ...override.customClasses]
      : base.customClasses,
  };
}

function mergeSourceDisplay(
  base: SourceDisplayOptions,
  override: SourceDisplayOptions | undefined
): SourceDisplayOptions {
  if (!override) return { ...base };
  return {
    layout: override.layout ?? base.layout,
    primaryLanguage: override.primaryLanguage ?? base.primaryLanguage,
    columnRatio: override.columnRatio ?? base.columnRatio,
  };
}

function mergeTitleDisplay(
  base: TitleDisplayOptions,
  override: TitleDisplayOptions | undefined
): TitleDisplayOptions {
  if (!override) return { ...base };
  return {
    languages: override.languages ?? base.languages,
    justification: override.justification ?? base.justification,
    fontFamily: override.fontFamily ?? base.fontFamily,
    fontSize: override.fontSize ?? base.fontSize,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Determine which class names apply to an element based on its type and
 * any custom classes the user has assigned.
 */
export function getElementClasses(
  element: ContentElement | Section,
  /** For source sub-parts: 'hebrew' | 'english' | 'sourceTitle' */
  subPart?: string
): string[] {
  const classes: string[] = [];

  // Element-type class
  if (element.type === 'source') classes.push('source');
  else if (element.type === 'text') classes.push('text');
  else if (element.type === 'section') classes.push('sectionHeader');

  // Sub-part class (for source language panes / title)
  if (subPart) classes.push(subPart);

  // User-assigned custom classes
  const styles = 'styles' in element ? element.styles : undefined;
  if (styles?.customClasses?.length) {
    classes.push(...styles.customClasses);
  }

  return classes;
}

/**
 * Resolve the effective styles for an element by walking the cascading chain.
 *
 * Resolution order (later wins):
 * 1. globalConfig.defaultStyles
 * 2. globalConfig.classDefaults[className] for each class
 * 3. Nearest ancestor section's styleOverrides[className] for each class
 * 4. Element's own styles
 */
export function resolveStyles(
  element: ContentElement | Section,
  ancestorSections: Section[],
  globalConfig: GlobalConfig,
  /** Sub-part for source elements: 'hebrew' | 'english' | 'sourceTitle' */
  subPart?: string
): ElementStyles {
  // 1. Start with global defaults
  let resolved: ElementStyles = { ...globalConfig.defaultStyles };

  // 2. Apply global class defaults
  const classes = getElementClasses(element, subPart);
  if (globalConfig.classDefaults) {
    for (const cls of classes) {
      if (globalConfig.classDefaults[cls]) {
        resolved = mergeStyles(resolved, globalConfig.classDefaults[cls]);
      }
    }
  }

  // 3. Apply section-level overrides (outermost ancestor first → innermost last)
  for (const section of ancestorSections) {
    if (section.styleOverrides) {
      for (const cls of classes) {
        if (section.styleOverrides[cls]) {
          resolved = mergeStyles(resolved, section.styleOverrides[cls]);
        }
      }
    }
  }

  // 4. Apply element's own styles (highest priority)
  if ('styles' in element && element.styles) {
    resolved = mergeStyles(resolved, element.styles);
  }

  return resolved;
}

/**
 * Resolve the effective source display options by cascading.
 *
 * Resolution order:
 * 1. Hard-coded defaults
 * 2. globalConfig.sourceDefaults
 * 3. Nearest ancestor section's sourceDefaults (outermost first)
 * 4. Source's own displayOptions
 */
export function resolveSourceDisplayOptions(
  source: SourceElement,
  ancestorSections: Section[],
  globalConfig: GlobalConfig
): Required<SourceDisplayOptions> {
  const hardDefaults: Required<SourceDisplayOptions> = {
    layout: 'side-by-side',
    primaryLanguage: 'he',
    columnRatio: '50%',
  };

  // 1-2. Global defaults
  let resolved = mergeSourceDisplay(hardDefaults, globalConfig.sourceDefaults) as Required<SourceDisplayOptions>;

  // 3. Section-level defaults
  for (const section of ancestorSections) {
    if (section.sourceDefaults) {
      resolved = mergeSourceDisplay(resolved, section.sourceDefaults) as Required<SourceDisplayOptions>;
    }
  }

  // 4. Element's own displayOptions
  resolved = mergeSourceDisplay(resolved, source.displayOptions) as Required<SourceDisplayOptions>;

  return resolved;
}

/**
 * Resolve the effective title display options for a source.
 *
 * Resolution order:
 * 1. Hard-coded defaults
 * 2. globalConfig.titleDefaults
 * 3. Nearest ancestor section's titleDefaults
 * 4. Source's own titleDisplay
 */
export function resolveTitleDisplay(
  source: SourceElement,
  ancestorSections: Section[],
  globalConfig: GlobalConfig
): TitleDisplayOptions {
  const hardDefaults: TitleDisplayOptions = {
    languages: 'both',
  };

  let resolved = mergeTitleDisplay(hardDefaults, globalConfig.titleDefaults);

  for (const section of ancestorSections) {
    if (section.titleDefaults) {
      resolved = mergeTitleDisplay(resolved, section.titleDefaults);
    }
  }

  resolved = mergeTitleDisplay(resolved, source.titleDisplay);

  return resolved;
}

/**
 * Resolve effective properties for a section.
 *
 * Resolution order:
 * 1. Hard-coded defaults
 * 2. globalConfig.sectionDefaults
 * 3. Nearest ancestor section's properties
 * 4. Section's own properties
 */
export function resolveSectionProperties(
  section: Section,
  ancestorSections: Section[],
  globalConfig: GlobalConfig
): { showBorder: boolean } {
  let showBorder = false;

  if (globalConfig.sectionDefaults?.showBorder !== undefined) {
    showBorder = globalConfig.sectionDefaults.showBorder;
  }

  // If we ever add section-level defaults for child sections, we'd process ancestors here.
  // Currently, we just inherit from global.

  if (section.showBorder !== 'inherit') {
    showBorder = section.showBorder;
  }

  return { showBorder };
}

/**
 * Resolve the effective section numbering scheme for a section.
 */
export function resolveSectionNumbering(
  ancestorSections: Section[],
  globalConfig: GlobalConfig
): NumberingScheme {
  // Start from the innermost ancestor and work outwards
  for (let i = ancestorSections.length - 1; i >= 0; i--) {
    const scheme = ancestorSections[i].sectionNumbering;
    if (scheme && scheme !== 'inherit') return scheme;
  }
  return globalConfig.sectionNumbering;
}

/**
 * Resolve the effective source numbering scheme for a source within sections.
 */
export function resolveSourceNumbering(
  ancestorSections: Section[],
  globalConfig: GlobalConfig
): NumberingScheme {
  for (let i = ancestorSections.length - 1; i >= 0; i--) {
    const scheme = ancestorSections[i].sourceNumbering;
    if (scheme && scheme !== 'inherit') return scheme;
  }
  return globalConfig.sourceNumbering;
}
