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
  // Each card is normally a direct child of the grid container (div or a).
  // But some source pages (e.g. the trend-card grid) come through the scraper
  // FLATTENED: only the first card keeps its <a class="trend-card"> wrapper,
  // while the remaining cards' image/body <div>s become loose direct children
  // of the grid (the wrapping anchors are lost). Detect that shape and rebuild
  // one synthetic card per image+body pair so every card is preserved.
  let cardEls;
  // Trigger reconstruction when the grid holds more .trend-card-image elements
  // than it has direct children — the signature of the scraper-flattened shape
  // where card wrappers were lost and image/body divs float loose.
  const trendImages = element.querySelectorAll('.trend-card-image');
  const directCount = element.querySelectorAll(':scope > *').length;
  if (trendImages.length > directCount) {
    cardEls = [];
    // Pair each .trend-card-image (wherever it sits) with the .trend-card-body
    // that follows it, wrapping both in a synthetic container the loop below
    // can process uniformly. Carry the card href from the nearest ancestor <a>.
    const imageDivs = element.querySelectorAll('.trend-card-image');
    imageDivs.forEach((imgDiv) => {
      const wrapper = document.createElement('div');
      const anchor = imgDiv.closest('a[href]');
      if (anchor && anchor.getAttribute('href')) {
        wrapper.setAttribute('data-card-href', anchor.getAttribute('href'));
      }
      wrapper.appendChild(imgDiv.cloneNode(true));
      // The body is the next sibling element (skipping whitespace text nodes).
      let sib = imgDiv.nextElementSibling;
      if (sib && sib.classList.contains('trend-card-body')) {
        wrapper.appendChild(sib.cloneNode(true));
      }
      cardEls.push(wrapper);
    });
  } else {
    cardEls = Array.from(element.querySelectorAll(':scope > *'));
  }

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6');

    let textCell = '';

    if (heading) {
      // CARD WITH HEADING. Two shapes are supported, both emitted as BLOCK-LEVEL
      // elements only (paragraphs + heading) because the md round-trip flattens
      // inline <span>/<div> (they would collapse into one text run):
      //   1) about-us article card: image + meta (tag pill + date spans) + title.
      //   2) trend card: image + body (tag div/label + title + description <p>).
      // The card href is moved onto the title (a heading-wrapped link survives
      // as "### [title](url)").
      const href = card.tagName === 'A'
        ? card.getAttribute('href')
        : (card.getAttribute('data-card-href') || (card.querySelector('a') && card.querySelector('a').getAttribute('href')));
      const parts = [];

      // Meta/tag + optional date. Prefer explicit meta spans (article card);
      // otherwise take the card's leading label element before the heading
      // (trend card's category tag lives in a <div>, not a <span>).
      const meta = card.querySelector('.article-card-meta');
      let tagText = '';
      let dateText = '';
      if (meta) {
        const metaSpans = Array.from(meta.querySelectorAll('span'))
          .filter((s) => s.textContent.trim().length > 0);
        tagText = metaSpans[0] ? metaSpans[0].textContent.trim() : '';
        dateText = metaSpans[1] ? metaSpans[1].textContent.trim() : '';
      } else {
        // Trend card: the tag is the first non-heading, non-image text node
        // inside the body, sitting before the heading.
        const body = heading.parentElement || card;
        const labelEl = Array.from(body.children)
          .find((el) => el !== heading
            && !el.querySelector('img')
            && !/^H[1-6]$/.test(el.tagName)
            && el.textContent.trim().length > 0
            && el.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
        if (labelEl) tagText = labelEl.textContent.trim();
      }

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

      // Description: any paragraph(s) in the card that follow the heading
      // (trend cards have a summary line; article cards typically have none).
      Array.from(card.querySelectorAll('p'))
        .filter((p) => p.textContent.trim().length > 0
          && (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING))
        .forEach((p) => {
          const descP = document.createElement('p');
          descP.textContent = p.textContent.trim();
          parts.push(descP);
        });

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
