# Brockmann

Shared typography and grid primitives extracted from `klinke.studio`.

Named after Josef Muller-Brockmann, the Swiss graphic designer whose book
_Grid Systems in Graphic Design_ remains a canonical reference for editorial
grid construction and typographic discipline.

## Includes

- `TypoRoot`
- `TypoHeading`, `TypoH1` through `TypoH6`
- `TypoBody`, `TypoCaption`, `TypoMeta`
- `TypoList`, `TypoListItem`
- `Spacer`
- `TypoFigure`
- `TypoEditorialLink`
- `Grid` and `Grid.Item`
- `ensureGridDebug()`
- typography token helpers from `system.ts`
- CSS entrypoints for tokens, core typography, grid styles, and presets

## Install

```bash
npm install @derklinke/brockmann react
```

## Usage

```tsx
import {
    Grid,
    TypoBody,
    TypoH1,
    TypoRoot,
} from "@derklinke/brockmann";
import "@derklinke/brockmann/styles/tokens.css";
import "@derklinke/brockmann/styles/spacing.css";
import "@derklinke/brockmann/styles/core.css";
import "@derklinke/brockmann/styles/grid.css";
import "@derklinke/brockmann/styles/presets/site.css";

export function Example() {
    return (
        <TypoRoot className="typo-preset-site">
            <Grid>
                <Grid.Item columnSpan="full">
                    <TypoH1 snapToGridBottom>Grid systems in graphic design</TypoH1>
                </Grid.Item>
                <Grid.Item columnSpan={3}>
                    <TypoBody>
                        Brockmann exposes the shared editorial typography and grid contract used on
                        klinke.studio.
                    </TypoBody>
                </Grid.Item>
            </Grid>
        </TypoRoot>
    );
}
```

## Typography system

Brockmann exposes a small editorial type system. Each primitive maps to a specific
CSS class and shared spacing contract; the package is intentionally narrow rather than
theme-variant-heavy.

### 1. Establish the root

`TypoRoot` is the single typography context. It computes the CSS custom properties used
by every `Typo*` primitive.

```tsx
<TypoRoot className="typo-preset-site">
    {/* typography primitives */}
</TypoRoot>
```

Key props:

- `baseSize`: body text size in px; default `13`
- `r`: scale ratio; default `1.33`
- `lowercaseHeadings`: applies lowercase heading transform at the root; default `true`
- `injectVars`: inline-inject computed CSS variables; default `true`
- `as`: semantic wrapper tag such as `article`, `section`, `nav`, or `div`

Use `className="typo-preset-site"` when you want the checked-in site preset. Use custom
`baseSize`/`r` props when building a specimen, preview, or alternate scale.

### 2. Headings

`TypoHeading` is the generic heading primitive; `TypoH1` ... `TypoH6` are semantic
wrappers around it.

```tsx
<TypoH1>Primary page title</TypoH1>
<TypoH2>Section heading</TypoH2>
<TypoH3>Subsection heading</TypoH3>
<TypoH4>Minor heading</TypoH4>
<TypoH5>Eyebrow-like heading</TypoH5>
<TypoH6>Body-sized heading</TypoH6>
```

How heading sizing works:

- Brockmann computes seven internal scale steps: `0` ... `6`
- semantic headings map onto those steps as `h1 -> 6`, `h2 -> 4`, `h3 -> 3`, `h4 -> 2`, `h5 -> 1`, `h6 -> 0`
- `h6` intentionally sits at body size
- top and bottom margins are derived from the computed heading size; package spacing is canonical
- headings are lowercase by default through `--typo-heading-text-transform`, not per-component overrides

If a page title or section heading must sit precisely on the baseline grid, opt into
`snapToGridBottom`.

```tsx
<TypoH1 snapToGridBottom>Grid systems in graphic design</TypoH1>
```

This only adjusts bottom/baseline treatment. It does not remove normal heading top space.

### 3. Running text

`TypoBody` is the default paragraph primitive for longform editorial text.

```tsx
<TypoBody>
    Brockmann keeps body copy at the configured base size and derives line height from
    the system ratio.
</TypoBody>
```

Behavior:

