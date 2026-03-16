# Brockmann

Shared typography and grid primitives extracted from `klinke.studio`.

Named after Josef Muller-Brockmann, the Swiss graphic designer whose book
_Grid Systems in Graphic Design_ remains a canonical reference for editorial
grid construction and typographic discipline.

## Includes

- `TypoRoot`, `TypoBody`, `TypoList`, `TypoListItem`, `TypoFigure`
- `TypoH1` through `TypoH6`
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
