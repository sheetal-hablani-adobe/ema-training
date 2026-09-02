// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment.
 */
async function fetchNav() {
  const resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Normalize: the DA/EDS markdown pipeline wraps each <li>'s leading content
  // in a <p> (e.g. `<li><p>Trends</p><ul>` and `<li><p><a>About</a></p>`),
  // whereas the raw fragment served on localhost keeps it as bare text/links
  // (`<li>Trends<ul>`). Unwrap those <p> wrappers so both forms produce the
  // same structure the label/link extraction below expects.
  tmp.querySelectorAll('li > p').forEach((p) => {
    p.replaceWith(...p.childNodes);
  });
  return tmp;
}

/** Build the caret icon used on dropdown triggers. */
function caret() {
  const span = document.createElement('span');
  span.className = 'nav-caret';
  span.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return span;
}

/** Generic decorative bullet icon for mega-menu items. */
function itemIcon() {
  const span = document.createElement('span');
  span.className = 'nav-item-icon';
  span.innerHTML = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4Zm0 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10Z"/><path d="M16 10a6 6 0 1 0 6 6 6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z"/></svg>';
  return span;
}

/**
 * Read a list item's own label — the text that belongs to the <li> itself,
 * excluding any nested <ul> (its submenu) and ignoring surrounding whitespace.
 * Works whether the leading content is bare text (`<li>Trends<ul>`) or was
 * wrapped in a <p> by the DA/EDS pipeline (`<li><p>Trends</p><ul>`).
 */
function ownLabel(li) {
  let text = '';
  li.childNodes.forEach((node) => {
    if (node.nodeName === 'UL') return; // skip the submenu
    text += node.textContent;
  });
  return text.trim();
}

/**
 * Determine whether a top-level <li> is a mega-menu (nested groups that
 * themselves contain lists) vs a simple dropdown (a flat list of links).
 */
function isMegaMenu(topLi) {
  const innerUl = topLi.querySelector(':scope > ul');
  if (!innerUl) return false;
  return [...innerUl.children].some((li) => li.querySelector(':scope > ul'));
}

/** Build a mega-menu panel from a top-level <li>. */
function buildMegaPanel(topLi) {
  const panel = document.createElement('div');
  panel.className = 'nav-mega';
  const grid = document.createElement('div');
  grid.className = 'nav-mega-grid';

  const groups = [...topLi.querySelectorAll(':scope > ul > li')];
  groups.forEach((groupLi) => {
    const groupList = groupLi.querySelector(':scope > ul');
    if (groupList) {
      // A titled group of icon links.
      const col = document.createElement('div');
      col.className = 'nav-mega-col';
      const heading = document.createElement('h3');
      heading.textContent = ownLabel(groupLi);
      col.append(heading);
      const list = document.createElement('ul');
      [...groupList.children].forEach((itemLi) => {
        const a = itemLi.querySelector('a');
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.className = 'nav-mega-item';
        link.append(itemIcon());
        const text = document.createElement('span');
        const title = document.createElement('strong');
        title.textContent = a.textContent.trim();
        const desc = document.createElement('span');
        desc.className = 'nav-mega-desc';
        desc.textContent = itemLi.textContent.replace(a.textContent, '').trim();
        text.append(title, desc);
        link.append(text);
        item.append(link);
        list.append(item);
      });
      col.append(list);
      grid.append(col);
    } else {
      // The featured promo card (a single link with heading + description + CTA).
      const a = groupLi.querySelector('a');
      const promo = document.createElement('a');
      promo.href = a.getAttribute('href');
      promo.className = 'nav-mega-promo';
      const rest = groupLi.textContent.replace(a.textContent, '').trim();
      const heading = document.createElement('span');
      heading.className = 'nav-mega-promo-title';
      heading.textContent = a.textContent.trim();
      const desc = document.createElement('span');
      desc.className = 'nav-mega-promo-desc';
      // Everything except the trailing "Discover" CTA word.
      desc.textContent = rest.replace(/\s*Discover\s*$/, '').trim();
      const cta = document.createElement('span');
      cta.className = 'nav-mega-promo-cta';
      cta.textContent = 'Discover';
      promo.append(heading, desc, cta);
      grid.append(promo);
    }
  });

  panel.append(grid);
  return panel;
}

