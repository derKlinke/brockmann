import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
    Grid,
    GridItem,
    renderTypoPresetVarsCss,
    SITE_TYPO_PRESET_CONFIG,
    SITE_TYPO_PRESET_SELECTOR,
    TypoH1,
    TypoRoot,
    createTypoConfig,
    DEFAULT_TYPO_BASE_SIZE,
    ensureGridDebug,
} from "../dist/index.js";
import fs from "node:fs";

class MockElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.id = "";
        this.className = "";
        this.dataset = {};
        this.style = {};
        this.children = [];
        this.parentElement = null;
        this.attributes = new Map();
        this.listeners = new Map();
    }

    append(...nodes) {
        for (const node of nodes) {
            node.parentElement = this;
            this.children.push(node);
        }
    }

    appendChild(node) {
        this.append(node);
        return node;
    }

    replaceChildren(...nodes) {
        this.children = [];
        this.append(...nodes);
    }

    setAttribute(name, value) {
        if (name === "id") {
            this.id = value;
            return;
        }

        if (name === "class") {
            this.className = value;
            return;
        }

        this.attributes.set(name, value);
    }

    getAttribute(name) {
        if (name === "id") return this.id || null;
        if (name === "class") return this.className || null;
        return this.attributes.get(name) ?? null;
    }

    hasAttribute(name) {
        if (name === "id") return this.id.length > 0;
        if (name === "class") return this.className.length > 0;
        return this.attributes.has(name);
    }

    removeAttribute(name) {
        if (name === "id") {
            this.id = "";
            return;
        }

        if (name === "class") {
            this.className = "";
            return;
        }

        this.attributes.delete(name);
    }

    toggleAttribute(name, force) {
        const shouldSet = force ?? !this.hasAttribute(name);
        if (shouldSet) {
            this.setAttribute(name, "");
            return;
        }

        this.removeAttribute(name);
    }

    addEventListener(type, listener) {
        const listeners = this.listeners.get(type) ?? [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] ?? null;
    }

    querySelectorAll(selector) {
        const matches = [];

        for (const child of this.children) {
            if (matchesSelector(child, selector)) {
                matches.push(child);
            }

            matches.push(...child.querySelectorAll(selector));
        }

        return matches;
    }
}

class MockDocument {
    constructor() {
        this.body = new MockElement("body");
        this.documentElement = new MockElement("html");
        this.documentElement.append(this.body);
        this.fonts = { ready: { then() {} } };
        this.listeners = new Map();
        this.cookies = new Map();
    }

    createElement(tagName) {
        return new MockElement(tagName);
    }

    getElementById(id) {
        return findById(this.documentElement, id);
    }

    querySelector(selector) {
        return this.documentElement.querySelector(selector);
    }

    querySelectorAll(selector) {
        return this.documentElement.querySelectorAll(selector);
    }

    addEventListener(type, listener) {
        const listeners = this.listeners.get(type) ?? [];
        listeners.push(listener);
        this.listeners.set(type, listeners);
    }

    get cookie() {
        return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
    }

    set cookie(value) {
        const [pair = "", ...parts] = value.split(";").map((part) => part.trim());
        const [name = "", rawValue = ""] = pair.split("=");
        if (!name) return;

        const shouldDelete = parts.some((part) => part === "Max-Age=0");
        if (shouldDelete) {
            this.cookies.delete(name);
            return;
        }

        this.cookies.set(name, rawValue);
    }
}

class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

class MockMutationObserver {
    constructor(callback) {
        this.callback = callback;
    }

    observe() {
        this.callback();
    }

    disconnect() {}
}

function matchesSelector(node, selector) {
    if (selector.startsWith("#")) {
        return node.id === selector.slice(1);
    }

    const attributeMatch = selector.match(/^\[(.+?)(?:="(.*)")?\]$/u);
    if (attributeMatch) {
        const [, name, expected] = attributeMatch;
        const value = node.getAttribute(name);
        if (expected == null) return value != null;
        return value === expected;
    }

    return node.tagName.toLowerCase() === selector.toLowerCase();
}

function findById(node, id) {
    if (node.id === id) return node;

    for (const child of node.children) {
        const match = findById(child, id);
        if (match) return match;
    }

    return null;
}

