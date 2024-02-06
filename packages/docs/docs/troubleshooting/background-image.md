---
image: /generated/articles-docs-troubleshooting-background-image.png
sidebar_label: Flickering with background-image
title: Flickering when using background-image
crumb: "Common mistakes"
---

The following code is discouraged in Remotion:

```tsx twoslash title="❌ Don't do this"
const src = "abc";
// ---cut---
const myMarkup = (
  <div
    style={{
      backgroundImage: `url(${src})`,
    }}
  >
    <p>Hello World</p>
  </div>
);
```

## Problem

Remotion has no way of knowing when the image is finished loading because it is impossible to determine so when loading an image through `background-image`, `mask-image`, or other CSS properties. This will lead to Remotion not waiting for the image to be loaded during rendering and cause visible flickers.

## Solution

Include an [`<Img>`](/docs/img) tag that renders the same src on that frame hide with CSS:

```tsx twoslash title="✅ Do this"
const src = "abc";
// ---cut---
import { Img } from "remotion";

const myMarkup = (
  <>
    <Img src={src} style={{
      opacity: 0,
      position: "absolute",
      left: "-100%",
    }} />
    <div
      style={{
        backgroundImage: `url(${src})`,
      }}
    >
      <p>Hello World</p>
    </div>
  </>
);
```

The hidden `<Img>` tag ensures the image will download completely which allows the `background-image` will fully render.

## See also

- [`<Img>`](/docs/img)
- [Flickering](/docs/flickering)
- [Flickering with Next.js' Image tag](/docs/troubleshooting/nextjs-image)
