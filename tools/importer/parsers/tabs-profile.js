/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-profile. Base: tabs.
 * Source: about-us template, section 3 (div.tabs-wrapper).
 * Generated for DA project.
 *
 * Structure (from library-description.txt): Tabs is a 2-column block.
 * First row = block name. Each subsequent row = one tab:
 *   [ tab-label cell, tab-content cell ].
 *
 * Source: the wrapper holds a `.tabs-content` with N `.tab-pane` panels
 * (the content shown per tab) and a `.tab-menu` with N `.tab-menu-link`
 * buttons (the labels). Panels and buttons are paired by index. The label
 * is taken from the menu button's name (falls back to the button text);
 * the content is the tab-pane's inner content (image + name/role + quote).
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content .tab-pane, .tab-pane'));
  const menuButtons = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link, .tab-menu button, .tab-menu-link'));

  // Empty-block guard.
  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  panes.forEach((pane, i) => {
    // Label: prefer the corresponding menu button's name (first strong),
    // fall back to the button's full text, then to a generic label.
    const button = menuButtons[i];
    let labelCell = '';
    if (button) {
      const nameEl = button.querySelector('strong');
      labelCell = nameEl ? nameEl.textContent.trim() : button.textContent.trim().replace(/\s+/g, ' ');
    }
    if (!labelCell) labelCell = `Tab ${i + 1}`;

    // Content: the pane's inner content. Use its direct meaningful children.
    const contentNodes = Array.from(pane.childNodes).filter((n) => {
      if (n.nodeType === 3) return n.textContent.trim().length > 0;
      return true;
    });
    const contentCell = contentNodes.length ? contentNodes : pane;

    cells.push([labelCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-profile', cells });
  element.replaceWith(block);
}
