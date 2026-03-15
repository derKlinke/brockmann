export type GridLine = number;
export type GridSpan = number | "full";
export type ResponsiveValue<T> = T | { base?: T; md?: T };
export const DEFAULT_GRID_COLUMNS = { base: 1, md: 5 } as const;
export const DEFAULT_ROWS_ONLY_GRID_COLUMNS = { base: 1, md: 1 } as const;

export interface GridContainerOptions {
    className?: string;
    shellClassName?: string;
    columns?: ResponsiveValue<number>;
    rowsOnly?: boolean;
    subgrid?: boolean;
    debug?: boolean;
}

export interface GridItemOptions {
    className?: string;
    columnStart?: ResponsiveValue<GridLine>;
    columnSpan?: ResponsiveValue<GridSpan>;
    rowStart?: ResponsiveValue<GridLine>;
    rowSpan?: ResponsiveValue<number>;
}

type StyleValue = string | number;

export function getGridContainerClassName({
    className = "",
    shellClassName = "",
    subgrid = false,
}: GridContainerOptions): string {
    return joinClassNames(
        "brockmann-grid-shell",
        "brockmann-grid",
        subgrid ? "brockmann-grid--subgrid" : "brockmann-grid--columns",
        shellClassName,
        className
    );
}

export function getGridContainerDataAttributes({
    rowsOnly = false,
    debug = false,
}: GridContainerOptions): Record<string, string> {
    return {
        "data-brockmann-grid-shell": "",
        "data-brockmann-grid-grid": "",
        ...(debug ? { "data-brockmann-grid-debug": "true" } : {}),
        ...(rowsOnly ? { "data-brockmann-grid-rows-only": "" } : {}),
    };
}

export function resolveGridColumns(
    columns: ResponsiveValue<number> | undefined,
    rowsOnly: boolean
): ResponsiveValue<number> {
    if (columns != null) return columns;
    return rowsOnly ? DEFAULT_ROWS_ONLY_GRID_COLUMNS : DEFAULT_GRID_COLUMNS;
}

export function getGridContainerStyle({
    columns = DEFAULT_GRID_COLUMNS,
}: GridContainerOptions): Record<string, StyleValue> {
    const normalizedColumns = normalizeResponsive(columns);
    const style: Record<string, StyleValue> = {};

    if (normalizedColumns.base != null) {
        style["--brockmann-grid-columns-base"] = normalizedColumns.base;
    }

    if (normalizedColumns.md != null) {
        style["--brockmann-grid-columns-md"] = normalizedColumns.md;
        style["--brockmann-grid-columns"] = normalizedColumns.md;
    } else if (normalizedColumns.base != null) {
        style["--brockmann-grid-columns"] = normalizedColumns.base;
    }

    return style;
}

export function getGridItemClassName(options: GridItemOptions): string {
    const isResponsive =
        isResponsiveValue(options.columnStart) ||
        isResponsiveValue(options.columnSpan) ||
        isResponsiveValue(options.rowStart) ||
        isResponsiveValue(options.rowSpan);

    return joinClassNames(
        "brockmann-grid-item",
        isResponsive ? "brockmann-grid-item--responsive" : "",
        options.className ?? ""
    );
}

export function getGridItemStyle(options: GridItemOptions): Record<string, StyleValue> {
    const columnStart = normalizeResponsive(options.columnStart);
    const columnSpan = normalizeResponsive(options.columnSpan);
    const rowStart = normalizeResponsive(options.rowStart);
    const rowSpan = normalizeResponsive(options.rowSpan);
    const columnBase = formatGridPlacement(columnStart.base, columnSpan.base);
    const columnMd = formatGridPlacement(columnStart.md, columnSpan.md);
    const rowBase = formatGridPlacement(rowStart.base, rowSpan.base);
    const rowMd = formatGridPlacement(rowStart.md, rowSpan.md);
    const isResponsive =
        isResponsiveValue(options.columnStart) ||
        isResponsiveValue(options.columnSpan) ||
        isResponsiveValue(options.rowStart) ||
        isResponsiveValue(options.rowSpan);
    const style: Record<string, StyleValue> = {};

    if (isResponsive) {
        if (columnBase) style["--brockmann-grid-column-base"] = columnBase;
        if (columnMd) style["--brockmann-grid-column-md"] = columnMd;
        if (rowBase) style["--brockmann-grid-row-base"] = rowBase;
        if (rowMd) style["--brockmann-grid-row-md"] = rowMd;
        return style;
    }

    if (columnBase) style.gridColumn = columnBase;
    if (rowBase) style.gridRow = rowBase;
    return style;
}

function formatGridPlacement(
    lineStart?: GridLine,
    span?: number | GridSpan
): string | undefined {
    if (span === "full") return "1 / -1";
    if (lineStart == null && span == null) return undefined;
    if (lineStart != null && span != null) return `${lineStart} / span ${span}`;
    if (lineStart != null) return `${lineStart}`;
    if (span != null) return `auto / span ${span}`;
    return undefined;
}

function normalizeResponsive<T>(value?: ResponsiveValue<T>): { base?: T; md?: T } {
    if (value == null) return {};
    if (typeof value === "object" && !Array.isArray(value)) {
        return value;
    }

    return { base: value };
}

function isResponsiveValue<T>(value?: ResponsiveValue<T>): boolean {
    return value != null && typeof value === "object" && !Array.isArray(value);
}

function joinClassNames(...values: Array<string | undefined>): string {
    return values.filter(Boolean).join(" ");
}
