export interface TypoBaseConfig {
    baseSize: number;
    r: number;
    lowercaseHeadings?: boolean;
}

export type TypoHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TypoHeadingMetrics {
    size: number;
    top: number;
    bottom: number;
}

export interface TypoConfig extends TypoBaseConfig {
    alpha: number;
    lambda: number;
    bodyLineHeight: number;
    baselineGrid: number;
    paragraphSpace: number;
    figureSpace: number;
    captionGap: number;
    captionSize: number;
    captionLineHeight: number;
    metaSize: number;
    metaLineHeight: number;
    editorialLinkSize: number;
    editorialLinkLineHeight: number;
    gridGutterMultiplier: number;
    gridGutterWideMultiplier: number;
    lowercaseHeadings: boolean;
    steps: Record<0 | 1 | 2 | 3 | 4 | 5 | 6, number>;
    headings: Record<TypoHeadingLevel, TypoHeadingMetrics>;
    vars: Record<string, string>;
}

export const DEFAULT_TYPO_BASE_SIZE = 13;
export const DEFAULT_TYPO_R = 1.33;
export const DEFAULT_LOWERCASE_HEADINGS = true;
export const DEFAULT_GRID_GUTTER_MULTIPLIER = 1;
export const DEFAULT_GRID_GUTTER_WIDE_MULTIPLIER = 1;

const headingStepByLevel: Record<TypoHeadingLevel, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
    1: 6,
    2: 4,
    3: 3,
    4: 2,
    5: 1,
    6: 0,
};

export function createTypoConfig({
    baseSize,
    r,
    lowercaseHeadings = DEFAULT_LOWERCASE_HEADINGS,
}: TypoBaseConfig): TypoConfig {
    const alpha = 1 / r;
    const lambda = 1 / r;
    const bodyLineHeight = baseSize * r ** 2;
    const baselineGrid = bodyLineHeight;
    const paragraphSpace = alpha * baselineGrid;
    const captionSize = baseSize / r;
    const steps = {
        0: baseSize,
        1: baseSize * r,
        2: baseSize * r ** 2,
        3: baseSize * r ** 3,
        4: baseSize * r ** 4,
        5: baseSize * r ** 5,
        6: baseSize * r ** 6,
    };
    const headings = {
        1: createHeadingMetrics(1, steps, lambda),
        2: createHeadingMetrics(2, steps, lambda),
        3: createHeadingMetrics(3, steps, lambda),
        4: createHeadingMetrics(4, steps, lambda),
        5: createHeadingMetrics(5, steps, lambda),
        6: createHeadingMetrics(6, steps, lambda),
    };

    const config = {
        baseSize,
        r,
        alpha,
        lambda,
        bodyLineHeight,
        baselineGrid,
        paragraphSpace,
        figureSpace: paragraphSpace * 2,
        captionGap: paragraphSpace / r,
        captionSize,
        captionLineHeight: baseSize,
        metaSize: captionSize,
        metaLineHeight: baseSize,
        editorialLinkSize: captionSize,
        editorialLinkLineHeight: baseSize,
        gridGutterMultiplier: DEFAULT_GRID_GUTTER_MULTIPLIER,
        gridGutterWideMultiplier: DEFAULT_GRID_GUTTER_WIDE_MULTIPLIER,
        lowercaseHeadings,
        steps,
        headings,
        vars: {},
    } satisfies TypoConfig;

    config.vars = buildTypoVarMap(config);
    return config;
}

export function getHeadingMetrics(level: TypoHeadingLevel, config: TypoConfig): TypoHeadingMetrics {
    return config.headings[level];
}

export function getTypoVarMap(config: TypoConfig): Record<string, string> {
    if (Object.keys(config.vars).length > 0) return config.vars;
    return buildTypoVarMap(config);
}

export function serializeTypoVars(config: TypoConfig): string {
    return `${Object.entries(getTypoVarMap(config))
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ")};`;
}

export function formatTypoValue(value: number): string {
    return value
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/(\.\d)0$/, "$1");
}

function buildTypoVarMap(config: Omit<TypoConfig, "vars"> | TypoConfig): Record<string, string> {
    const vars: Record<string, string> = {
        "--typo-base-size": `${config.baseSize}px`,
        "--typo-r": `${config.r}`,
        "--typo-alpha": `${config.alpha}`,
        "--typo-lambda": `${config.lambda}`,
        "--typo-body-line-height": `${config.bodyLineHeight}px`,
        "--typo-baseline-grid": `${config.baselineGrid}px`,
        "--typo-paragraph-space": `${config.paragraphSpace}px`,
        "--typo-figure-space": `${config.figureSpace}px`,
        "--typo-caption-gap": `${config.captionGap}px`,
        "--typo-caption-size": `${config.captionSize}px`,
        "--typo-caption-line-height": `${config.captionLineHeight}px`,
        "--typo-meta-size": `${config.metaSize}px`,
        "--typo-meta-line-height": `${config.metaLineHeight}px`,
        "--typo-editorial-link-size": `${config.editorialLinkSize}px`,
        "--typo-editorial-link-line-height": `${config.editorialLinkLineHeight}px`,
        "--typo-heading-text-transform": config.lowercaseHeadings ? "lowercase" : "none",
        "--grid-gutter": `calc(${config.baselineGrid}px * ${config.gridGutterMultiplier})`,
        "--grid-gutter-wide": `calc(${config.baselineGrid}px * ${config.gridGutterWideMultiplier})`,
        "--typo-step-0": `${config.steps[0]}px`,
        "--typo-step-1": `${config.steps[1]}px`,
        "--typo-step-2": `${config.steps[2]}px`,
        "--typo-step-3": `${config.steps[3]}px`,
        "--typo-step-4": `${config.steps[4]}px`,
        "--typo-step-5": `${config.steps[5]}px`,
        "--typo-step-6": `${config.steps[6]}px`,
    };

    for (const level of [1, 2, 3, 4, 5, 6] as const) {
        const heading = config.headings[level];
        vars[`--typo-heading-${level}-size`] = `${heading.size}px`;
        vars[`--typo-heading-${level}-top`] = `${heading.top}px`;
        vars[`--typo-heading-${level}-bottom`] = `${heading.bottom}px`;
    }

    return vars;
}

function createHeadingMetrics(
    level: TypoHeadingLevel,
    steps: TypoConfig["steps"],
    lambda: number
): TypoHeadingMetrics {
    const size = steps[headingStepByLevel[level]];

    return {
        size,
        top: 2 * lambda * size,
        bottom: 4 * Math.log(size),
    };
}
