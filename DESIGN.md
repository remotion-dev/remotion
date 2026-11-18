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

Use Shiki’s **GitHub Dark** (`github-dark`) for documentation code blocks,
the homepage hero, and promotional images, videos, and editor demos.

Use row spacing of 1.5× the font size for code. Round to whole pixels where
the capture or rendering tool requires it.

| Token                      | Color     |
| -------------------------- | --------- |
| Plain text and punctuation | `#E1E4E8` |
| Keywords and operators     | `#F97583` |
| Parameters                 | `#FFAB70` |
| Strings                    | `#9ECBFF` |
| Numbers and constants      | `#79B8FF` |
| Comments                   | `#6A737D` |
| Functions and JSX props    | `#B392F0` |
| HTML tags                  | `#85E89D` |

Pass the [shared GitHub Dark theme](packages/brand/src/code-theme.ts) to
Code Hike for promo code. Use its tokens in Monaco captures through
[`github-dark.ts`](packages/brand/scripts/github-dark.ts) and
[`github-dark-monaco.js`](packages/brand/scripts/github-dark-monaco.js).

Studio's code editor uses Prism `vsc-dark-plus` with a `#1E1E1E` background.

Use `#24292E` as the GitHub Dark code background and `#3392FF44` for selections.
Promotional editor headers may use the surrounding `#181919` chrome. Regenerate
affected source captures and derived assets together, and use new hosted URLs
to avoid stale image caches.

Capture code screenshots as lossless PNGs at 3× pixel density using
[`capture-code.ts`](packages/brand/scripts/capture-code.ts). Keep the CSS viewport
and font sizes fixed when changing density; scale the captured image down in the
composition. Avoid JPEG intermediates for text.
