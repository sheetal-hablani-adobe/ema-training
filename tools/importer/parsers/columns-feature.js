/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base: columns.
 * Source: about-us template, secondary header section and section 1
 *   (grid-layout with side-by-side content columns).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Columns is a flexible block.
 * First row = block name. The second row contains one cell per visual column;
 * additional rows must keep the same column count.
 *
 * Source: the grid container has N direct child <div>s, each representing one
 * visual column (e.g. a text+CTA column and an image column). Each direct
 * child becomes one cell in a single content row.
 *
 * NORMALISATION (why this matters for bulk import): an image column in the
 * source is often a <div> holding several bare <img> siblings. Passing those
 * bare siblings straight through is fragile — the md round-trip wraps them
 * inconsistently (all in one <p> vs one <p> each) depending on whitespace,
 * which then makes the collage grid layout unpredictable across pages. To keep
 * every imported page deterministic we rewrite an image-only column into one
 * <p> per image. The block decorator can then rely on a single, stable shape.
 */

/** True when a column's only meaningful content is images (no copy/links). */
function isImageOnlyColumn(col) {
  if (!col.querySelector('img, picture')) return false;
  if (col.querySelector('h1, h2, h3, h4, h5, h6, a, button')) return false;
  return col.textContent.trim().length === 0;
}

/** Rewrite an image-only column so each image sits in its own <p>. */
function normaliseImageColumn(col, document) {
  const media = Array.from(col.querySelectorAll('img, picture'));
  if (media.length < 2) return; // single image needs no normalisation
  const wrapper = document.createElement('div');
  media.forEach((m) => {
    // Prefer the <picture> when the <img> is wrapped in one.
    const node = m.tagName === 'IMG' && m.closest('picture') ? m.closest('picture') : m;
    if (node.parentElement === wrapper) return; // already moved (img inside picture)
    const p = document.createElement('p');
    p.appendChild(node);
    wrapper.appendChild(p);
  });
  col.textContent = '';
  while (wrapper.firstChild) col.appendChild(wrapper.firstChild);
}

export default function parse(element, { document }) {
  // Each direct child div is one visual column.
  const columnEls = Array.from(element.querySelectorAll(':scope > div'))
    .filter((col) => col.textContent.trim().length > 0 || col.querySelector('img, picture, a'));

  // Empty-block guard.
  if (!columnEls.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Normalise image-only columns to one <p> per image (deterministic collage).
  columnEls.forEach((col) => {
    if (isImageOnlyColumn(col)) normaliseImageColumn(col, document);
  });

  const cells = [];
  // Single content row: one cell per column.
  cells.push(columnEls.map((col) => col));

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
