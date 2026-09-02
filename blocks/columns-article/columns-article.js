export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-article-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-article-img-col');
        }
      }
    });
  });

  // Tag the text column parts so CSS can style them without :has().
  // The text column is the cell that holds the <h1> title.
  const textCol = [...block.querySelectorAll(':scope > div > div')]
    .find((col) => col.querySelector('h1'));
  if (!textCol) return;

  [...textCol.children].forEach((el) => {
    if (el.tagName !== 'P') return;
    const links = el.querySelectorAll(':scope > a');
    // Breadcrumb: a paragraph of 2+ links whose only other content is a literal
    // separator (the source's inline chevron SVG is dropped on import). Strip the
    // separator text nodes so CSS can render a chevron via `a + a::before`.
    const nonLinkText = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent.trim())
      .join('');
    if (links.length >= 2 && /^[>›»/|\-\s]*$/.test(nonLinkText)) {
      [...el.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE)
        .forEach((n) => n.remove());
      el.classList.add('columns-article-breadcrumbs');
    }
  });

  // Remaining paragraphs after the heading, in order: byline, meta, tag.
  const metaParas = [...textCol.children].filter(
    (el) => el.tagName === 'P' && !el.classList.contains('columns-article-breadcrumbs'),
  );
  const markers = ['columns-article-byline', 'columns-article-meta', 'columns-article-tag'];
  metaParas.forEach((p, i) => {
    if (markers[i]) p.classList.add(markers[i]);
  });
}
