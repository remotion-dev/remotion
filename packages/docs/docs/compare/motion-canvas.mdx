---
image: /generated/articles-docs-compare-motion-canvas.png
title: How does Remotion compare to Motion Canvas?
crumb: "FAQ"
sidebar_label: Difference to Motion Canvas
---

Here are a few differences between Remotion and [Motion Canvas](https://motioncanvas.io/) to help you decide which library is best.  
The comparison has been authored by Remotion with input from the Motion Canvas community.

## Web vs. Canvas

Remotion uses a whole DOM tree for the video, while Motion Canvas uses a single `<canvas>` element.

Remotion may render more types of content, but needs a headless browser to create a video.  
Motion Canvas can only render canvas-based content, but may do so in the browser.

## API comparison

Remotion enables you to render React markup based on the current time. React is a popular library for building UIs.

Motion Canvas uses an imperative API. Rather than rendering markup based on a timestamp, elements are added procedurally to the timeline.

Remotions programming style can be described as "declarative" and "keyframe-based", while the terms "imperative" and "procedural" describe Motion Canvas well.

Here is an identical animation (Red circle turning into an orange one, then jumping to the right using a spring animation) in Remotion and Motion Canvas:

```tsx twoslash title="Remotion Implementation"
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colorChange = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  const spr = spring({
    fps,
    frame: frame - 60,
  });
  const translateX = interpolate(spr, [0, 1], [0, 300]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: interpolateColors(
            colorChange,
            [0, 1],
            ["#e6a700", "#e13238"],
          ),
          transform: `translateX(${translateX}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
```

```tsx title="Motion Canvas Implementation"
import { makeScene2D } from "@motion-canvas/2d";
import { Circle } from "@motion-canvas/2d/lib/components";
import { SmoothSpring, spring } from "@motion-canvas/core/lib/tweening";
import { createRef } from "@motion-canvas/core/lib/utils";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();

  view.add(<Circle ref={circle} size={200} fill={"#e6a700"} />);

  yield* circle().fill("#e13238", 2);
  yield* spring(SmoothSpring, 0, 300, (value) => circle().position.x(value));
});
```

## Broad vs. specialized

Remotion tries to make as few assumptions over the content of the video as possible and supports a wide variety of use cases.  
Motion Canvas is designed for informative vector animations and ships built-in APIs to optimize for this use case.

## Special qualities of each library

Each library has unique features that you might find useful:

**Remotion** has:

- APIs for server-side rendering
- functionalities for making apps that create programmatic video
- packages for Three.JS, GIFs, Lottie and more.

**Motion Canvas has**:

- time events and properties that can be manipulated through the GUI
- the ability to sync audio through the UI
- built-in components for LaTeX and code block animations.

## Commercial vs. Open Source

Remotion is source-available software that requires a license for use in companies, while Motion Canvas is truly open source software.

While Remotion costs money for use in a company, we are able to reinvest this money into further improving Remotion.

## Which one should I choose?

It depends - choose the right library based on the features that sound useful to you and the mental model that you feel most comfortable with.
