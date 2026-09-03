/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-trends-landing.js
  var import_trends_landing_exports = {};
  __export(import_trends_landing_exports, {
    default: () => import_trends_landing_default
  });

  // tools/importer/parsers/cards-media.js
  function parse(element, { document: document2 }) {
    let cardEls;
    const trendImages = element.querySelectorAll(".trend-card-image");
    const directCount = element.querySelectorAll(":scope > *").length;
    if (trendImages.length > directCount) {
      cardEls = [];
      const imageDivs = element.querySelectorAll(".trend-card-image");
      imageDivs.forEach((imgDiv) => {
        const wrapper = document2.createElement("div");
        const anchor = imgDiv.closest("a[href]");
        if (anchor && anchor.getAttribute("href")) {
          wrapper.setAttribute("data-card-href", anchor.getAttribute("href"));
        }
        wrapper.appendChild(imgDiv.cloneNode(true));
        let sib = imgDiv.nextElementSibling;
        if (sib && sib.classList.contains("trend-card-body")) {
          wrapper.appendChild(sib.cloneNode(true));
        }
        cardEls.push(wrapper);
      });
    } else {
      cardEls = Array.from(element.querySelectorAll(":scope > *"));
    }
    const cells = [];
    cardEls.forEach((card) => {
      const img = card.querySelector("img");
      const heading = card.querySelector("h1, h2, h3, h4, h5, h6");
      let textCell = "";
      if (heading) {
        const href = card.tagName === "A" ? card.getAttribute("href") : card.getAttribute("data-card-href") || card.querySelector("a") && card.querySelector("a").getAttribute("href");
        const parts = [];
        const meta = card.querySelector(".article-card-meta");
        let tagText = "";
        let dateText = "";
        if (meta) {
          const metaSpans = Array.from(meta.querySelectorAll("span")).filter((s) => s.textContent.trim().length > 0);
          tagText = metaSpans[0] ? metaSpans[0].textContent.trim() : "";
          dateText = metaSpans[1] ? metaSpans[1].textContent.trim() : "";
        } else {
          const body = heading.parentElement || card;
          const labelEl = Array.from(body.children).find((el) => el !== heading && !el.querySelector("img") && !/^H[1-6]$/.test(el.tagName) && el.textContent.trim().length > 0 && el.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
          if (labelEl) tagText = labelEl.textContent.trim();
        }
        if (tagText) {
          const tagP = document2.createElement("p");
          tagP.textContent = tagText;
          parts.push(tagP);
        }
        if (dateText) {
          const dateP = document2.createElement("p");
          dateP.textContent = dateText;
          parts.push(dateP);
        }
        const titleEl = document2.createElement(heading.tagName.toLowerCase());
        const titleText = heading.textContent.trim();
        if (href) {
          const a = document2.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          titleEl.appendChild(a);
        } else {
          titleEl.textContent = titleText;
        }
        parts.push(titleEl);
        Array.from(card.querySelectorAll("p")).filter((p) => p.textContent.trim().length > 0 && heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING).forEach((p) => {
          const descP = document2.createElement("p");
          descP.textContent = p.textContent.trim();
          parts.push(descP);
        });
        textCell = parts;
      } else {
        const textParts = Array.from(
          card.querySelectorAll("p, span")
        ).filter((el) => el.textContent.trim().length > 0);
        if (textParts.length) textCell = textParts;
      }
      const imageCell = img || "";
      if (img || (Array.isArray(textCell) ? textCell.length : textCell)) {
        cells.push([imageCell, textCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function isImageOnlyColumn(col) {
    if (!col.querySelector("img, picture")) return false;
    if (col.querySelector("h1, h2, h3, h4, h5, h6, a, button")) return false;
    return col.textContent.trim().length === 0;
  }
  function normaliseImageColumn(col, document2) {
    const media = Array.from(col.querySelectorAll("img, picture"));
    if (media.length < 2) return;
    const wrapper = document2.createElement("div");
    media.forEach((m) => {
      const node = m.tagName === "IMG" && m.closest("picture") ? m.closest("picture") : m;
      if (node.parentElement === wrapper) return;
      const p = document2.createElement("p");
      p.appendChild(node);
      wrapper.appendChild(p);
    });
    col.textContent = "";
    while (wrapper.firstChild) col.appendChild(wrapper.firstChild);
  }
  function parse2(element, { document: document2 }) {
    const columnEls = Array.from(element.querySelectorAll(":scope > div")).filter((col) => col.textContent.trim().length > 0 || col.querySelector("img, picture, a"));
    if (!columnEls.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    columnEls.forEach((col) => {
      if (isImageOnlyColumn(col)) normaliseImageColumn(col, document2);
    });
    const cells = [];
    cells.push(columnEls.map((col) => col));
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Skip-to-content accessibility link (first child of body)
        ".skip-link",
        // Top site navigation bar (logo, nav-menu, mega-menu, mobile toggle) — precedes <main>
        ".navbar"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Site footer (logo, social icons, footer nav columns) — follows </main>
        "footer.footer",
        // Safe leftover/non-authorable elements
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SECTION_STYLE_BY_CLASS = {
    "secondary-section": "grey",
    "accent-section": "accent"
  };
  function resolveSectionStyle(sectionEl, template) {
    const classes = Object.keys(SECTION_STYLE_BY_CLASS);
    for (let i = 0; i < classes.length; i += 1) {
      if (sectionEl.classList.contains(classes[i])) return SECTION_STYLE_BY_CLASS[classes[i]];
    }
    const blocks = template && Array.isArray(template.blocks) ? template.blocks : [];
    for (let i = 0; i < blocks.length; i += 1) {
      const b = blocks[i];
      if (!b.section || !Array.isArray(b.instances)) continue;
      const hit = b.instances.some((sel) => {
        try {
          return sectionEl.matches(sel);
        } catch (e) {
          return false;
        }
      });
      if (hit) return b.section;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const template = payload && payload.template || {};
    const mainContent = element.querySelector("#main-content") || element;
    const sections = Array.from(
      mainContent.querySelectorAll(":scope > header.section, :scope > section.section")
    );
    if (sections.length < 2) return;
    sections.forEach((sectionEl, index) => {
      if (index > 0) {
        sectionEl.before(document.createElement("hr"));
      }
      const style = resolveSectionStyle(sectionEl, template);
      if (style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { Style: style }
        });
        sectionEl.append(metadataBlock);
      }
    });
  }

  // tools/importer/import-trends-landing.js
  var parsers = {
    "cards-media": parse,
    "columns-feature": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "trends-landing",
    description: "Trends landing page (hero + feature/card grids + accent CTA band)",
    urls: [
      "https://wknd-trendsetters.site/fashion-trends-young-adults",
      "https://wknd-trendsetters.site/fashion-trends-of-the-season"
    ],
    blocks: [
      {
        name: "columns-feature",
        instances: [
          "#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl",
          // Split feature: a 2-column grid that stacks single-column (tablet-1-column
          // grid-gap-lg). Exclude desktop-N-column so it never grabs the 3-up feature
          // card grid (desktop-3-column tablet-1-column grid-gap-lg), which is cards-media.
          '#main-content > section.section > div.container > div.grid-layout.tablet-1-column.grid-gap-lg:not([class*="desktop-"])'
        ]
      },
      {
        name: "cards-media",
        instances: [
          "#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-1-column.grid-gap-xxl",
          "#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-1-column.grid-gap-lg",
          "#main-content > section.section > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md",
          "#main-content > section.section > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm",
          "#main-content > section.section > div.container > div.grid-layout.desktop-3-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_trends_landing_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const heroButtonGroup = document2.querySelector(
        "#main-content > header.section.secondary-section .button-group"
      );
      if (heroButtonGroup) {
        const heroLinks = heroButtonGroup.querySelectorAll(":scope > a");
        heroLinks.forEach((a, i) => {
          if (i > 0) a.remove();
        });
      }
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_trends_landing_exports);
})();
