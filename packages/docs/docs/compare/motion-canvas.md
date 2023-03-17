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

## Declarative vs. Imperative API

Remotion uses React, a declarative library for expressing UI.  
Motion Canvas uses an its own imperative API.

Compare the following examples to see the difference in the programming style:

```tsx twoslash title="Remotion API - Declarative"
import { Circle } from "@remotion/shapes";

export const MyComp: React.FC = () => {
  return <Circle radius={100} fill="red" />;
};
```

```tsx title="Motion Canvas API - Imperative"
export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();
  view.add(<Circle ref={circle} width={100} height={100} />);

  circle().fill("red");
});
```

## Keyframes vs. Procedural

Remotion requires you to render an image based on the current time.  
Motion Canvas requires you to define a list of animation steps.

```tsx twoslash title="Remotion API"
import { Circle } from "@remotion/shapes";
import {
  Easing,
  interpolate,
  interpolateColors,
  useCurrentFrame,
} from "remotion";

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 60], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateRight: "clamp",
  });

  return (
    <Circle
      radius={100}
      fill={interpolateColors(progress, [0, 60], ["#e6a700", "#e13238"])}
    />
  );
};
```

```tsx title="Motion Canvas API"
import { Color } from "@motion-canvas/core/lib/types";

export default makeScene2D(function* (view) {
  const circle = createRef<Circle>();
  view.add(<Circle ref={circle} width={100} height={100} />);

  yield *
    tween(2, (value) => {
      circle().fill(
        Color.lerp(
          new Color("#e6a700"),
          new Color("#e13238"),
          easeInOutCubic(value)
        )
      );
    });
}
```

## Broad vs. specialized

Remotion tries to make as few assumptions over the content of the video as possible and supports a wide variety of use-cases.  
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
