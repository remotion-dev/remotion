---
name: gif
description: Displaying GIFs synchronized with Remotion's timeline
metadata:
  tags: gif, animation, images, animated
---

# Using GIFs in Remotion

## Prerequisites

Install @remotion/gif if it is not already installed:

```bash
npx remotion add @remotion/gif # If project uses npm
bunx remotion add @remotion/gif # If project uses bun
yarn remotion add @remotion/gif # If project uses yarn
pnpm exec remotion add @remotion/gif # If project uses pnpm
```

## Basic usage

Use `<Gif>` to display a GIF synchronized with Remotion's timeline:

```tsx
import { Gif } from "@remotion/gif";
import { staticFile } from "remotion";

export const MyComposition = () => {
  return <Gif src={staticFile("animation.gif")} width={500} height={500} />;
};
```

Remote URLs are also supported (must have CORS enabled):

```tsx
<Gif src="https://example.com/animation.gif" width={500} height={500} />
```

## Sizing and fit

Control how the GIF fills its container with the `fit` prop:

```tsx
// Stretch to fill (default)
<Gif src={staticFile("animation.gif")} width={500} height={300} fit="fill" />

// Maintain aspect ratio, fit inside container
<Gif src={staticFile("animation.gif")} width={500} height={300} fit="contain" />

// Fill container, crop if needed
<Gif src={staticFile("animation.gif")} width={500} height={300} fit="cover" />
```

## Playback speed

Use `playbackRate` to control the animation speed:

```tsx
<Gif src={staticFile("animation.gif")} width={500} height={500} playbackRate={2} /> {/* 2x speed */}
<Gif src={staticFile("animation.gif")} width={500} height={500} playbackRate={0.5} /> {/* Half speed */}
```

## Looping behavior

Control what happens when the GIF finishes:

```tsx
// Loop indefinitely (default)
<Gif src={staticFile("animation.gif")} width={500} height={500} loopBehavior="loop" />

// Play once, show final frame
<Gif src={staticFile("animation.gif")} width={500} height={500} loopBehavior="pause-after-finish" />

// Play once, then unmount
<Gif src={staticFile("animation.gif")} width={500} height={500} loopBehavior="unmount-after-finish" />
```


## Styling

Use the `style` prop for additional CSS (use `width` and `height` props for sizing):

```tsx
<Gif
  src={staticFile("animation.gif")}
  width={500}
  height={500}
  style={{
    borderRadius: 20,
    position: "absolute",
    top: 100,
    left: 50,
  }}
/>
```

## Getting GIF duration

Use `getGifDurationInSeconds()` to get the duration of a GIF:

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile } from "remotion";

const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
console.log(duration); // e.g. 2.5
```

This is useful for setting the composition duration to match the GIF:

```tsx
import { getGifDurationInSeconds } from "@remotion/gif";
import { staticFile, CalculateMetadataFunction } from "remotion";

const calculateMetadata: CalculateMetadataFunction = async () => {
  const duration = await getGifDurationInSeconds(staticFile("animation.gif"));
  return {
    durationInFrames: Math.ceil(duration * 30),
  };
};
```
