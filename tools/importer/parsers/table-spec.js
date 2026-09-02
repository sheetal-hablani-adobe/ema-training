/* eslint-disable */
/* global WebImporter */
/**
 * Parser for table-spec. Base: table.
 * Source: blog template, section 2 embedded spec table
 *   (2-column table: header row "Spec | Detail", 5 data rows).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Table is a flexible block.
 * First row = block name. Each subsequent row is a row of data; cells across
 * the columns hold individual data points or headers. Here we preserve the
 * header cells (Spec | Detail) as the first data row, then one row per source
 * <tbody> <tr>, each with its Spec cell and Detail cell (two cells per row).
 */

export default function parse(element, { document }) {
  // element is the <table>. Collect all rows across thead + tbody.
  const rows = Array.from(element.querySelectorAll('tr'));

  // Empty-block guard.
  if (!rows.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Unwrap a source <td>/<th> into its inner content so the block table is a
  // clean 2-column shape (passing the raw cell element renders a nested box).
  const unwrap = (cell) => {
    if (!cell) return '';
    const nodes = Array.from(cell.childNodes).filter((n) => (
      n.nodeType !== Node.TEXT_NODE || n.textContent.trim().length
    ));
    if (!nodes.length) return cell.textContent.trim();
    return nodes.length === 1 ? nodes[0] : nodes;
  };

  rows.forEach((tr) => {
    const rowCells = Array.from(tr.querySelectorAll(':scope > th, :scope > td'));
    if (!rowCells.length) return;
    // Preserve each cell's inner content (keeps <strong> in Spec cells).
    cells.push([unwrap(rowCells[0]), unwrap(rowCells[1])]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-spec', cells });
  element.replaceWith(block);
}
