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

  // tools/importer/import-blog.js
  var import_blog_exports = {};
  __export(import_blog_exports, {
    default: () => import_blog_default
  });

  // tools/importer/parsers/columns-article.js
  function clean(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }
  function parse(element, { document }) {
    const columnEls = Array.from(element.querySelectorAll(":scope > div"));
    const imageCol = columnEls.find((col) => col.querySelector("img"));
    const textCol = columnEls.find((col) => col !== imageCol && (col.querySelector("h1, h2, h3") || col.querySelector(".breadcrumbs, .tag")));
    const coverImage = imageCol ? imageCol.querySelector("img") : null;
    if (!coverImage && !textCol) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (textCol) {
      const breadcrumbs = textCol.querySelector(".breadcrumbs");
      if (breadcrumbs) {
        const links = Array.from(breadcrumbs.querySelectorAll("a"));
        if (links.length) {
          const p = document.createElement("p");
          links.forEach((a, i) => {
            if (i > 0) p.appendChild(document.createTextNode(" > "));
            p.appendChild(a);
          });
          contentCell.push(p);
        }
      }
      const heading = textCol.querySelector("h1, h2, h3");
      if (heading) {
        const h1 = document.createElement("h1");
        h1.textContent = clean(heading.textContent);
        contentCell.push(h1);
      }
      const flexRows = Array.from(textCol.querySelectorAll(".flex-horizontal"));
      flexRows.forEach((row) => {
        const text = clean(row.textContent);
        if (text) {
          const p = document.createElement("p");
          p.textContent = text;
          contentCell.push(p);
        }
      });
      const tag = textCol.querySelector(".tag");
      if (tag) {
        const text = clean(tag.textContent);
        if (text) {
          const p = document.createElement("p");
          p.textContent = text;
          contentCell.push(p);
        }
      }
    }
    const imageCell = coverImage ? [coverImage] : [""];
    const cells = [];
    cells.push([imageCell, contentCell.length ? contentCell : [""]]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-spec.js
  function parse2(element, { document }) {
    const rows = Array.from(element.querySelectorAll("tr"));
    if (!rows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const unwrap = (cell) => {
      if (!cell) return "";
      const nodes = Array.from(cell.childNodes).filter((n) => n.nodeType !== Node.TEXT_NODE || n.textContent.trim().length);
      if (!nodes.length) return cell.textContent.trim();
      return nodes.length === 1 ? nodes[0] : nodes;
    };
    rows.forEach((tr) => {
      const rowCells = Array.from(tr.querySelectorAll(":scope > th, :scope > td"));
      if (!rowCells.length) return;
      cells.push([unwrap(rowCells[0]), unwrap(rowCells[1])]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "table-spec", cells });
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

  // tools/importer/import-blog.js
  var parsers = {
    "columns-article": parse,
    "table-spec": parse2
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "blog",
    description: "Blog article page: two-column article header (cover image + title/byline/meta/tag) and a long-form article body with an embedded spec table.",
    urls: [
      "https://wknd-trendsetters.site/blog/ace-pro-court-polo"
    ],
    blocks: [
      {
        name: "columns-article",
        instances: [
          "#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg"
        ]
      },
      {
        name: "table-spec",
        instances: [
          "#main-content > section.section:nth-of-type(2) table"
        ]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_blog_default = {
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
  return __toCommonJS(import_blog_exports);
})();
