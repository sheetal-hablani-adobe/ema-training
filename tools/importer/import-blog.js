/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsArticleParser from './parsers/columns-article.js';
import tableSpecParser from './parsers/table-spec.js';

// TRANSFORMER IMPORTS (site-wide cleanup shared with other templates)
import wkndTrendsettersCleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'columns-article': columnsArticleParser,
  'table-spec': tableSpecParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndTrendsettersCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json (blog)
const PAGE_TEMPLATE = {
  name: 'blog',
  description: 'Blog article page: two-column article header (cover image + title/byline/meta/tag) and a long-form article body with an embedded spec table.',
  urls: [
    'https://wknd-trendsetters.site/blog/ace-pro-court-polo',
  ],
  blocks: [
    {
      name: 'columns-article',
      instances: [
        '#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg',
      ],
    },
    {
      name: 'table-spec',
      instances: [
        '#main-content > section.section:nth-of-type(2) table',
      ],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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
