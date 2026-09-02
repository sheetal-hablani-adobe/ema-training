/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-overlay. Base: hero.
 * Source: about-us template, inverse section (grid-layout.desktop-1-column).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Hero is a 1-column, 3-row block.
 *   Row 1 = block name.
 *   Row 2 = single cell with the background image (optional).
 *   Row 3 = single cell with title, subheading, and CTA (optional).
 *
 * Source: an <img class="cover-image"> sits as an overlay background, and the
 * text lives in <div class="card-body"> (heading + subheading + button-group).
 */
export default function parse(element, { document }) {
  // Background image (overlay/cover image).
  const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img[class*="background"], img');

  // Text content container.
  const body = element.querySelector('.card-body, [class*="card-body"], [class*="text-on-overlay"]');

  const heading = (body || element).querySelector('h1, h2, h3, [class*="heading"]');
  const subheading = (body || element).querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from((body || element).querySelectorAll('.button-group a, a.button, a[class*="button"]'));

  // Empty-block guard.
  if (!heading && !subheading && !ctaLinks.length && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (optional).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: content (title + subheading + CTA), all in a single cell.
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-overlay', cells });
  element.replaceWith(block);
}
