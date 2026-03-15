# Brockmann

Shared typography and grid primitives extracted from `klinke.studio`.

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
- grid gutters derive from the baseline grid
- row-only grids default to a single column across breakpoints
- heading baseline snapping is opt-in via `snapToGridBottom`
- the grid debug runtime owns overlay state, persistence, and toggle synchronization

## Release

- `npm test` builds the package and runs the unit suite
- pushes to `main` trigger semantic-release, GitHub releases, and npm publish with provenance
