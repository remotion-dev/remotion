---
id: exporting-from-figma
title: Exporting designs from Figma to Remotion
---

Say you're collaborating as a Frontend Engineer with a design team, and you want a way to get a real-time representation of some design assets you have on Figma.

You can export a design from Figma as an SVG file and import it as a React component in Remotion.

## Open the Figma design

The design we'll consider here is a suite of 2D graphics made by [Streamline](https://www.figma.com/@05466272_9382_4) for the design community. You can get a copy [here](https://www.figma.com/community/file/1118919399684035468). When you click the link to the design, you can select from the list of designs available &mdash; in the sidebar
![Thumbnail](/img/export-figma/banner.png)

You do not necessarily have to use this specific design set. But, you should crosscheck to know if the type of SVG you want to export or copy is a pure SVG file, not one that exports an image file as SVG, a typical example would be similar to the snippet below.

```jsx
    <svg
        width="2160"
        height="2160"
        viewBox="0 0 2160 2160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
    >
    <rect width="2160" height="2160" fill="url(#pattern0)" />
    <defs>
        <pattern
            id="pattern0"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
        >
            <use xlinkHref="#image0_11_37" transform="scale(0.000462963)" />
        </pattern>
        <image
            id="image0_11_37"
            width="2160"
            height="2160"
            xlinkHref="data:image/png;base64"
        />
    <defs>
</svg>
```

The snippet above does not represent a pure SVG file, because it literally just exports an image and wraps in the `<svg>` element. A proper SVG file would have all the corresponding `<path />` elements that we can animate conveniently.

You can export any design by copying it as an SVG file &mdash; you can do that by right-clicking on the design itself and selecting the **Copy/Paste as** option

![exporting as SVG](/static/img/export-figma/copy-as-svg.png)

With that out of the way, you'll need a way to represent this SVG as a react component, because of the camelCase attributes naming convention in React, the [react-svgr playground](https://react-svgr.com/playground/) eases the burden of this process for us.

## Grouping vector elements in Figma

This part is a bit important if you really want to get a seamless representation of the animations you're trying to create with Remotion.

By default, and sometimes, the designs you want to export as an SVG file will have scattered vector elements, you'd need to group these elements into independent structures.

Take for example the Rocket SVG that we'll animate. When you take a look at the illustration below, you'll see various parts of the Rocket already grouped into primary components **Vehicle**, **smoke** and the **launchpad**.

![figma-grouping](/static/img/export-figma/figma-grouping.gif)

You can select elements that you want to animate and group them with these key combinations `Ctrl + G` if you're on a Windows machine or `Command key + G` if you're on a Mac.

When you group the SVG by adding smaller chunks of the elements to a larger component or structure, you make it easy for it to be animated or styled individually.

## Using the file in Remotion.

Now that you have exported the SVG file and retrieved it in the appropriate JSX syntax from [react-svgr playground](https://react-svgr.com/playground/). You can copy and paste the file into your remotion project or create reusable components from it.

When you're done with that, you can use the component alongside Remotion's built-in `Composition` component. You can look at the result in this [repo](https://github.com/kaf-lamed-beyt/remo-sample).

![](/static/img/export-figma/rocket.gif)

You can also read more about how to animate the rocket in this [article](https://meje.dev/blog/svg-animtion-with-remotion)
