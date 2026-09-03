/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters SECTION SPLITTER.
 *
 * Problem: the source pages (trends-landing, article-index, about-us, ...) render
 * as ONE `<main id="main-content">` containing several top-level source sections
 * with ALTERNATING backgrounds (grey / white / accent). Because block parsers only
 * replace the inner `div.grid-layout` grids — never the `<header>` / `<section>`
 * wrappers — the whole page otherwise collapses into a single EDS section and the
 * grey/white/accent banding is lost.
 *
 * This transformer, running AFTER the block parsers, reproduces each source section
 * as its own real EDS section by:
 *   1) inserting a top-level `<hr>` (thematic break → EDS section break) BEFORE every
 *      source section except the first (so N sections yield N-1 breaks: no leading
 *      and no trailing stray break, therefore no empty sections); and
 *   2) appending a Section Metadata block to each source section whose background is
 *      NOT the default white — i.e. class `secondary-section` (=> Style "grey") or
 *      `accent-section` (=> Style "accent"). Plain `section.section` gets NO metadata.
 *
 * Hook: afterTransform ONLY. Runs after `wknd-trendsetters-cleanup` (which strips the
 * navbar/footer) and after all block parsers. The section wrappers this transformer
 * keys off are never parser targets, so they still exist here.
 *
 * Selector source: verified against migration-work/cleaned.html (article-index /
 * blog page) — top-level sections are `#main-content > header.section` and
 * `#main-content > section.section`, with `secondary-section` / `accent-section`
 * modifier classes carrying the background style.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

// PRIMARY signal: source DOM modifier class -> EDS Section Metadata "Style" value.
// White/default (`section.section` with no modifier) is intentionally absent → no metadata.
const SECTION_STYLE_BY_CLASS = {
  'secondary-section': 'grey',
  'accent-section': 'accent',
};

/**
 * Decide the EDS section Style for a source section element.
 * PRIMARY: the source DOM modifier class (robust + reusable across all pages).
 * SECONDARY (only if present): PAGE_TEMPLATE.blocks section-* entries — the import
 * scripts strip these, so at real-import time this branch is normally inert; it just
 * lets the transformer honour a template that DOES carry section markers.
 * @returns {string|null} 'grey' | 'accent' | null (default white → no metadata)
 */
function resolveSectionStyle(sectionEl, template) {
  const classes = Object.keys(SECTION_STYLE_BY_CLASS);
  for (let i = 0; i < classes.length; i += 1) {
    if (sectionEl.classList.contains(classes[i])) return SECTION_STYLE_BY_CLASS[classes[i]];
  }
  const blocks = template && Array.isArray(template.blocks) ? template.blocks : [];
  for (let i = 0; i < blocks.length; i += 1) {
    const b = blocks[i];
    if (!b.section || !Array.isArray(b.instances)) continue;
    const hit = b.instances.some((sel) => {
      try { return sectionEl.matches(sel); } catch (e) { return false; }
    });
    if (hit) return b.section; // page-templates already stores 'grey' / 'accent'
  }
  return null;
}

export default function transform(hookName, element, payload) {
  // afterTransform only: block parsers have already replaced the inner grids; the
  // top-level section wrappers we split on survive because no parser targets them.
  if (hookName !== TransformHook.afterTransform) return;

  const template = (payload && payload.template) || {};
  const mainContent = element.querySelector('#main-content') || element;

  // Snapshot the top-level source sections in document order BEFORE mutating, so the
  // <hr> / metadata insertions below never disturb the iteration.
  const sections = Array.from(
    mainContent.querySelectorAll(':scope > header.section, :scope > section.section'),
  );

  // Nothing to split (0/1 section) — leave the DOM untouched.
  if (sections.length < 2) return;

  sections.forEach((sectionEl, index) => {
    // 1) Section break before every section except the first → N-1 breaks, no strays.
    //    <hr> is a different tag than header/section so it never affects any surviving
    //    :nth-of-type selectors; it round-trips to a markdown thematic break (`---`),
    //    which the helix pipeline turns into a separate EDS section.
    if (index > 0) {
      sectionEl.before(document.createElement('hr'));
    }

    // 2) Section Metadata for non-white sections only (grey / accent). Appended as the
    //    LAST child of the section wrapper so it sits inside this section's range
    //    (before the next <hr>). White/default sections get nothing.
    const style = resolveSectionStyle(sectionEl, template);
    if (style) {
      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { Style: style },
      });
      sectionEl.append(metadataBlock);
    }
  });
}
