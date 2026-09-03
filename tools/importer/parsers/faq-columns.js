/* eslint-disable */
/* global WebImporter */
/**
 * Parser for faq-columns. Base: 2-column FAQ section.
 * Source: about-us / homepage template, FAQ section — a
 *   `div.grid-layout.tablet-1-column.grid-gap-xxl` grid holding TWO cells:
 *     cell 1 = intro `<div>` (h2 heading + subheading `<p>`),
 *     cell 2 = `div.faq-list` (a list of `<details class="faq-item">` Q&A items).
 *
 * Emitted block (rows):
 *   row 1  = [ intro (heading + subheading) ]           (single cell)
 *   row 2+ = [ question, answer ]                        (one row per FAQ item)
 *
 * The block CSS renders row 1 (intro) as the left column and the FAQ list as the
 * right column on desktop, stacking below 900px — entirely within the centered
 * section column, so it can never overflow the viewport. The decorative toggle
 * icon (svg/img) inside each summary is excluded.
 */
export default function parse(element, { document }) {
  const cells = [];

  // 1) Intro cell: the heading + subheading. Prefer the grid's first non-faq-list
  //    child; fall back to collecting any heading/subheading found in the grid.
  const introSource = Array.from(element.children).find(
    (child) => !child.classList.contains('faq-list') && child.querySelector('h1, h2, h3, h4, h5, h6'),
  );

  const introNodes = [];
  if (introSource) {
    const heading = introSource.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) introNodes.push(heading);
    // Subheading / supporting paragraphs after the heading.
    introSource.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim()) introNodes.push(p);
    });
  }
  if (introNodes.length) {
    cells.push([introNodes]);
  }

  // 2) FAQ items: each <details> becomes a [question, answer] row.
  const faqList = element.querySelector('.faq-list') || element;
  const items = faqList.querySelectorAll('details.faq-item, details, .faq-item');

  items.forEach((item) => {
    const summary = item.querySelector('summary.faq-question, summary');
    let titleCell = '';
    const titleSpan = summary ? summary.querySelector('span') : null;
    if (titleSpan) {
      titleCell = titleSpan.textContent.trim();
    } else if (summary) {
      titleCell = summary.textContent.trim();
    }

    const answer = item.querySelector('.faq-answer, .faq-content');
    let contentCell = '';
    if (answer) {
      const nodes = Array.from(answer.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0;
        return true;
      });
      contentCell = nodes.length ? nodes : answer;
    }

    if (titleCell || (contentCell && contentCell !== '')) {
      cells.push([titleCell, contentCell]);
    }
  });

  // Empty-block guard: nothing useful extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'faq-columns', cells });
  element.replaceWith(block);
}
