export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  // Mark the hero instance (contains an <h1>) so the CSS can target it with a
  // plain class instead of :has(h1) — :has() support is uneven across the
  // environments this renders in, and a failed :has() selector drops the whole
  // rule, collapsing the hero to a single column.
  if (block.querySelector('h1')) {
    block.classList.add('columns-feature-hero');
    // Tag the CTA paragraph (the one holding the action links) so CSS can style
    // it without :has(a).
    [...block.querySelectorAll('p')].forEach((p) => {
      if (p.querySelector('a')) p.classList.add('columns-feature-cta');
    });
  } else {
    // Non-hero (e.g. article intro, split feature). A paragraph of links with no
    // other copy is either a breadcrumb trail (2+ links) or a single CTA link.
    // Tag each so CSS can style them without :has() (breadcrumb chevrons; solid
    // pill CTA). The source's inline separator SVG is dropped on import.
    [...block.querySelectorAll('p')].forEach((p) => {
      const links = p.querySelectorAll(':scope > a');
      const textOutsideLinks = [...p.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .map((n) => n.textContent.trim())
        .join('');
      if (textOutsideLinks.length === 0 && links.length >= 2) {
        p.classList.add('columns-feature-breadcrumbs');
      } else if (textOutsideLinks.length === 0 && links.length === 1) {
        p.classList.add('columns-feature-cta');
      }
    });
  }

  // Setup image columns. A column cell is treated as an image collage when its
  // only meaningful content is pictures (no headings/paragraph copy/links). The
  // authored markup varies by pipeline: images may share one <p> or each sit in
  // its own <p>, so detect by content rather than child count.
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pics = col.querySelectorAll('picture, img');
      if (!pics.length) return;
      const hasText = col.querySelector('h1, h2, h3, h4, h5, h6, a')
        || (col.textContent || '').trim().length > 0;
      if (!hasText) {
        col.classList.add('columns-feature-img-col');
        // Normalise the collage: images may arrive wrapped in one shared <p> or
        // one <p> each (varies by pipeline). Flatten every <p> so each picture
        // becomes a direct child of the column and a grid item in its own right.
        col.querySelectorAll(':scope > p').forEach((p) => {
          const media = [...p.querySelectorAll(':scope > picture, :scope > img')];
          if (media.length && (p.textContent || '').trim().length === 0) {
            media.forEach((m) => col.insertBefore(m, p));
            p.remove();
          }
        });
        if (col.querySelectorAll(':scope > picture, :scope > img').length > 1) {
          col.classList.add('columns-feature-img-collage');
        }
      }
    });
  });
}