/** Build a simple dropdown panel from a top-level <li>. */
function buildDropdownPanel(topLi) {
  const panel = document.createElement('div');
  panel.className = 'nav-dropdown';
  const list = document.createElement('ul');
  [...topLi.querySelectorAll(':scope > ul > li')].forEach((li) => {
    const a = li.querySelector('a');
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    item.append(link);
    list.append(item);
  });
  panel.append(list);
  return panel;
}

/** Close all open nav sections. */
function closeAllSections(sectionsWrapper) {
  sectionsWrapper.querySelectorAll('.nav-item.has-panel').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children];
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  // --- Brand (section 0) ---
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandLink = sections[0]?.querySelector('a');
  if (brandLink) {
    const a = document.createElement('a');
    a.href = brandLink.getAttribute('href');
    a.className = 'nav-logo';
    a.innerHTML = '<span class="nav-logo-icon"><svg viewBox="0 0 33 33" fill="currentColor" aria-hidden="true"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z"/></svg></span>';
    const label = document.createElement('span');
    label.className = 'nav-logo-label';
    label.textContent = brandLink.textContent.trim();
    a.append(label);
    brand.append(a);
  }

  // --- Sections / main nav (section 1) ---
  const sectionsWrapper = document.createElement('div');
  sectionsWrapper.className = 'nav-sections';
  const topUl = sections[1]?.querySelector(':scope > ul');
  const menu = document.createElement('ul');
  menu.className = 'nav-menu';
  if (topUl) {
    [...topUl.children].forEach((topLi) => {
      const item = document.createElement('li');
      item.className = 'nav-item';
      const label = ownLabel(topLi);
      const directLink = topLi.querySelector(':scope > a');
      const hasPanel = !!topLi.querySelector(':scope > ul');

      const trigger = document.createElement(directLink && !hasPanel ? 'a' : 'button');
      trigger.className = 'nav-trigger';
      if (directLink && !hasPanel) {
        trigger.href = directLink.getAttribute('href');
        trigger.textContent = directLink.textContent.trim();
      } else {
        trigger.type = 'button';
        trigger.setAttribute('aria-haspopup', 'true');
        const t = document.createElement('span');
        t.textContent = label;
        trigger.append(t, caret());
      }
      item.append(trigger);

      if (hasPanel) {
        item.classList.add('has-panel');
        item.setAttribute('aria-expanded', 'false');
        const panel = isMegaMenu(topLi) ? buildMegaPanel(topLi) : buildDropdownPanel(topLi);
        item.append(panel);

        // Desktop: hover open/close. Mobile: click toggle.
        item.addEventListener('mouseenter', () => {
          if (isDesktop.matches) item.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('mouseleave', () => {
          if (isDesktop.matches) item.setAttribute('aria-expanded', 'false');
        });
        trigger.addEventListener('click', (e) => {
          if (isDesktop.matches) return;
          e.preventDefault();
          const open = item.getAttribute('aria-expanded') === 'true';
          closeAllSections(sectionsWrapper);
          item.setAttribute('aria-expanded', open ? 'false' : 'true');
        });
      }
      menu.append(item);
    });
  }
  sectionsWrapper.append(menu);

  // --- Tools / CTA (section 2) ---
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const ctaLink = sections[2]?.querySelector('a');
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href');
    a.className = 'nav-cta';
    a.textContent = ctaLink.textContent.trim();
    tools.append(a);
  }

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('button');
  hamburger.className = 'nav-hamburger';
  hamburger.type = 'button';
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  hamburger.addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', open ? 'false' : 'true');
    hamburger.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    document.body.style.overflowY = open || isDesktop.matches ? '' : 'hidden';
  });

  nav.append(brand, hamburger, sectionsWrapper, tools);

  // Reset state when crossing the desktop/mobile boundary.
  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation');
    document.body.style.overflowY = '';
    closeAllSections(sectionsWrapper);
  });

  // Close open desktop panels on Escape.
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllSections(sectionsWrapper);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
