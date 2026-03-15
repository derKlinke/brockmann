# Brockmann

Shared typography and grid system for `klinke.studio`.

## Surface

- `TypoRoot`, `TypoBody`, `TypoList`, `TypoListItem`, `TypoFigure`
- `TypoH1` … `TypoH6`, `TypoHeading`
- `Grid`, `Grid.Item`
- `ensureGridDebug()`
- token helpers from `system.ts`
- CSS entrypoints:
  - `@derklinke/brockmann/styles/tokens.css`
  - `@derklinke/brockmann/styles/core.css`
  - `@derklinke/brockmann/styles/grid.css`
  - `@derklinke/brockmann/styles/presets/site.css`
  - `@derklinke/brockmann/styles/presets/helvetica.css`

## Defaults

- canonical neutral text/font tokens live in `styles/tokens.css`
- site preset keeps Berkeley Mono body + PP Frama heading defaults
- grid gutter tokens derive from the baseline grid
- row-only Brockmann grids default to one column across breakpoints
- heading baseline snapping is opt-in through `snapToGridBottom`
- grid debug runtime owns overlay state, persistence, rendering, and toggle synchronization

## Notes

- `TypoFigure` is the shared image/figure wrapper for package-owned figure spacing
- Astro adapters stay in the site and should remain thin wrappers over this package
