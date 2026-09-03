/*
 * FAQ Columns Block
 * Two-column FAQ section: an intro (heading + subheading) on the left and an
 * accordion (native <details>/<summary> Q&A list) on the right. On desktop the
 * two columns sit side-by-side; below 900px they stack. The whole block lives
 * inside the normal centered section column, so the layout can never overflow
 * the viewport.
 *
 * Expected initial (authored) structure — a block table where the first content
 * row is the intro (a cell containing a heading + optional subheading) and every
 * subsequent row is one FAQ item: [ question, answer ].
 */
export default function decorate(block) {
  const intro = document.createElement('div');
  intro.className = 'faq-columns-intro';

  const list = document.createElement('div');
  list.className = 'faq-columns-list';

  [...block.children].forEach((row) => {
    const label = row.children[0];
    const body = row.children[1];

    // Intro row: the first cell holds a heading (h1–h6). Move its content into
    // the left column and drop the (empty) second cell.
    if (label && label.querySelector('h1, h2, h3, h4, h5, h6')) {
      intro.append(...label.childNodes);
      row.remove();
      return;
    }

    // FAQ item row: build a native <details>/<summary> accordion entry.
    const summary = document.createElement('summary');
    summary.className = 'faq-columns-item-label';
    if (label) summary.append(...label.childNodes);

    const details = document.createElement('details');
    details.className = 'faq-columns-item';
    details.append(summary);

    if (body) {
      body.className = 'faq-columns-item-body';
      details.append(body);
    }

    list.append(details);
    row.remove();
  });

  block.textContent = '';
  block.append(intro, list);
}
