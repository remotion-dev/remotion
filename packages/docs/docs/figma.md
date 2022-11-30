---
image: /generated/articles-docs-figma.png
id: figma
title: Import from Figma
crumb: "The best of both"
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

## Importing SVG in Remotion

Paste the component into a Remotion project and [register a `<Composition>`](/docs/composition).  
An example can be found in this [repository](https://github.com/kaf-lamed-beyt/remo-sample).

![](/img/export-figma/editor-pink.png)

## Animate SVG markup

Locate the element that you want to animate and add a style property to it.
In this case, let's animate the `<g>` element that contains the rocket.

```tsx twoslash
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

Adding `{transformOrigin: "center center", transformBox: "fill-box"}` will ensure that the transformations center is it's own center.

Let's create two spring animations, one for scale and one for transformation:

```tsx twoslash
import { interpolate, spring } from "remotion";
const fps = 30;
const frame = 0;
// ---cut---
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
    stiffness: 200,
  },
});

const launch = `translateY(${interpolate(up, [0, 1], [0, -3000])}px)`;
```

The `scale` will go from 0 to 1 and `launch` animates from `0` to `-3000px`. Apply the styles to the element:

```tsx {3}
<g
  id="vehicle"
  style={{
    transform: `scale(${scale}) ${launch}`,
    transformOrigin: "center center",
    transformBox: "fill-box",
  }}
>
  {/* ... */}
</g>
```

![rocket svg](https://res.cloudinary.com/meje/image/upload/v1665432945/article%20assets/rocket_clhn8w.gif)

You have animated a rocket! 🚀

## See also

- [Blog - SVG Animation with Remotion](https://meje.dev/blog/svg-animtion-with-remotion)
- [Video - Animating Figma Mockups with Remotion](https://twitter.com/jnybgr/status/1496748768821133312)
- [Locofy - Export Figma mockups as React components](https://www.locofy.ai)
