/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsMediaParser from './parsers/cards-media.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import faqColumnsParser from './parsers/faq-columns.js';
import heroOverlayParser from './parsers/hero-overlay.js';
import tabsProfileParser from './parsers/tabs-profile.js';

// TRANSFORMER IMPORTS
import wkndTrendsettersCleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'cards-media': cardsMediaParser,
  'columns-feature': columnsFeatureParser,
  'faq-columns': faqColumnsParser,
  'hero-overlay': heroOverlayParser,
  'tabs-profile': tabsProfileParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndTrendsettersCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'About-us editorial page: two-column intros, image and article card grids, profile tabs, FAQ accordion, and an overlay hero banner.',
  urls: [
    'https://wknd-trendsetters.site/about-us',
    'https://wknd-trendsetters.site/case-studies',
    'https://wknd-trendsetters.site/',
  ],
  blocks: [
    {
      name: 'columns-feature',
      instances: [
        '#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl',
        '#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg',
      ],
    },
    {
      name: 'cards-media',
      instances: [
        '#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm',
        '#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md',
      ],
    },
    {
      name: 'tabs-profile',
      instances: [
        '#main-content > section.section:nth-of-type(3) > div.container > div.tabs-wrapper',
      ],
    },
    {
      name: 'faq-columns',
      instances: [
        // Primary: the FAQ grid (heading + subheading cell + div.faq-list cell).
        '#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl',
        // Class-based fallback: any grid that actually contains a faq-list, so it
        // never accidentally matches the header/intro grids of the same class.
        '#main-content div.grid-layout.tablet-1-column.grid-gap-xxl:has(div.faq-list)',
      ],
    },
    {
      name: 'hero-overlay',
      instances: [
        '#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column',
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
