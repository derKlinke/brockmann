import {
    GRID_CONTAINER_SELECTOR,
    GRID_DEBUG_COOKIE_NAME,
    GRID_DEBUG_ENABLED_VALUE,
    GRID_DEBUG_GLOBAL_KEY,
    GRID_DEBUG_HTML_ATTR,
    GRID_DEBUG_INIT_KEY,
    GRID_DEBUG_OVERLAY_ID,
    GRID_DEBUG_TOGGLE_SELECTOR,
    GRID_SHELL_SELECTOR,
} from "./grid-debug-constants";
import {
    addHatch,
    addLine,
    collectMetricsForShell,
    createScene,
    getShellDepth,
    paintScene,
    updateResizeObservers,
    type GridMetrics,
} from "./grid-debug-geometry";

export interface GridDebugController {
    renderAll: () => void;
    setEnabled: (enabled: boolean) => void;
    toggle: () => void;
}

declare global {
    interface Window {
        __brockmannGridDebugInit?: boolean;
        __brockmannGridDebug?: GridDebugController;
    }
}

export function ensureGridDebug(): GridDebugController | null {
    if (typeof window === "undefined" || typeof document === "undefined") return null;
    if (window[GRID_DEBUG_INIT_KEY]) return window[GRID_DEBUG_GLOBAL_KEY] ?? null;

    window[GRID_DEBUG_INIT_KEY] = true;

    let raf = 0;
    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    function isEnabled(): boolean {
        return document.documentElement.getAttribute(GRID_DEBUG_HTML_ATTR) === GRID_DEBUG_ENABLED_VALUE;
    }

    function setEnabled(enabled: boolean): void {
        if (enabled) {
            document.documentElement.setAttribute(GRID_DEBUG_HTML_ATTR, GRID_DEBUG_ENABLED_VALUE);
            setCookie(GRID_DEBUG_COOKIE_NAME, "1");
        } else {
            document.documentElement.removeAttribute(GRID_DEBUG_HTML_ATTR);
            deleteCookie(GRID_DEBUG_COOKIE_NAME);
        }

        syncToggleButtons();
        scheduleRender();
    }

    function toggle(): void {
        setEnabled(!isEnabled());
    }

    function renderNow(): void {
        const layers = ensureOverlay();
        if (!layers) return;

        if (!isEnabled()) {
            layers.hatchLayer.replaceChildren();
            layers.lineLayer.replaceChildren();
            layers.overlay.removeAttribute("data-active");
            return;
        }

        const shells = Array.from(document.querySelectorAll(GRID_SHELL_SELECTOR)).filter(
            (element): element is HTMLElement => element instanceof HTMLElement
        );

        shells.sort((left, right) => getShellDepth(left) - getShellDepth(right));
        updateResizeObservers(shells, resizeObserver);

        const metricsByShell = new Map<HTMLElement, GridMetrics>();
        const scene = createScene();

        for (const shell of shells) {
            const metrics = collectMetricsForShell(shell, metricsByShell);
            if (!metrics) continue;
            metricsByShell.set(shell, metrics);

            const { left, right, top, bottom } = metrics.bounds;
            if (metrics.depth === 0) {
                addLine(scene.colLines, left, top, bottom);
                addLine(scene.colLines, right, top, bottom);
                addLine(scene.rowLines, top, left, right);
                addLine(scene.rowLines, bottom, left, right);
            }

            for (const gutter of metrics.columnGutters) {
                addHatch(scene.colHatches, gutter.x1, gutter.x2, gutter.y1, gutter.y2);
                addLine(scene.colLines, gutter.x1, gutter.y1, gutter.y2);
                addLine(scene.colLines, gutter.x2, gutter.y1, gutter.y2);
            }

            for (const gutter of metrics.rowGutters) {
                addHatch(scene.rowHatches, gutter.y1, gutter.y2, gutter.x1, gutter.x2);
                addLine(scene.rowLines, gutter.y1, gutter.x1, gutter.x2);
                addLine(scene.rowLines, gutter.y2, gutter.x1, gutter.x2);
            }
        }

        setOverlayExtent(layers.overlay);
        paintScene(scene, layers.hatchLayer, layers.lineLayer);
        layers.overlay.setAttribute("data-active", "true");
    }

    function scheduleRender(): void {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
            raf = 0;
            renderNow();
        });
    }

    function bindToggles(): void {
        document.querySelectorAll(GRID_DEBUG_TOGGLE_SELECTOR).forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            if (element.dataset.gridDebugBound === "1") return;

            element.dataset.gridDebugBound = "1";
            element.addEventListener("click", toggle);
        });
    }

    function syncToggleButtons(): void {
        const enabled = isEnabled();
        document.querySelectorAll(GRID_DEBUG_TOGGLE_SELECTOR).forEach((element) => {
            if (!(element instanceof HTMLElement)) return;
            element.setAttribute("aria-pressed", enabled ? "true" : "false");
            element.toggleAttribute("data-on", enabled);
        });
    }

    function setupObservers(): void {
        resizeObserver = new ResizeObserver(() => {
            if (isEnabled()) scheduleRender();
        });
        mutationObserver = new MutationObserver(() => {
            bindToggles();
            syncToggleButtons();
            if (isEnabled()) scheduleRender();
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"],
        });
    }

    restorePersistedState();
    bindToggles();
    syncToggleButtons();
    setupObservers();

    window.addEventListener("resize", () => {
        if (isEnabled()) scheduleRender();
    });
    window.addEventListener(
        "scroll",
        () => {
            if (isEnabled()) scheduleRender();
        },
        { passive: true }
    );

    if (document.fonts?.ready) {
        document.fonts.ready.then(() => {
            if (isEnabled()) scheduleRender();
        });
    }

    document.addEventListener("astro:page-load", () => {
        bindToggles();
        syncToggleButtons();
        if (isEnabled()) scheduleRender();
    });

    const controller: GridDebugController = {
        renderAll: scheduleRender,
        setEnabled,
        toggle,
    };

    window[GRID_DEBUG_GLOBAL_KEY] = controller;
    if (isEnabled()) scheduleRender();
    return controller;

    function restorePersistedState(): void {
        const persistedEnabled = getCookieValue(GRID_DEBUG_COOKIE_NAME) === "1";
        if (persistedEnabled) {
            document.documentElement.setAttribute(GRID_DEBUG_HTML_ATTR, GRID_DEBUG_ENABLED_VALUE);
        } else if (document.documentElement.hasAttribute(GRID_DEBUG_HTML_ATTR)) {
            document.documentElement.removeAttribute(GRID_DEBUG_HTML_ATTR);
        }
    }
}

