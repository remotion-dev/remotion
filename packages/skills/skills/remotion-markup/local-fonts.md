For local font files, use the `@remotion/fonts` package.

### Prerequisites

First, install @remotion/fonts:

```bash
npx remotion add @remotion/fonts # If project uses npm
bunx remotion add @remotion/fonts # If project uses bun
yarn remotion add @remotion/fonts # If project uses yarn
pnpm exec remotion add @remotion/fonts # If project uses pnpm
```

### Loading a local font

Place your font file in the `public/` folder and use `loadFont()`:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await loadFont({
  family: "MyFont",
  url: staticFile("MyFont-Regular.woff2"),
});

export const MyComposition = () => {
  return (
    <div style={{ fontFamily: "MyFont" }}>
      Hello World
    </div>
  );
};
```

### Loading multiple weights

Load each weight separately with the same family name:

```tsx
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

await Promise.all([
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Regular.woff2"),
    weight: "400",
  }),
  loadFont({
    family: "Inter",
    url: staticFile("Inter-Bold.woff2"),
    weight: "700",
  }),
]);
```

### Loading a font URL from props

If the font URL comes from input props, call `loadFont()` in a `useEffect()` inside the component. Create a `delayRender()` handle when the component mounts, so that the render waits until the font has loaded:

```tsx
import { loadFont } from "@remotion/fonts";
import { useEffect, useState } from "react";
import { useDelayRender } from "remotion";

export const MyComposition: React.FC<{ fontUrl: string }> = ({ fontUrl }) => {
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender(`Loading font ${fontUrl}`));

  useEffect(() => {
    loadFont({ family: "CustomFont", url: fontUrl })
      .then(() => continueRender(handle))
      .catch((err) => cancelRender(err));
  }, [fontUrl, handle, continueRender, cancelRender]);

  return <div style={{ fontFamily: "CustomFont" }}>Hello World</div>;
};
```

If the font fails to load, the render fails.  
If the URL has no file extension (e.g. an API endpoint), pass `format` explicitly.

### Available options

```tsx
loadFont({
  family: "MyFont", // Required: name to use in CSS
  url: staticFile("font.woff2"), // Required: font file URL
  format: "woff2", // Optional: auto-detected from extension
  weight: "400", // Optional: font weight
  style: "normal", // Optional: normal or italic
  display: "block", // Optional: font-display behavior
});
```
