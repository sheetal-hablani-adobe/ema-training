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

/**
 * Ensure the generated Metadata block carries `Template = blog`.
 *
 * WebImporter.rules.createMetadata() appends a Metadata block to `main` as a
 * <table> whose first row is a <th> header ("Metadata") followed by
 * <tr><td>key</td><td>value</td></tr> rows. We add (or update) a `Template`
 * row so the published page sets `<body class="blog">` via scripts.js
 * (decorateTemplateAndTheme). That is what scopes the centered reading-column
 * layout in styles.css. Idempotent: updates the row if it already exists.
 */
function addBlogTemplateMetadata(main, document) {
  const TEMPLATE_NAME = 'blog';

  // Locate the Metadata table (header th text === "Metadata").
  const table = [...main.querySelectorAll('table')].find((t) => {
    const th = t.querySelector('tr th');
    return th && th.textContent.trim().toLowerCase() === 'metadata';
  });
  if (!table) return;

  // Update an existing Template row if present.
  const existing = [...table.querySelectorAll('tr')].find((tr) => {
    const key = tr.querySelector('td');
    return key && key.textContent.trim().toLowerCase() === 'template';
  });
  if (existing) {
    const valueCell = existing.querySelector('td:last-child');
    if (valueCell) valueCell.textContent = TEMPLATE_NAME;
    return;
  }

  // Otherwise append a new key/value row.
  const row = document.createElement('tr');
  const keyCell = document.createElement('td');
  keyCell.textContent = 'template';
  const valueCell = document.createElement('td');
  valueCell.textContent = TEMPLATE_NAME;
  row.append(keyCell, valueCell);
  table.append(row);
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

    // 5b. Tag the page with the blog template so scripts.js adds
    // `class="blog"` to <body>. The source renders the article body (prose +
    // spec table) as a centered ~768px reading column while the header stays
    // wide; that layout is scoped in styles.css under `body.blog`. Emitting the
    // Template metadata here makes every blog page pick it up automatically on
    // bulk import (no per-page DA edit needed).
    addBlogTemplateMetadata(main, document);

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