- body size comes from `--typo-base-size`
- line height comes from `--typo-body-line-height`
- paragraph spacing comes from `--typo-paragraph-space`
- max line length uses `--typo-measure` and defaults to `75%` unless the preset overrides it
- hyphenation and hanging punctuation are enabled for prose-friendly wrapping

### 4. Small text

Use `TypoCaption` for captions and secondary small text. Use `TypoMeta` for compact
uppercase labels built on top of the caption sizing.

```tsx
<TypoCaption>Figure caption, note, or secondary context.</TypoCaption>
<TypoCaption align="end">Right-aligned caption.</TypoCaption>
<TypoMeta>Updated weekly</TypoMeta>
```

Behavior:

- `TypoCaption` uses `--typo-caption-size` and `--typo-caption-line-height`
- `TypoMeta` reuses caption metrics and adds uppercase text treatment
- `TypoCaption` supports `as="p" | "span" | "div" | "figcaption"`
- `TypoMeta` supports `as="p" | "span" | "div" | "dt"`

### 5. Lists

`TypoList` and `TypoListItem` keep list spacing and copy metrics aligned with the body
system.

```tsx
<TypoList>
    <TypoListItem>Unordered item</TypoListItem>
    <TypoListItem>Second item</TypoListItem>
</TypoList>

<TypoList ordered>
    <TypoListItem>Ordered item</TypoListItem>
    <TypoListItem>Second item</TypoListItem>
</TypoList>
```

Behavior:

- unordered lists default to `disc`
- `ordered` switches the root element to `ol` and the marker style to decimal
- list items inherit the body size and body line-height contract
- left padding follows the baseline grid

### 6. Figures

`TypoFigure` is the package-owned image and caption wrapper. Use it when the package
should own spacing between media and text.

```tsx
<TypoFigure
    src="/images/specimen.jpg"
    alt="Typographic specimen"
    caption="Caption text set in the shared small-text style."
/>
```

Behavior:

- figure block spacing uses `--typo-figure-space`
- image width is fluid by default
- caption spacing uses `--typo-caption-gap`
- `captionClassName` and `imageClassName` let apps layer additional styling without replacing the primitive

### 7. Editorial links

`TypoEditorialLink` is the shared text-first link primitive for navigation and editorial
metadata zones.

```tsx
<TypoEditorialLink href="/notes">Notes</TypoEditorialLink>
<TypoEditorialLink href="/books" active>
    Books
</TypoEditorialLink>
```

Behavior:

- default state has no underline
- hover/focus adds underline
- `active` sets `data-active="true"` and switches to the active color
- `aria-current="page"` receives the same active styling

### Full specimen

```tsx
import {
    TypoBody,
    TypoCaption,
    TypoEditorialLink,
    TypoFigure,
    TypoH1,
    TypoH2,
    TypoH3,
    TypoH4,
    TypoH5,
    TypoH6,
    TypoList,
    TypoListItem,
    TypoMeta,
    TypoRoot,
} from "@derklinke/brockmann";

import "@derklinke/brockmann/styles/tokens.css";
import "@derklinke/brockmann/styles/spacing.css";
import "@derklinke/brockmann/styles/core.css";
import "@derklinke/brockmann/styles/presets/site.css";

export function TypoSpecimen() {
    return (
        <TypoRoot as="article" className="typo-preset-site">
            <TypoMeta>Typography specimen</TypoMeta>
            <TypoH1 snapToGridBottom>Heading level one</TypoH1>
            <TypoBody>
                Body copy carries the canonical editorial line-height, spacing, and wrapping
                rules for Brockmann surfaces.
            </TypoBody>

            <TypoH2>Heading level two</TypoH2>
            <TypoH3>Heading level three</TypoH3>
            <TypoH4>Heading level four</TypoH4>
            <TypoH5>Heading level five</TypoH5>
            <TypoH6>Heading level six</TypoH6>

            <TypoCaption>Caption style for supporting context.</TypoCaption>

            <TypoList>
                <TypoListItem>List item one</TypoListItem>
                <TypoListItem>List item two</TypoListItem>
            </TypoList>

            <TypoFigure
                src="/images/specimen.jpg"
                alt="Specimen"
                caption="Figures keep shared spacing and caption treatment."
            />

            <TypoEditorialLink href="/archive">Open archive</TypoEditorialLink>
        </TypoRoot>
    );
}
```

