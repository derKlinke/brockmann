import {
    createTypoConfig,
    DEFAULT_LOWERCASE_HEADINGS,
    type TypoBaseConfig,
    getTypoVarMap,
} from "./system";

export const SITE_TYPO_PRESET_CLASS = "typo-preset-site";
export const SITE_TYPO_PRESET_SELECTOR = `:root,\n.${SITE_TYPO_PRESET_CLASS}`;
export const SITE_TYPO_PRESET_CONFIG = {
    baseSize: 13,
    r: 1.33,
    lowercaseHeadings: DEFAULT_LOWERCASE_HEADINGS,
} satisfies TypoBaseConfig;

export function renderTypoPresetVarsCss({
    selector,
    config,
}: {
    selector: string;
    config: TypoBaseConfig;
}): string {
    const vars = getTypoVarMap(createTypoConfig(config));
    const body = Object.entries(vars)
        .map(([key, value]) => `    ${key}: ${value};`)
        .join("\n");

    return `${selector} {\n${body}\n}`;
}
