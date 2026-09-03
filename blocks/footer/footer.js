/**
 * Fetch the footer fragment.
 */
async function fetchFooter() {
  const resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children];
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  // --- Brand column (section 0): logo + social icons ---
  const brandSection = sections[0];
  if (brandSection) {
    const brand = document.createElement('div');
    brand.className = 'footer-brand';

    // The brand link is the first paragraph link (logo image + label).
    const brandLink = brandSection.querySelector('p a');
    if (brandLink) {
      const logo = document.createElement('a');
      logo.href = brandLink.getAttribute('href');
      logo.className = 'footer-logo';
      const icon = document.createElement('span');
      icon.className = 'footer-logo-icon';
      icon.innerHTML = '<svg viewBox="0 0 33 33" fill="currentColor" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"/></svg>';
      logo.append(icon);
      const label = document.createElement('span');
      label.className = 'footer-logo-label';
      label.textContent = brandLink.textContent.trim();
      logo.append(label);
      brand.append(logo);
    }

    // Social icons list
    const socialUl = brandSection.querySelector('ul');
    if (socialUl) {
      const social = document.createElement('ul');
      social.className = 'footer-social';
      [...socialUl.querySelectorAll('a')].forEach((a) => {
        const img = a.querySelector('img');
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        if (img) {
          link.setAttribute('aria-label', img.getAttribute('alt'));
          const icon = img.cloneNode(true);
          link.append(icon);
        } else {
          link.textContent = a.textContent.trim();
        }
        li.append(link);
        social.append(li);
      });
      brand.append(social);
    }
    footer.append(brand);
  }

  // --- Link columns (sections 1+) ---
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  sections.slice(1).forEach((section) => {
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
    const ul = section.querySelector('ul');
    if (!heading && !ul) return;
    const col = document.createElement('div');
    col.className = 'footer-col';
    if (heading) {
      const h = document.createElement('h2');
      h.textContent = heading.textContent.trim();
      col.append(h);
    }
    if (ul) {
      const list = document.createElement('ul');
      [...ul.querySelectorAll('a')].forEach((a) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent.trim();
        li.append(link);
        list.append(li);
      });
      col.append(list);
    }
    columns.append(col);
  });
  footer.append(columns);

  block.append(footer);
}
