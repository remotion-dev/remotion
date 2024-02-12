---
image: /generated/articles-docs-troubleshooting-background-image.png
sidebar_label: Flickering with background-image
title: Flickering when using background-image or mask-image
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

Use the [`<Img>`](/docs/img) tag instead and place it in an [`<AbsoluteFill>`](/docs/absolute-fill):

```tsx twoslash title="✅ Do this"
const src = "abc";
// ---cut---
import { AbsoluteFill, Img } from "remotion";

const myMarkup = (
  <AbsoluteFill>
    <AbsoluteFill>
      <Img
        style={{
          width: "100%",
        }}
        src={src}
      />
    </AbsoluteFill>
    <AbsoluteFill>
      <p>Hello World</p>
    </AbsoluteFill>
  </AbsoluteFill>
);
```

The next will be placed on top of the image and will not flicker.

## Workaround

If you cannot use an [`<Img>`](/docs/img) tag, for example because you need to use `mask-image()`, render an adjacent `<Img>` tag that renders the same src and place it outside the viewport:

```tsx twoslash title="✅ Do this"
const src = "abc";
// ---cut---
import { Img } from "remotion";

const myMarkup = (
  <>
    <Img
      src={src}
      style={{
        opacity: 0,
        position: "absolute",
        left: "-100%",
      }}
    />
    <div
      style={{
        maskImage: `url(${src})`,
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
