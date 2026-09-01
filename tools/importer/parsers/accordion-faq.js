/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion.
 * Source: about-us template, section 5 (div.faq-list).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Accordion is a 2-column block.
 * First row = block name. Each subsequent row = one accordion item:
 *   [ title cell, content cell ].
 *
 * Source: each <details class="faq-item"> holds a <summary class="faq-question">
 * (question text in a <span>, plus a decorative toggle icon <img>) and a
 * <div class="faq-answer"> (the answer body). The decorative icon is excluded.
 */
export default function parse(element, { document }) {
  // Each accordion item is a <details> element.
  const items = element.querySelectorAll('details.faq-item, details, .faq-item');

  const cells = [];

  items.forEach((item) => {
    // Title: prefer the inner span (excludes the decorative toggle icon),
    // fall back to the summary text if no span is present.
    const summary = item.querySelector('summary.faq-question, summary');
    let titleCell;
    const titleSpan = summary ? summary.querySelector('span') : null;
    if (titleSpan) {
      titleCell = titleSpan.textContent.trim();
    } else if (summary) {
      titleCell = summary.textContent.trim();
    } else {
      titleCell = '';
    }

    // Content: the answer body. Preserve its inner elements (paragraphs, etc.).
    const answer = item.querySelector('.faq-answer, .faq-content');
    let contentCell;
    if (answer) {
      const nodes = Array.from(answer.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0; // text node
        return true;
      });
      contentCell = nodes.length ? nodes : answer;
    } else {
      contentCell = '';
    }

    if (titleCell || (contentCell && contentCell !== '')) {
      cells.push([titleCell, contentCell]);
    }
  });

  // Empty-block guard: no items extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
