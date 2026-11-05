# Remotion design language

Use this reference when creating Remotion-branded pages and assets.

## Studio icons

Use the [Studio icon reference](packages/brand/src/PreviewToolbarIcons.tsx) when adding or updating icons.

## Colors

- Brand accent: `#0B84F3`
- Homepage background, light mode: `#F8FAFC`
- Homepage background, dark mode: `#18191A`

### Homepage text colors

| Use                              | CSS variable / Tailwind utility      | Light mode | Dark mode |
| -------------------------------- | ------------------------------------ | ---------- | --------- |
| Primary text and headings        | `--text-color` / `text-text`         | `#000000`  | `#FFFFFF` |
| Secondary text and subdued links | `--subtitle` / `text-muted`          | `#666666`  | `#8D8D8D` |
| Additional muted text            | `--light-text-color`                 | `#777777`  | `#AAAAAA` |
| Brand accents and links          | `--ifm-color-primary` / `text-brand` | `#0B84F3`  | `#0B84F3` |
| Errors and warnings              | `text-warn`                          | `#FF3232`  | `#FF3232` |

Use the theme variables or utilities instead of hardcoding text colors. The
homepage's subdued navigation links use `--subtitle` normally and
`--text-color` on hover; brand links use Remotion blue.

The source of these values is
[`packages/promo-pages/src/index.css`](packages/promo-pages/src/index.css).

## Typography

Use GT Planar for brand typography and enable stylistic set 03:

```css
font-family: 'GTPlanar', sans-serif;
font-feature-settings: 'ss03' on;
```

## Code highlighting

Use VS Code **Dark+** for code shown on the homepage, in Remotion Studio,
and in brand images, videos, and editor demos. Do not use Monaco's default
`vs-dark` token colors or the former `vibe-dark` theme as a substitute.

| Token                                 | Color     |
| ------------------------------------- | --------- |
| Plain text and punctuation            | `#D4D4D4` |
| Keywords                              | `#569CD6` |
| Control flow and module keywords      | `#C586C0` |
| Variables, properties, and parameters | `#9CDCFE` |
| Strings                               | `#CE9178` |
| Numbers                               | `#B5CEA8` |
| Comments                              | `#6A9955` |
| Functions                             | `#DCDCAA` |
| Types and class names                 | `#4EC9B0` |

Use Code Hike's `dark-plus` TSX highlighting for brand code visuals. For real
Monaco captures, feed those tokens into Monaco instead of relying on its default
tokenizer. The shared capture helpers are
[`dark-plus.ts`](packages/brand/scripts/dark-plus.ts) and
[`dark-plus-monaco.js`](packages/brand/scripts/dark-plus-monaco.js).

Studio uses the matching Prism `vsc-dark-plus` theme. Its CSS variables preserve
the original colors; token boundaries can differ between highlighters.

Editor backgrounds may fit their surrounding surface: homepage and brand
captures use `#131414` with `#181919` headers; Studio uses `#1E1E1E`.
Use `#264F78` for code selection. Keep syntax colors consistent when changing
editor chrome, typography, or layout. Regenerate affected source captures and
derived assets together, and use new hosted URLs to avoid stale image caches.

Capture code screenshots as lossless PNGs at 3× pixel density using
[`capture-code.ts`](packages/brand/scripts/capture-code.ts). Keep the CSS viewport
and font sizes fixed when changing density; scale the captured image down in the
composition. Avoid JPEG intermediates for text.
