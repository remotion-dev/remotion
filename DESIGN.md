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
