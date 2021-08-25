---
title: Using fonts
id: fonts
---

You can use fonts by loading them in a CSS file using @font-face. Web fonts often ship with a css file declaring the fonts, which you can import using the `@import` statement.

## Example using Google Fonts

```css title="font.css"
@import url("https://fonts.googleapis.com/css2?family=Bangers");
```

```tsx twoslash title="MyComp.tsx"
import './font.css'

const MyComp: React.FC = () => {
  return <div style={{fontFamily: 'Bangers'}}>Hello</div>
}
```

**Important when using Webfonts:**

- _When using v2.2 or later_: We automatically wait for fonts to be loaded, so you don't need to do anything.
- _When using an older version of Remotion_: Google Fonts by default appends `?display=swap` to their URLs. Make sure to remove it to ensure the video renders correctly if you have a slow internet connection.

## Example using local fonts

```css title="font.css"
@font-face {
  font-family: "Bangers";
  font-style: normal;
  font-weight: 400;
  src: url(./bangers.woff2) format("woff2");
}
```

```tsx twoslash title="MyComp.tsx"
import './font.css'

const MyComp: React.FC = () => {
  return <div style={{fontFamily: 'Bangers'}}>Hello</div>
}
```

### File requirements

Fonts must have one of the following file extensions to be loaded: `woff`, `woff2`, `ttf`, `eot`.
