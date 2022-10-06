---
id: exporting-from-Figma
title: Exporting designs from Figma to Remotion
---

Say you're collaborating as a Frontend Engineer with a design team, and you want a way to get a real-time representation of some of the design assets you have on Figma.

You can export a design from Figma as an SVG file and import it as a React component in Remotion.

## Open the Figma design

The design we'll consider here is a suite of 3D graphics made by [Alzea Arafat](https://dribbble.com/alzea) for the design community. You can find them [here](<https://www.figma.com/file/VCoVolpndRmxkSd5AvctYZ/SALY---3D-Illustration-Pack-(Community)?node-id=7%3A4>). When you click the link to the design, click on the **"Library"** &mdash; in the sidebar &mdash; text to access all 3D graphics

![Thumbnail](/static/img/export-figma/banner.png)

Click on any of the vector graphics. Make sure you're selecting the 3D element alone. Don't select the whole container, the image below illustrates this.

When you select the vector element, a border will be around it to indicate that it is currently in focus. Looking at the image below, you'll notice on the right, there's a "right sidebar" component with different tabs namely, **Design**, **Prototype**, **Inspect**

![exporting as SVG](/static/img/export-figma/export-as-svg.png)

Stay on the **Design** tab, then scroll down till you see the **Export** text, click on the plus sign next to it, select the **SVG** format from the file type dropdown menu, then click the export button

## Using the file in Remotion.

Now that you have exported the SVG file, it should be in your downloads folder. You can copy and paste the file into your remotion project or move the file(s) into the project to avoid duplicates.

When you open the SVG file, it'll look like the image below.

![svg file example](/static/img/export-figma/svg-file.png)

You should take note of attributes like `xmlns:xlink` or `xlink:href` because TypeScript will throw an error due to how html attributes are used in React, these attributes have to be in `camelCase` form.

With that out of the way, you can go ahead to create a React component that serves as a wrapper for the SVG element.

```tsx
export const BikerSVG: React.FC = () => {
    return (
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
    )
}
```

When you're done with that, you can use the component alongside Remotion's built-in `Composition` component. You can look at the result in this [repo](https://github.com/kaf-lamed-beyt/remo-sample).
