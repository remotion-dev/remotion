---
name: remotion-design
description: Remotion design language reference for homepage, docs UI, and packages/brand work. Use when styling doc pages, promo pages, brand assets, or matching Remotion visual identity (colors, GT Planar, @remotion/design).
---

# Remotion design language

Internal reference for Remotion's own marketing site, docs chrome, and brand packages.  
Not a public end-user skill. Live component playground: https://www.remotion.dev/design (`@remotion/design`).

When editing visuals, prefer existing CSS variables and package sources over inventing new colors.

## Brand blue

Canonical brand / primary blue:

| Token      | Value                                  |
| ---------- | -------------------------------------- |
| Brand blue | `#0b84f3` (also written `#0B84F3`)     |
| CSS        | `--color-brand`, `--ifm-color-primary` |

Primary scale (docs / promo Infima vars):

| Token                          | Value     |
| ------------------------------ | --------- |
| `--ifm-color-primary`          | `#0b84f3` |
| `--ifm-color-primary-dark`     | `#0a77db` |
| `--ifm-color-primary-darker`   | `#0970cf` |
| `--ifm-color-primary-darkest`  | `#085caa` |
| `--ifm-color-primary-light`    | `#2290f5` |
| `--ifm-color-primary-lighter`  | `#2f96f6` |
| `--ifm-color-primary-lightest` | `#53a9f7` |

Warn / error accent used by `@remotion/design`: `--color-warn` = `#ff3232`.

Note: `packages/brand/src/colors.ts` exports `BLUE = '#4290f5'` for some brand video compositions. Homepage and docs brand UI use `#0b84f3` (`packages/brand/src/HomepageAssets/colors.ts`, Studio `helpers/colors.ts`). Prefer `#0b84f3` unless you are inside that brand-composition path.

## Homepage and docs text colors

Shared light / dark theme tokens (see `packages/promo-pages/src/index.css` and `packages/docs/src/css/custom.css`):

| Role                         | Light                | Dark                   | CSS variable                    |
| ---------------------------- | -------------------- | ---------------------- | ------------------------------- |
| Regular text                 | `#000`               | `#fff`                 | `--text-color` / `--color-text` |
| Subtitles / muted            | `#666`               | `#8d8d8d`              | `--subtitle` / `--color-muted`  |
| Light secondary text         | `#777`               | `#aaa`                 | `--light-text-color`            |
| Page background (promo)      | `#f8fafc`            | `#18191a`              | `--background`                  |
| Page background (docs light) | `#fff`               | `#18191a`              | `--background`                  |
| Card / surface               | `#fff`               | `#3b3b3b` (promo card) | `--card-bg` / `--color-card-bg` |
| Border                       | `rgb(234, 234, 234)` | `rgb(42, 42, 42)`      | `--border-color`                |
| Blue button label (light)    | `#084696`            | `white`                | `--blue-button-color`           |

Utility classes in promo-pages: `fontbrand` (GT Planar + `ss03`), `bluelink` (brand-colored links), `card` / `border-effect`.

## Typography: GT Planar

- Family name in CSS: `GTPlanar` (also referred to as GT Planar).
- Brand stack: `--font-brand: 'GTPlanar', sans-serif`.
- Required OpenType feature for brand UI: `ss03`  
  Examples: `font-feature-settings: 'ss03' on;` or `'ss03' 1` via `--font-brand--font-feature-settings`.
- Weights shipped as WOFF2: 400 regular, 500 medium, 700 bold, 900 black  
  (`packages/promo-pages/src/fonts.css`, `packages/docs/src/css/custom.css`, files under `public/img/gt-planar-*.woff2`).
- Docs headings use `GTPlanar` with `ss03`. Body copy on docs uses the system UI stack unless a component opts into `font-brand`.

## `@remotion/design` system

Package: `packages/design`. Preview: https://www.remotion.dev/design

Required theme tokens (also registered from promo-pages via `@remotion/design/register`):

```css
--font-brand: 'GTPlanar', sans-serif;
--font-brand--font-feature-settings: 'ss03' 1;
--color-brand: #0b84f3;
--color-warn: #ff3232;
--color-text: var(--text-color);
--color-button-bg: var(--plain-button);
--color-card-bg: /* theme surface */;
```

Use existing components (`Button`, `Card`, `Input`, `Tabs`, ...) from `@remotion/design` before inventing new chrome.

## Where to look in the monorepo

| Area                    | Path                                                         |
| ----------------------- | ------------------------------------------------------------ |
| Promo / homepage tokens | `packages/promo-pages/src/index.css`                         |
| Promo fonts             | `packages/promo-pages/src/fonts.css`                         |
| Docs theme tokens       | `packages/docs/src/css/custom.css`                           |
| Design system package   | `packages/design`                                            |
| Brand video package     | `packages/brand`                                             |
| Homepage brand blue     | `packages/brand/src/HomepageAssets/colors.ts`                |
| Studio brand blue       | `packages/studio/src/helpers/colors.ts` (`BLUE = '#0b84f3'`) |

## Usage guidance

- Doc pages and promo UI: match `#0b84f3`, `--text-color`, `--subtitle`, and GT Planar + `ss03` for brand headings / labels.
- Prefer CSS variables over hard-coded hex when the theme already defines them (supports light/dark).
- For brand video work in `packages/brand`, follow local composition colors; do not assume every `BLUE` export is the homepage brand blue.
- Cross-check the live design page when adding or restyling shared UI controls.
