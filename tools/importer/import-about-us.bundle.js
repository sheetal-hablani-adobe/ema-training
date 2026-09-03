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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/cards-media.js
  function parse(element, { document }) {
    let cardEls;
    const trendImages = element.querySelectorAll(".trend-card-image");
    const directCount = element.querySelectorAll(":scope > *").length;
    if (trendImages.length > directCount) {
      cardEls = [];
      const imageDivs = element.querySelectorAll(".trend-card-image");
      imageDivs.forEach((imgDiv) => {
        const wrapper = document.createElement("div");
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
          const tagP = document.createElement("p");
          tagP.textContent = tagText;
          parts.push(tagP);
        }
        if (dateText) {
          const dateP = document.createElement("p");
          dateP.textContent = dateText;
          parts.push(dateP);
        }
        const titleEl = document.createElement(heading.tagName.toLowerCase());
        const titleText = heading.textContent.trim();
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = titleText;
          titleEl.appendChild(a);
        } else {
          titleEl.textContent = titleText;
        }
        parts.push(titleEl);
        Array.from(card.querySelectorAll("p")).filter((p) => p.textContent.trim().length > 0 && heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING).forEach((p) => {
          const descP = document.createElement("p");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function isImageOnlyColumn(col) {
    if (!col.querySelector("img, picture")) return false;
    if (col.querySelector("h1, h2, h3, h4, h5, h6, a, button")) return false;
    return col.textContent.trim().length === 0;
  }
  function normaliseImageColumn(col, document) {
    const media = Array.from(col.querySelectorAll("img, picture"));
    if (media.length < 2) return;
    const wrapper = document.createElement("div");
    media.forEach((m) => {
      const node = m.tagName === "IMG" && m.closest("picture") ? m.closest("picture") : m;
      if (node.parentElement === wrapper) return;
      const p = document.createElement("p");
      p.appendChild(node);
      wrapper.appendChild(p);
    });
    col.textContent = "";
    while (wrapper.firstChild) col.appendChild(wrapper.firstChild);
  }
  function parse2(element, { document }) {
    const columnEls = Array.from(element.querySelectorAll(":scope > div")).filter((col) => col.textContent.trim().length > 0 || col.querySelector("img, picture, a"));
    if (!columnEls.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    columnEls.forEach((col) => {
      if (isImageOnlyColumn(col)) normaliseImageColumn(col, document);
    });
    const cells = [];
    cells.push(columnEls.map((col) => col));
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/faq-columns.js
  function parse3(element, { document }) {
    const cells = [];
    const introSource = Array.from(element.children).find(
      (child) => !child.classList.contains("faq-list") && child.querySelector("h1, h2, h3, h4, h5, h6")
    );
    const introNodes = [];
    if (introSource) {
      const heading = introSource.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) introNodes.push(heading);
      introSource.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) introNodes.push(p);
      });
    }
    if (introNodes.length) {
      cells.push([introNodes]);
    }
    const faqList = element.querySelector(".faq-list") || element;
    const items = faqList.querySelectorAll("details.faq-item, details, .faq-item");
    items.forEach((item) => {
      const summary = item.querySelector("summary.faq-question, summary");
      let titleCell = "";
      const titleSpan = summary ? summary.querySelector("span") : null;
      if (titleSpan) {
        titleCell = titleSpan.textContent.trim();
      } else if (summary) {
        titleCell = summary.textContent.trim();
      }
      const answer = item.querySelector(".faq-answer, .faq-content");
      let contentCell = "";
      if (answer) {
        const nodes = Array.from(answer.childNodes).filter((n) => {
          if (n.nodeType === 3) return n.textContent.trim().length > 0;
          return true;
        });
        contentCell = nodes.length ? nodes : answer;
      }
      if (titleCell || contentCell && contentCell !== "") {
        cells.push([titleCell, contentCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "faq-columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-overlay.js
  function parse4(element, { document }) {
    const bgImage = element.querySelector('img.cover-image, img[class*="overlay"], img[class*="background"], img');
    const body = element.querySelector('.card-body, [class*="card-body"], [class*="text-on-overlay"]');
    const heading = (body || element).querySelector('h1, h2, h3, [class*="heading"]');
    const subheading = (body || element).querySelector('p, .subheading, [class*="subheading"]');
    const ctaLinks = Array.from((body || element).querySelectorAll('.button-group a, a.button, a[class*="button"]'));
    if (!heading && !subheading && !ctaLinks.length && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-overlay", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-profile.js
  function parse5(element, { document }) {
    const panes = Array.from(element.querySelectorAll(".tabs-content .tab-pane, .tab-pane"));
    const menuButtons = Array.from(element.querySelectorAll(".tab-menu .tab-menu-link, .tab-menu button, .tab-menu-link"));
    if (!panes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    panes.forEach((pane, i) => {
      const button = menuButtons[i];
      let labelCell = "";
      if (button) {
        const nameEl = button.querySelector("strong");
        labelCell = nameEl ? nameEl.textContent.trim() : button.textContent.trim().replace(/\s+/g, " ");
      }
      if (!labelCell) labelCell = `Tab ${i + 1}`;
      const contentNodes = Array.from(pane.childNodes).filter((n) => {
        if (n.nodeType === 3) return n.textContent.trim().length > 0;
        return true;
      });
      const contentCell = contentNodes.length ? contentNodes : pane;
      cells.push([labelCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-profile", cells });
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

  // tools/importer/import-about-us.js
  var parsers = {
    "cards-media": parse,
    "columns-feature": parse2,
    "faq-columns": parse3,
    "hero-overlay": parse4,
    "tabs-profile": parse5
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "about-us",
    description: "About-us editorial page: two-column intros, image and article card grids, profile tabs, FAQ accordion, and an overlay hero banner.",
    urls: [
      "https://wknd-trendsetters.site/about-us",
      "https://wknd-trendsetters.site/case-studies",
      "https://wknd-trendsetters.site/"
    ],
    blocks: [
      {
        name: "columns-feature",
        instances: [
          "#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl",
          "#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg"
        ]
      },
      {
        name: "cards-media",
        instances: [
          "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm",
          "#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md"
        ]
      },
      {
        name: "tabs-profile",
        instances: [
          "#main-content > section.section:nth-of-type(3) > div.container > div.tabs-wrapper"
        ]
      },
      {
        name: "faq-columns",
        instances: [
          // Primary: the FAQ grid (heading + subheading cell + div.faq-list cell).
          "#main-content > section.section:nth-of-type(5) > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl",
          // Class-based fallback: any grid that actually contains a faq-list, so it
          // never accidentally matches the header/intro grids of the same class.
          "#main-content div.grid-layout.tablet-1-column.grid-gap-xxl:has(div.faq-list)"
        ]
      },
      {
        name: "hero-overlay",
        instances: [
          "#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column"
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
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
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
  var import_about_us_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();
