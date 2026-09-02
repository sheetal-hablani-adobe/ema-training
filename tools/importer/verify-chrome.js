#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * verify-chrome.js — post-migration safety net.
 *
 * Header, nav, and footer are GLOBAL chrome in Edge Delivery: they are not
 * authored per page. Every page's skeleton includes empty <header>/<footer>
 * elements, and scripts.js loads them lazily by fetching two shared fragments:
 *   - /nav.plain.html     (rendered by blocks/header)
 *   - /footer.plain.html  (rendered by blocks/footer)
 *
 * So a page shows chrome only when those two fragments exist and are published
 * on the environment being viewed. That is a PER-ENVIRONMENT concern, not a
 * per-page one. This script confirms both fragments resolve (HTTP 200) and are
 * non-empty on a given base URL, so you never ship pages with blank chrome.
 *
 * Usage:
 *   node tools/importer/verify-chrome.js [baseUrl]
 *
 * baseUrl defaults to the local dev server. Examples:
 *   node tools/importer/verify-chrome.js
 *   node tools/importer/verify-chrome.js http://localhost:3000
 *   node tools/importer/verify-chrome.js https://main--ema-training--sheetal-hablani-adobe.aem.live
 *
 * On localhost the fragments live under /content; in DA/EDS they are served at
 * the site root — this checks both, matching the dual-fetch in header.js/footer.js.
 *
 * Exit code 0 = both chrome fragments present; 1 = at least one missing/empty.
 */

const DEFAULT_BASE = 'http://localhost:3000';

// Each chrome fragment, with the dual-fetch candidate paths (content first,
// then root) that mirror blocks/header/header.js and blocks/footer/footer.js.
const CHROME = [
  { name: 'nav (header)', paths: ['/content/nav.plain.html', '/nav.plain.html'] },
  { name: 'footer', paths: ['/content/footer.plain.html', '/footer.plain.html'] },
];

async function fetchFragment(base, path) {
  try {
    const resp = await fetch(`${base}${path}`, { redirect: 'follow' });
    if (!resp.ok) return { ok: false, status: resp.status };
    const text = (await resp.text()).trim();
    return { ok: text.length > 0, status: resp.status, length: text.length };
  } catch (e) {
    return { ok: false, status: 0, error: e.message };
  }
}

/** Return the first candidate path that resolves to a non-empty fragment. */
async function findFragment(base, paths) {
  const results = await Promise.all(paths.map((path) => fetchFragment(base, path)
    .then((res) => ({ path, ...res }))));
  return results.find((r) => r.ok) || null;
}

async function verify(base) {
  console.log(`\nVerifying global chrome on: ${base}\n`);

  const found = await Promise.all(CHROME.map((item) => findFragment(base, item.paths)));
  const allOk = CHROME.every((item, i) => {
    const hit = found[i];
    if (hit) {
      console.log(`  ✅ ${item.name}: found at ${hit.path} (${hit.length} bytes)`);
      return true;
    }
    console.log(`  ❌ ${item.name}: MISSING — tried ${item.paths.join(', ')}`);
    return false;
  });

  console.log('');
  if (allOk) {
    console.log('✅ Chrome OK — header/nav and footer fragments are present. Every page on this environment will render them.');
  } else {
    console.log('🚫 Chrome INCOMPLETE — pages on this environment will show blank header/footer.');
    console.log('   Fix: migrate and publish the /nav and /footer documents to this environment,');
    console.log('   then re-run this check. (See AGENTS.md "Global chrome" section.)');
  }
  return allOk;
}

const base = (process.argv[2] || DEFAULT_BASE).replace(/\/$/, '');
verify(base).then((ok) => process.exit(ok ? 0 : 1));
