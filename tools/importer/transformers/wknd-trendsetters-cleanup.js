/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable site chrome. All selectors verified against
 * migration-work/cleaned.html for the about-us template.
 *
 * NOTE: the authorable page hero is `<header class="section secondary-section">`
 * INSIDE `<main>` (mapped to columns-feature / section-rc1), so a bare `header`
 * selector must NEVER be used here — it would delete authorable content.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Skip-to-content accessibility link (first child of body)
      '.skip-link',
      // Top site navigation bar (logo, nav-menu, mega-menu, mobile toggle) — precedes <main>
      '.navbar',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // In-content breadcrumb navigation (non-authorable)
      '.breadcrumbs',
      // Site footer (logo, social icons, footer nav columns) — follows </main>
      'footer.footer',
      // Safe leftover/non-authorable elements
      'noscript',
    ]);
  }
}
