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
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');

    let textCell = '';

    if (heading) {
      // ARTICLE CARD: structured tag + date + linked title.
      // Emit BLOCK-LEVEL elements only (paragraphs + heading), because the
      // md round-trip flattens <span>/<div> — inline meta spans would collapse
      // into one text run ("Casual CoolMay 12### ..."). The card href is moved
      // onto the title (a heading-wrapped link survives as "### [title](url)").
      const href = card.tagName === 'A' ? card.getAttribute('href') : (card.querySelector('a') && card.querySelector('a').getAttribute('href'));
      const parts = [];

      // Meta: tag pill + date, each as its own paragraph (styled inline via CSS).
      const meta = card.querySelector('.article-card-meta') || card;
      const metaSpans = Array.from(meta.querySelectorAll('span'))
        .filter((s) => s.textContent.trim().length > 0);
      const tagText = metaSpans[0] ? metaSpans[0].textContent.trim() : '';
      const dateText = metaSpans[1] ? metaSpans[1].textContent.trim() : '';

      if (tagText) {
        const tagP = document.createElement('p');
        tagP.textContent = tagText;
        parts.push(tagP);
      }
      if (dateText) {
        const dateP = document.createElement('p');
        dateP.textContent = dateText;
        parts.push(dateP);
      }

      // Title heading, wrapping a link to the article when a href exists.
      const titleEl = document.createElement(heading.tagName.toLowerCase());
      const titleText = heading.textContent.trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        titleEl.appendChild(a);
      } else {
        titleEl.textContent = titleText;
      }
      parts.push(titleEl);

      textCell = parts;
    } else {
      // Non-article card (e.g. image-only gallery): collect any text present.
      const textParts = Array.from(
        card.querySelectorAll('p, span'),
      ).filter((el) => el.textContent.trim().length > 0);
      if (textParts.length) textCell = textParts;
    }

    const imageCell = img || '';

    // Skip empty children (e.g. layout-only wrappers with nothing inside).
    if (img || (Array.isArray(textCell) ? textCell.length : textCell)) {
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
