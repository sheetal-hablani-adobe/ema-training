/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsMediaParser from './parsers/cards-media.js';
import columnsFeatureParser from './parsers/columns-feature.js';

// TRANSFORMER IMPORTS
import wkndTrendsettersCleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import wkndTrendsettersSectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-media': cardsMediaParser,
  'columns-feature': columnsFeatureParser,
};

// TRANSFORMER REGISTRY
// Cleanup runs first (removes chrome); the sections transformer runs last in
// afterTransform to split the page into per-source-section EDS sections and add
// grey/accent Section Metadata for the alternating banded backgrounds.
const transformers = [
  wkndTrendsettersCleanupTransformer,
  wkndTrendsettersSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
// Section-* entries are omitted from this block list; the sections transformer
// (wknd-trendsetters-sections.js) derives the grey/accent banded backgrounds
// from the source DOM classes and emits section breaks + Section Metadata.
// Selectors are CLASS-BASED (keyed off the distinguishing grid-layout classes)
// rather than positional, so the same template covers every trends-landing page
// (/fashion-trends-young-adults, /fashion-trends-of-the-season, ...) despite
// differing section counts/order:
//   - columns-feature: the hero (tablet-1-column grid-gap-xxl) and the split
//     feature (tablet-1-column grid-gap-lg) — both stack single-column, i.e. a
//     2-column feature, never a multi-card grid.
//   - cards-media: every multi-card grid — the 3-up feature grid
//     (desktop-3-column ... grid-gap-xxl|lg), the 4-up article grid
//     (desktop-4-column ... grid-gap-md) and the image galleries
//     (desktop-4-column|desktop-3-column ... grid-gap-sm).
const PAGE_TEMPLATE = {
  name: 'trends-landing',
  description: 'Trends landing page (hero + feature/card grids + accent CTA band)',
  urls: [
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
  ],
  blocks: [
    {
      name: 'columns-feature',
      instances: [
        '#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl',
        // Split feature: a 2-column grid that stacks single-column (tablet-1-column
        // grid-gap-lg). Exclude desktop-N-column so it never grabs the 3-up feature
        // card grid (desktop-3-column tablet-1-column grid-gap-lg), which is cards-media.
        '#main-content > section.section > div.container > div.grid-layout.tablet-1-column.grid-gap-lg:not([class*="desktop-"])',
      ],
    },
    {
      name: 'cards-media',
      instances: [
        '#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-1-column.grid-gap-xxl',
        '#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-1-column.grid-gap-lg',
        '#main-content > section.section > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md',
        '#main-content > section.section > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm',
        '#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm',
      ],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 1b. Page-specific: the hero on this page should show only its primary CTA
    // ("See trends"). The source hero also carries a secondary "Explore the blog"
    // link, which we drop here (scoped to the hero header's button group so the
    // shared columns-feature parser and other pages are unaffected). Done before
    // block parsing so the parser only ever sees the single CTA. Idempotent:
    // keeps just the first anchor, so re-imports stay stable.
    const heroButtonGroup = document.querySelector(
      '#main-content > header.section.secondary-section .button-group',
    );
    if (heroButtonGroup) {
      const heroLinks = heroButtonGroup.querySelectorAll(':scope > a');
      heroLinks.forEach((a, i) => { if (i > 0) a.remove(); });
    }

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
