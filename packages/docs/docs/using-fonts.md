---
title: Using fonts
id: fonts
---

You can use fonts by loading them in a CSS file using @font-face. Web fonts often ship with a css file declaring the fonts, which you can import using the `@import` statement.

## Example using Google Web Fonts

`font.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Bangers");
```

`MyComp.tsx`:

```tsx
import './font.css'

const MyComp: React.FC = () => {
  return (
    <div style={{fontFamily: 'Bangers'}}>Hello</div>
  )
}
```

:::tip
Google Web Fonts by default appends `?display=swap` to their URLs. Make sure to remove it to ensure the video renders correctly if you have a slow internet connection.
:::

## Example using local fonts

`font.css`:

```css
@font-face {
  font-family: "Bangers";
  font-style: normal;
  font-weight: 400;
  src: url(./bangers.woff2) format("woff2");
}
```

`MyComp.tsx`:

```tsx
import './font.css'

const MyComp: React.FC = () => {
  return (
    <div style={{fontFamily: 'Bangers'}}>Hello</div>
  )
}
```

### File requirements

Fonts must have one of the following file extensions to be loaded: `woff`, `woff2`, `ttf`, `eot`.
