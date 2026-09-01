/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-media. Base: cards.
 * Source: about-us template, secondary sections 2 and 4 (grid-layout of media cards).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Cards is a 2-column block.
 * First row = block name. Each subsequent row = one card:
 *   [ image/icon cell, text-content cell ].
 *
 * Source: each card is a direct child of the grid container. On the image-only
 * gallery the child is a <div> (e.g. div.utility-aspect-1x1) wrapping an <img>.
 * On the article grid the child is an <a class="article-card"> wrapping an image
 * plus a body (tag, date, heading). We therefore accept any direct child element
 * and emit the text cell only when text is actually present, keeping rows for the
 * text-less media grid while remaining resilient across both layouts.
 */
export default function parse(element, { document }) {
  // Each card is a direct child of the grid container (div or a).
  const cardEls = element.querySelectorAll(':scope > *');

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');

    // Collect any text content (heading/description/CTA/meta) if present.
    const textParts = Array.from(
      card.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span'),
    ).filter((el) => el.textContent.trim().length > 0);

    // If the card itself is a link, preserve it by wrapping the collected text
    // in an anchor so the card link survives into the block.
    let textCell = '';
    if (textParts.length) {
      const href = card.tagName === 'A' ? card.getAttribute('href') : null;
      if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        textParts.forEach((el) => link.appendChild(el));
        textCell = link;
      } else {
        textCell = textParts;
      }
    }

    const imageCell = img || '';

    // Skip empty children (e.g. layout-only wrappers with nothing inside).
    if (img || textParts.length) {
      cells.push([imageCell, textCell]);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-media', cells });
  element.replaceWith(block);
}