function setupRuntime(cookieValue = "") {
    const document = new MockDocument();
    const toggle = document.createElement("button");
    toggle.setAttribute("data-grid-debug-toggle", "");
    document.body.append(toggle);
    if (cookieValue) {
        document.cookie = cookieValue;
    }

    const rafCalls = [];
    const window = {
        innerWidth: 1280,
        innerHeight: 720,
        scrollY: 0,
        addEventListener() {},
    };

    globalThis.HTMLElement = MockElement;
    globalThis.MutationObserver = MockMutationObserver;
    globalThis.ResizeObserver = MockResizeObserver;
    globalThis.cancelAnimationFrame = () => {};
    globalThis.document = document;
    globalThis.requestAnimationFrame = () => {
        rafCalls.push(1);
        return rafCalls.length;
    };
    globalThis.window = window;
    window.__brockmannGridDebugInit = undefined;
    window.__brockmannGridDebug = undefined;

    return { document, rafCalls, toggle };
}

function cleanupRuntime() {
    delete globalThis.HTMLElement;
    delete globalThis.MutationObserver;
    delete globalThis.ResizeObserver;
    delete globalThis.cancelAnimationFrame;
    delete globalThis.document;
    delete globalThis.requestAnimationFrame;
    delete globalThis.window;
}

test("derives grid gutters from the baseline grid", () => {
    const config = createTypoConfig({ baseSize: 14, r: 1.33 });

    assert.equal(config.vars["--grid-gutter"], `calc(${config.baselineGrid}px * 1)`);
    assert.equal(config.vars["--grid-gutter-wide"], `calc(${config.baselineGrid}px * 1)`);
    assert.equal(config.vars["--typo-heading-text-transform"], "lowercase");
    assert.equal(config.headings[1].size, config.steps[6]);
    assert.equal(config.headings[2].size, config.steps[4]);
    assert.equal(config.headings[6].size, config.steps[0]);
    assert.equal(config.vars["--typo-step-0"], `${config.steps[0]}px`);
});

test("uses 13px as the default Brockmann base size", () => {
    const markup = renderToStaticMarkup(
        React.createElement(TypoRoot, null, React.createElement(TypoH1, null, "title"))
    );

    assert.equal(DEFAULT_TYPO_BASE_SIZE, 13);
    assert.match(markup, /--typo-base-size:13px/);
});

test("can render a typo root without injecting computed inline vars", () => {
    const markup = renderToStaticMarkup(
        React.createElement(
            TypoRoot,
            { injectVars: false, className: "typo-preset-site" },
            React.createElement(TypoH1, null, "title")
        )
    );

    assert.doesNotMatch(markup, /style="--typo-base-size:/);
    assert.match(markup, /class="typo-root typo-preset-site"/);
});

test("keeps the site preset css generated from Brockmann math", () => {
    const presetSource = fs.readFileSync(new URL("../styles/presets/site.css", import.meta.url), "utf8");
    const computedVars = renderTypoPresetVarsCss({
        selector: SITE_TYPO_PRESET_SELECTOR,
        config: SITE_TYPO_PRESET_CONFIG,
    });

    assert.match(
        presetSource,
        /Generated from scripts\/generate-presets\.mjs\. Do not edit this file directly\./
    );
    assert.ok(presetSource.includes(computedVars));
    assert.match(presetSource, /--typo-body-color:/);
});

test("renders snap-to-grid headings and single-column row-only grids", () => {
    const heading = renderToStaticMarkup(
        React.createElement(TypoH1, { snapToGridBottom: true }, "title")
    );
    const grid = renderToStaticMarkup(
        React.createElement(
            Grid,
            { rowsOnly: true },
            React.createElement(GridItem, { columnSpan: "full" }, "content")
        )
    );

    assert.match(heading, /typo-heading-snap-grid-bottom/);
    assert.match(grid, /--brockmann-grid-columns-md:1/);
    assert.match(grid, /data-brockmann-grid-rows-only/);
});

test("allows opting out of lowercase headings at the root config level", () => {
    const markup = renderToStaticMarkup(
        React.createElement(
            TypoRoot,
            { lowercaseHeadings: false },
            React.createElement(TypoH1, null, "Title Case")
        )
    );

    assert.match(markup, /--typo-heading-text-transform:none/);
});

test("restores and toggles grid debug state", () => {
    const { document, rafCalls, toggle } = setupRuntime("brockmann_grid_debug=1");
    const controller = ensureGridDebug();

    assert.ok(controller);
    assert.equal(document.documentElement.getAttribute("data-brockmann-grid-debug"), "on");
    assert.equal(toggle.getAttribute("aria-pressed"), "true");

    controller.renderAll();
    controller.toggle();

    assert.equal(document.documentElement.hasAttribute("data-brockmann-grid-debug"), false);
    assert.equal(toggle.getAttribute("aria-pressed"), "false");
    assert.ok(rafCalls.length >= 2);

    cleanupRuntime();
});
