/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-article. Base: columns.
 * Source: blog template, section 1 article header
 *   (grid-layout: cover image column + title/byline/meta/tag column).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Columns is a flexible block.
 * First row = block name. The second row contains one cell per visual column.
 * Here the header is a 2-column grid:
 *   - Column 1: the cover image.
 *   - Column 2: breadcrumbs, H1 title, byline, date/read-time meta, category tag.
 *
 * NORMALISATION (why this matters): the source expresses breadcrumbs, byline
 * and meta as nested <div> wrappers and inline flex rows. Those inline spans do
 * NOT survive the markdown round-trip cleanly. To keep every imported page
 * deterministic we rebuild the second column as a sequence of block-level
 * elements: one <p> of breadcrumb links, the <h1>, a byline <p>, a meta <p>,
 * and a tag <p>. Links and the heading are preserved as real elements.
 */

/** Collapse whitespace in a text value. */
function clean(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const columnEls = Array.from(element.querySelectorAll(':scope > div'));

  // Column 1: cover image. Column 2: text content wrapper.
  const imageCol = columnEls.find((col) => col.querySelector('img'));
  const textCol = columnEls.find((col) => col !== imageCol
    && (col.querySelector('h1, h2, h3') || col.querySelector('.breadcrumbs, .tag')));

  const coverImage = imageCol ? imageCol.querySelector('img') : null;

  // Empty-block guard: bail if there is no meaningful header content.
  if (!coverImage && !textCol) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];

  if (textCol) {
    // Breadcrumbs -> a single <p> holding the real <a> links (drop separator svg).
    const breadcrumbs = textCol.querySelector('.breadcrumbs');
    if (breadcrumbs) {
      const links = Array.from(breadcrumbs.querySelectorAll('a'));
      if (links.length) {
        const p = document.createElement('p');
        links.forEach((a, i) => {
          if (i > 0) p.appendChild(document.createTextNode(' > '));
          p.appendChild(a);
        });
        contentCell.push(p);
      }
    }

    // Title (H1). Preserve as a heading element.
    const heading = textCol.querySelector('h1, h2, h3');
    if (heading) {
      const h1 = document.createElement('h1');
      h1.textContent = clean(heading.textContent);
      contentCell.push(h1);
    }

    // Byline + meta live in sibling flex rows. Emit each row as its own <p>.
    const flexRows = Array.from(textCol.querySelectorAll('.flex-horizontal'));
    flexRows.forEach((row) => {
      const text = clean(row.textContent);
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        contentCell.push(p);
      }
    });

    // Category tag -> its own <p>.
    const tag = textCol.querySelector('.tag');
    if (tag) {
      const text = clean(tag.textContent);
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        contentCell.push(p);
      }
    }
  }

  const imageCell = coverImage ? [coverImage] : [''];

  const cells = [];
  // Single content row, two columns: [image][title/byline/meta/tag].
  cells.push([imageCell, contentCell.length ? contentCell : ['']]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-article', cells });
  element.replaceWith(block);
}
