import {
    GRID_CONTAINER_SELECTOR,
    GRID_EPSILON,
    GRID_QUANTIZATION,
    GRID_ROW_GROUP_EPSILON,
    GRID_ROWS_ONLY_ATTR,
    GRID_SHELL_SELECTOR,
} from "./grid-debug-constants";

export interface GridBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
}

export interface GridGutter {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

export interface GridMetrics {
    shell: HTMLElement;
    bounds: GridBounds;
    depth: number;
    isColumnSource: boolean;
    columnGutters: GridGutter[];
    rowGutters: GridGutter[];
}

type SceneMap = Map<string, Array<{ start: number; end: number }>>;

export interface GridScene {
    colLines: SceneMap;
    rowLines: SceneMap;
    colHatches: SceneMap;
    rowHatches: SceneMap;
}

export interface GridLayers {
    overlay: HTMLElement;
    hatchLayer: HTMLElement;
    lineLayer: HTMLElement;
}

export function collectMetricsForShell(
    shell: HTMLElement,
    metricsByShell: Map<HTMLElement, GridMetrics>
): GridMetrics | null {
    const grid = getGridElement(shell);
    if (!(grid instanceof HTMLElement)) return null;

    const rowsOnly = shell.hasAttribute(GRID_ROWS_ONLY_ATTR) || grid.hasAttribute(GRID_ROWS_ONLY_ATTR);
    const rect = grid.getBoundingClientRect();
    const bounds: GridBounds = {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY,
        right: rect.right + window.scrollX,
        bottom: rect.bottom + window.scrollY,
        width: rect.width,
        height: rect.height,
    };
    const computed = getComputedStyle(grid);
    const columnGap = parsePx(computed.columnGap);
    const rowGap = parsePx(computed.rowGap);
    const isSubgridColumns = isSubgridTrack(computed.gridTemplateColumns);
    const rowGutters = collectRowGutters(grid, bounds, rowGap);
    const metrics: GridMetrics = {
        shell,
        bounds,
        depth: getShellDepth(shell),
        isColumnSource: false,
        columnGutters: [],
        rowGutters: rowGutters.length > 0 ? rowGutters : collectRowGuttersLegacy(grid, bounds),
    };

    if (isSubgridColumns) {
        if (rowsOnly) return metrics;
        const source = findAncestorColumnSource(shell, metricsByShell);
        if (source) {
            for (const gutter of source.columnGutters) {
                const x1 = Math.max(gutter.x1, bounds.left);
                const x2 = Math.min(gutter.x2, bounds.right);
                if (x2 - x1 <= GRID_EPSILON) continue;
                metrics.columnGutters.push({
                    x1,
                    x2,
                    y1: bounds.top,
                    y2: bounds.bottom,
                });
            }
        }
        return metrics;
    }

    if (rowsOnly) return metrics;

    let trackSizes = extractUsedTrackSizesPx(computed.gridTemplateColumns);
    if (trackSizes.length === 0) trackSizes = [bounds.width];

    const totalGap = Math.max(0, trackSizes.length - 1) * columnGap;
    const usableWidth = Math.max(0, bounds.width - totalGap);
    const totalTracks = trackSizes.reduce((sum, value) => sum + value, 0);
    const scale = totalTracks > 0 ? usableWidth / totalTracks : 1;
    const scaledTracks = trackSizes.map((value) => value * scale);
    let cursor = bounds.left;

    for (let index = 0; index < scaledTracks.length; index += 1) {
        cursor += scaledTracks[index];
        if (index >= scaledTracks.length - 1) continue;
        const x1 = cursor;
        const x2 = cursor + columnGap;
        if (x2 - x1 > GRID_EPSILON) {
            metrics.columnGutters.push({
                x1,
                x2,
                y1: bounds.top,
                y2: bounds.bottom,
            });
        }
        cursor = x2;
    }

    metrics.isColumnSource = true;
    return metrics;
}

export function createScene(): GridScene {
    return {
        colLines: new Map(),
        rowLines: new Map(),
        colHatches: new Map(),
        rowHatches: new Map(),
    };
}

export function addLine(
    map: SceneMap,
    axis: number,
    start: number,
    end: number
): void {
    if (!Number.isFinite(axis) || !Number.isFinite(start) || !Number.isFinite(end)) return;
    if (Math.abs(end - start) <= GRID_EPSILON) return;

    const key = String(quantize(axis));
    const spans = map.get(key) ?? [];
    spans.push({ start, end });
    map.set(key, spans);
}

export function addHatch(
    map: SceneMap,
    fixedStart: number,
    fixedEnd: number,
    spanStart: number,
    spanEnd: number
): void {
    if (
        !Number.isFinite(fixedStart) ||
        !Number.isFinite(fixedEnd) ||
        !Number.isFinite(spanStart) ||
        !Number.isFinite(spanEnd)
    ) {
        return;
    }

    if (
        Math.abs(fixedEnd - fixedStart) <= GRID_EPSILON ||
        Math.abs(spanEnd - spanStart) <= GRID_EPSILON
    ) {
        return;
    }

    const key = `${quantize(fixedStart)}|${quantize(fixedEnd)}`;
    const spans = map.get(key) ?? [];
    spans.push({ start: spanStart, end: spanEnd });
    map.set(key, spans);
}

export function paintScene(
    scene: GridScene,
    hatchLayer: HTMLElement,
    lineLayer: HTMLElement
): void {
    hatchLayer.replaceChildren();
    lineLayer.replaceChildren();

    for (const [key, spans] of scene.colHatches) {
        const [x1, x2] = key.split("|").map(Number);
        for (const span of mergeSpans(spans)) {
            appendHatchElement(hatchLayer, "col", x1, x2, span.start, span.end);
        }
    }

    for (const [key, spans] of scene.rowHatches) {
        const [y1, y2] = key.split("|").map(Number);
        for (const span of mergeSpans(spans)) {
            appendHatchElement(hatchLayer, "row", y1, y2, span.start, span.end);
        }
    }

    for (const [key, spans] of scene.colLines) {
        const x = Number(key);
        for (const span of mergeSpans(spans)) {
            appendLineElement(lineLayer, "col", x, span.start, span.end);
        }
    }

    for (const [key, spans] of scene.rowLines) {
        const y = Number(key);
        for (const span of mergeSpans(spans)) {
            appendLineElement(lineLayer, "row", y, span.start, span.end);
        }
    }
}

export function updateResizeObservers(
    shells: HTMLElement[],
    resizeObserver: ResizeObserver | null
): void {
    if (!(resizeObserver instanceof ResizeObserver)) return;

    resizeObserver.disconnect();
    for (const shell of shells) {
        resizeObserver.observe(shell);
        const grid = getGridElement(shell);
        if (grid instanceof HTMLElement && grid !== shell) resizeObserver.observe(grid);
    }
}

export function getShellDepth(shell: HTMLElement): number {
    let depth = 0;
    let node = shell.parentElement?.closest?.(GRID_SHELL_SELECTOR) ?? null;

    while (node) {
        depth += 1;
        node = node.parentElement?.closest?.(GRID_SHELL_SELECTOR) ?? null;
    }

    return depth;
}

function appendLineElement(
    lineLayer: HTMLElement,
    orientation: "col" | "row",
    axis: number,
    spanStart: number,
    spanEnd: number
): void {
    const line = document.createElement("span");
    line.className = `brockmann-grid-guide-line brockmann-grid-guide-line--${orientation}`;

    if (orientation === "col") {
        line.style.left = `${axis}px`;
        line.style.top = `${spanStart}px`;
        line.style.height = `${Math.max(0, spanEnd - spanStart)}px`;
    } else {
        line.style.top = `${axis}px`;
        line.style.left = `${spanStart}px`;
        line.style.width = `${Math.max(0, spanEnd - spanStart)}px`;
    }

    lineLayer.appendChild(line);
}

function appendHatchElement(
    hatchLayer: HTMLElement,
    orientation: "col" | "row",
    fixedStart: number,
    fixedEnd: number,
    spanStart: number,
    spanEnd: number
): void {
    const fill = document.createElement("span");
    fill.className = `brockmann-grid-gutter-fill brockmann-grid-gutter-fill--${orientation}`;

    if (orientation === "col") {
        fill.style.left = `${fixedStart}px`;
        fill.style.width = `${Math.max(0, fixedEnd - fixedStart)}px`;
        fill.style.top = `${spanStart}px`;
        fill.style.height = `${Math.max(0, spanEnd - spanStart)}px`;
    } else {
        fill.style.top = `${fixedStart}px`;
        fill.style.height = `${Math.max(0, fixedEnd - fixedStart)}px`;
        fill.style.left = `${spanStart}px`;
        fill.style.width = `${Math.max(0, spanEnd - spanStart)}px`;
    }

    hatchLayer.appendChild(fill);
}

function collectRowGutters(
    grid: HTMLElement,
    bounds: GridBounds,
    rowGap: number
): GridGutter[] {
    if (!Number.isFinite(rowGap) || rowGap <= GRID_EPSILON) return [];

    const rowStarts = Array.from(grid.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .map((item) => item.getBoundingClientRect())
        .filter((rect) => rect.width > 0)
        .map((rect) => rect.top + window.scrollY)
        .sort((a, b) => a - b);

    if (rowStarts.length < 2) return [];

    const groupedStarts: number[] = [];
    for (const start of rowStarts) {
        const last = groupedStarts[groupedStarts.length - 1];
        if (last == null || Math.abs(start - last) > GRID_ROW_GROUP_EPSILON) {
            groupedStarts.push(start);
        }
    }

    if (groupedStarts.length < 2) return [];

    const gutters: GridGutter[] = [];
    for (let index = 1; index < groupedStarts.length; index += 1) {
        const y2 = groupedStarts[index];
        const y1 = y2 - rowGap;
        if (y2 - y1 <= GRID_EPSILON) continue;

        const clampedY1 = clamp(y1, bounds.top, bounds.bottom);
        const clampedY2 = clamp(y2, bounds.top, bounds.bottom);
        if (clampedY2 - clampedY1 <= GRID_EPSILON) continue;

        gutters.push({
            x1: bounds.left,
            x2: bounds.right,
            y1: clampedY1,
            y2: clampedY2,
        });
    }

    return gutters;
}

function collectRowGuttersLegacy(grid: HTMLElement, bounds: GridBounds): GridGutter[] {
    const rows = Array.from(grid.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .map((item) => item.getBoundingClientRect())
        .filter((rect) => rect.width > 0)
        .map((rect) => ({
            top: rect.top + window.scrollY,
            bottom: Math.max(rect.top + window.scrollY, rect.bottom + window.scrollY),
        }))
        .sort((a, b) => a.top - b.top);

    if (rows.length < 2) return [];

    const grouped: Array<{ top: number; bottom: number }> = [];
    for (const row of rows) {
        const last = grouped[grouped.length - 1];
        if (last == null || Math.abs(row.top - last.top) > GRID_ROW_GROUP_EPSILON) {
            grouped.push({ ...row });
            continue;
        }

        last.bottom = Math.max(last.bottom, row.bottom);
    }

    if (grouped.length < 2) return [];

    const gutters: GridGutter[] = [];
    for (let index = 0; index < grouped.length - 1; index += 1) {
        const y1 = grouped[index].bottom;
        const y2 = grouped[index + 1].top;
        if (y2 - y1 <= GRID_EPSILON) continue;

        gutters.push({
            x1: bounds.left,
            x2: bounds.right,
            y1: clamp(y1, bounds.top, bounds.bottom),
            y2: clamp(y2, bounds.top, bounds.bottom),
        });
    }

    return gutters.filter((gutter) => gutter.y2 - gutter.y1 > GRID_EPSILON);
}

function findAncestorColumnSource(
    shell: HTMLElement,
    metricsByShell: Map<HTMLElement, GridMetrics>
): GridMetrics | null {
    let node = shell.parentElement?.closest?.(GRID_SHELL_SELECTOR) ?? null;

    while (node instanceof HTMLElement) {
        const metrics = metricsByShell.get(node);
        if (metrics?.isColumnSource) return metrics;
        node = node.parentElement?.closest?.(GRID_SHELL_SELECTOR) ?? null;
    }

    return null;
}

function getGridElement(shell: HTMLElement): HTMLElement | null {
    if (shell.matches(GRID_CONTAINER_SELECTOR)) return shell;
    return shell.querySelector(GRID_CONTAINER_SELECTOR);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function quantize(value: number): number {
    return Math.round(value / GRID_QUANTIZATION) * GRID_QUANTIZATION;
}

function parsePx(value: string): number {
    if (!value || value === "normal") return 0;
    if (value.endsWith("px")) return Number.parseFloat(value) || 0;
    if (value.endsWith("rem")) {
        const rem = Number.parseFloat(value) || 0;
        const root = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        return rem * root;
    }

    return Number.parseFloat(value) || 0;
}

function isSubgridTrack(trackValue: string): boolean {
    return trackValue.trim().startsWith("subgrid");
}

function extractUsedTrackSizesPx(trackValue: string): number[] {
    const matches = trackValue.match(/-?\d*\.?\d+px/g) ?? [];
    return matches
        .map((token) => Number.parseFloat(token))
        .filter((num) => Number.isFinite(num))
        .map((num) => Math.max(0, num));
}

function mergeSpans(spans: Array<{ start: number; end: number }>): Array<{ start: number; end: number }> {
    const sorted = spans
        .filter((span) => Number.isFinite(span.start) && Number.isFinite(span.end))
        .map((span) => ({
            start: Math.min(span.start, span.end),
            end: Math.max(span.start, span.end),
        }))
        .filter((span) => span.end - span.start > GRID_EPSILON)
        .sort((a, b) => a.start - b.start);
    const merged: Array<{ start: number; end: number }> = [];

    for (const span of sorted) {
        const last = merged[merged.length - 1];
        if (!last || span.start > last.end + GRID_EPSILON) {
            merged.push({ ...span });
            continue;
        }

        last.end = Math.max(last.end, span.end);
    }

    return merged;
}
