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
 */
export default function parse(element, { document }) {
  // Each direct child div is one visual column.
  const columnEls = Array.from(element.querySelectorAll(':scope > div'))
    .filter((col) => col.textContent.trim().length > 0 || col.querySelector('img, picture, a'));

  // Empty-block guard.
  if (!columnEls.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row: one cell per column.
  cells.push(columnEls.map((col) => col));

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