## Defaults

- neutral text/font tokens live in `styles/tokens.css`
- default Brockmann base size is `13px`
- grid gutters default to `1 * baseline grid`
- row-only grids default to a single column across breakpoints
- computed type-scale metrics come from Brockmann math (`TypoRoot`/`createTypoConfig`) and the checked-in site preset CSS is generated from that same source of truth
- the visual heading scale uses seven internal steps (`0`…`6`) for six semantic headings, so `h6` sits at body size and `h1`…`h5` each skip one visual step
- heading baseline snapping is opt-in via `snapToGridBottom`
- headings lowercase by default and can be disabled globally via `lowercaseHeadings={false}` on `TypoRoot`
- the grid debug runtime owns overlay state, persistence, and toggle synchronization
- `TypoFigure` is the shared figure/image wrapper for package-owned spacing
- `TypoCaption` is the shared small-text/caption primitive; alignment stays opt-in
- `TypoMeta` is the shared compact uppercase metadata label primitive
- `TypoEditorialLink` is the shared text-first editorial/navigation link primitive
- `TypoBody`, `TypoList`, and `TypoFigure` default to `max-width: var(--typo-measure, 75%)`

## Presets and headless helpers

Use generated preset CSS when you want stable checked-in metrics:

```tsx
import "@derklinke/brockmann/styles/presets/site.css";

<TypoRoot className="typo-preset-site">{/* ... */}</TypoRoot>;
```

Use runtime config helpers when you need dynamic values or non-React integration:

```ts
import {
    createTypoConfig,
    getTypoVarMap,
    renderTypoPresetVarsCss,
    serializeTypoVars,
} from "@derklinke/brockmann";

const config = createTypoConfig({
    baseSize: 16,
    r: 1.25,
    lowercaseHeadings: false,
});

const vars = getTypoVarMap(config);
const inlineStyle = serializeTypoVars(config);
const css = renderTypoPresetVarsCss({
    selector: ".typo-preset-specimen",
    config: { baseSize: 16, r: 1.25, lowercaseHeadings: false },
});
```

`TypoRoot` already does this inline variable injection by default. Reach for the headless
helpers only when React is not the right integration layer.

## Current rules

- package math is the source of truth for type metrics; do not hand-edit generated preset numbers
- generated site preset CSS carries the default site metrics, while `TypoRoot` still supports inline var injection for dynamic/specimen cases
- the static site preset should prefer generated CSS over app-level root style injection
- heading top margins are canonical package behavior and must not be zeroed by default package selectors
- snapped headings only change bottom/baseline treatment; snapping must not change heading top spacing
- Brockmann heading text-transform defaults to lowercase at the root config level, not via per-heading overrides
- grid debug state is owned by the runtime and stays synchronized across overlay rendering and toggle UI
- grid/layout helpers normalize inline style keys to valid CSS property names before serialization

## Source layout

- `src/typo`: typography components and token math
- `src/grid`: grid components, shared placement helpers, and debug runtime internals
- `src/rehype`: markdown-to-Brockmann class mapping

## React/SSR and bundle guidance

- the React components (`Grid`, `Grid.Item`, `TypoRoot`, `Typo*`) are small, forward-ref-enabled
  primitives intended to compose cleanly with app code
- for non-React or server-rendered environments (Astro, script templates), prefer the headless
  helpers such as `getGridContainerStyle`, `getGridItemStyle`, and `getTypoVarMap` to avoid
  bringing `react` into routes that do not need it
- `TypoRoot` computes deterministic CSS custom properties from its config; it is safe to
  render on the server without hydration flicker as long as the same props are used on the client
- the published npm package exposes both the React surface (`@derklinke/brockmann`) and CSS
  entrypoints under `@derklinke/brockmann/styles/*` for tree-shakable consumption

## Release

- the repository resolves source files directly so the website can keep using it as a live workspace/submodule
- `npm test` builds the publishable `dist` package and runs the unit suite
- pushes to `main` trigger semantic-release, GitHub releases, and npm publish with provenance from `dist`
