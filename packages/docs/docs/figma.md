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

You can also read more about how to animate the rocket in this [article](https://meje.dev/blog/svg-animtion-with-remotion).
