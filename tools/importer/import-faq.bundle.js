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

  // tools/importer/import-faq.js
  var import_faq_exports = {};
  __export(import_faq_exports, {
    default: () => import_faq_default
  });

  // tools/importer/parsers/accordion-faq.js
  function parse(element, { document: document2 }) {
    const items = element.querySelectorAll("details.faq-item, details, .faq-item");
    const cells = [];
    items.forEach((item) => {
      const summary = item.querySelector("summary.faq-question, summary");
      let titleCell;
      const titleSpan = summary ? summary.querySelector("span") : null;
      if (titleSpan) {
        titleCell = titleSpan.textContent.trim();
      } else if (summary) {
        titleCell = summary.textContent.trim();
      } else {
        titleCell = "";
      }
      const answer = item.querySelector(".faq-answer, .faq-content");
      let contentCell;
      if (answer) {
        const nodes = Array.from(answer.childNodes).filter((n) => {
          if (n.nodeType === 3) return n.textContent.trim().length > 0;
          return true;
        });
        contentCell = nodes.length ? nodes : answer;
      } else {
        contentCell = "";
      }
      if (titleCell || contentCell && contentCell !== "") {
        cells.push([titleCell, contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
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

  // tools/importer/import-faq.js
  var parsers = {
    "accordion-faq": parse,
    "columns-feature": parse2
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "faq",
    description: "FAQ page: hero + accordion FAQ list + contact columns + accent CTA",
    urls: [
      "https://wknd-trendsetters.site/faq"
    ],
    blocks: [
      {
        name: "columns-feature",
        instances: [
          "#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl",
          "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl"
        ]
      },
      {
        name: "accordion-faq",
        instances: [
          "#main-content > section.section:nth-of-type(1) div.faq-list"
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
  var import_faq_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
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
  return __toCommonJS(import_faq_exports);
})();
