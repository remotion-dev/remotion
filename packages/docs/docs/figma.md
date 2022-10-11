---
id: figma
title: Exporting designs from Figma to Remotion
---

You can export a design from Figma as an SVG file and import it as a React component in Remotion and then animate it.

## Open the Figma design

We are going to use a copy of [Streamline's Vector illustrations](https://www.figma.com/community/file/1118919399684035468).

![Thumbnail](/img/export-figma/banner.png)

## Grouping vector elements in Figma

If not already done, group the items you want to export together or frame them in Figma.

![figma-grouping](/img/export-figma/figma-grouping.gif)

Groups will be represented as `<g>` elements in SVG and if you want to animate multiple items together, it can be useful to group them.

## Export as SVG

You can export any design by copying it as SVG markup &mdash; you can do that by right-clicking on the design itself and selecting the **Copy/Paste as** option.

![exporting as SVG](/img/export-figma/copy-as-svg.png)

Next, you need to convert the SVG into a React component. Often, you can just paste the SVG into React markup and it will work.

Alternatively, use the [SVGR playground](https://react-svgr.com/playground/) to reliably convert SVG into React components.

## Using the file in Remotion.

Paste the component into a Remotion project and register a [`<Composition>`](/docs/composition).

An example can be found in this [repository](https://github.com/kaf-lamed-beyt/remo-sample).

![](/img/export-figma/rocket.gif)

## Animate SVG markup

Let's try animating the vehicle group. I'll just go ahead and take a section of the vehicle structure for brevity's sake.

```tsx
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Rocket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "pink",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg
        width="800"
        height="800"
        viewBox="0 0 394 394"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          id="vehicle"
          style={{
            transform: `scale(${scale}) ${launch}`,
            transformOrigin: "center center",
            transformBox: "fill-box",
          }}
        >
          // vehicle's paths
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

You'll notice that we're having some values assigned in the `style` prop in the `<g>` element. Let's take a look at them in a detailed manner.

```ts
const up = spring({
  fps,
  frame: frame - 20,
  config: {
    damping: 20,
    mass: 15,
  },
});

const scale = spring({
  fps,
  frame,
  config: {
    mass: 1,
    stiffness: 200,
  },
});

const launch = `translateY(${interpolate(up, [0, 1], [0, -3000])}px)`;
```

The spring library in Remotion can be used to create smooth animations, by taking the current frame of the video &mdash; which we obtain from the `useCurrentFrame()` hook &mdash; into consideration.

The `launch` variable as the name implies animates the rocket by taking it &mdash; 3000px &mdash; out of the viewport.

```ts
${interpolate(up, [0, 1], [0, -3000])
```

The `interpolate` function allows us to map a range of values to another one, in this scenario, we're mapping the initial spring animation `up`, the current frames `[0, 1]`, and how far we want the rocket to be displaced from the viewport.

In a simpler form, we're using the `interpolate` function to animate the rocket by telling it to launch the vehicle when the video is in its first frame &mdash; 3000px out of the viewport.

When you're done with that, you can use the component alongside Remotion's built-in `Composition` component. The illustration below shows what the result looks like, but you can still take a look at the result in this [repo](https://github.com/kaf-lamed-beyt/remo-sample).

![rocket svg](https://res.cloudinary.com/meje/image/upload/v1665432945/article%20assets/rocket_clhn8w.gif)

One thing to note when you're working with SVGs is that CSS transforms work differently with them than they do when we're trying to animate conventional HTML elements. That's why I included the `transformBox` and `transformOrigin` properties in the previous snippet like so:

```tsx
<g
  id="vehicle"
  style={{
    transform: `scale(${scale}) ${launch}`,
    transformOrigin: "center center",
    transformBox: "fill-box",
  }}
></g>
```

If we don't set the value of `transformOrigin = "center center"`, the animation would start from the top left corner, and we do not want that. Take a look at what the animation looked like before I added these attributes.

![rocket before transformOrigin attribute](https://res.cloudinary.com/meje/image/upload/v1665485484/article%20assets/transforms_cmdqom.gif)

[see more](https://meje.dev/blog/svg-animtion-with-remotion).