function ensureOverlay(): {
    overlay: HTMLElement;
    hatchLayer: HTMLElement;
    lineLayer: HTMLElement;
} | null {
    let overlay = document.getElementById(GRID_DEBUG_OVERLAY_ID);
    if (!(overlay instanceof HTMLElement)) {
        overlay = document.createElement("div");
        overlay.id = GRID_DEBUG_OVERLAY_ID;
        overlay.className = "brockmann-grid-debug-overlay";

        const hatchLayer = document.createElement("div");
        hatchLayer.className = "brockmann-grid-debug-overlay__hatches";
        hatchLayer.setAttribute("data-brockmann-grid-debug-hatches", "");

        const lineLayer = document.createElement("div");
        lineLayer.className = "brockmann-grid-debug-overlay__lines";
        lineLayer.setAttribute("data-brockmann-grid-debug-lines", "");

        overlay.append(hatchLayer, lineLayer);
        document.body.appendChild(overlay);
    }

    const hatchLayer = overlay.querySelector("[data-brockmann-grid-debug-hatches]");
    const lineLayer = overlay.querySelector("[data-brockmann-grid-debug-lines]");
    if (!(hatchLayer instanceof HTMLElement) || !(lineLayer instanceof HTMLElement)) return null;

    return { overlay, hatchLayer, lineLayer };
}

function setOverlayExtent(overlay: HTMLElement): void {
    const doc = document.documentElement;
    const body = document.body;
    const width = Math.max(doc.scrollWidth, body?.scrollWidth ?? 0, doc.clientWidth, window.innerWidth);
    const height = Math.max(
        doc.scrollHeight,
        body?.scrollHeight ?? 0,
        doc.clientHeight,
        window.innerHeight
    );

    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
}

function getCookieValue(name: string): string {
    const needle = `${encodeURIComponent(name)}=`;
    const parts = document.cookie.split(";").map((part) => part.trim());

    for (const part of parts) {
        if (part.startsWith(needle)) return decodeURIComponent(part.slice(needle.length));
    }

    return "";
}

function setCookie(name: string, value: string): void {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/; SameSite=Lax`;
}
