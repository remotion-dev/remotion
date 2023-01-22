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

Remotion has no way of knowing when the image is finished loading because it is impossible to determine so when loading an image through `background-image`. This will lead to Remotion not waiting for the image to be loaded during rendering and cause visible flickers.

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

## See also

- [`<Img>`](/docs/img)
- [Flickering](/docs/flickering)
