---
image: /generated/articles-docs-z.png
id: z
title: z
crumb: "API"
---

<AvailableFrom v="4.0.0" /><br/><br/>

`z` is a re-export of the Zod library (version `3.21.4`).

You may use it to define schemas for compositions in order to make the input props type-safe.

## Example

The following usage is recommended, since it will make `defaultProps` type-safe and them editable in the schema editor in the Remotion Preview:

```tsx twoslash title="MyComp.tsx" {1-11,18}
import { z } from "remotion";

export const myCompSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export const MyComp: React.FC<z.infer<typeof myCompSchema>> = ({
  title,
  subtitle,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
    </div>
  );
};
```

```tsx twoslash title="Root.tsx" {9,14-18}
// @filename: MyComp.tsx
import React from "react";
import { z } from "remotion";

export const myCompSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export const MyComp: React.FC<z.infer<typeof myCompSchema>> = ({
  title,
  subtitle,
}) => {
  return (
    <div>
      <h1>{title}</h1>
      <h2>{subtitle}</h2>
    </div>
  );
};

// @filename: Root.tsx
// organize-imports-ignore
// ---cut---
import React from "react";
import { Composition } from "remotion";
import { MyComp, myCompSchema } from "./MyComp";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="my-comp"
      component={MyComp}
      durationInFrames={100}
      fps={30}
      width={1920}
      height={1080}
      schema={myCompSchema}
      defaultProps={{
        title: "Hello World",
        subtitle: "Welcome to Remotion",
      }}
    />
  );
};
```

## See also

- [Parametrized rendereding](/docs/parametrized-rendered)
- [`zColor()`](/docs/z-color)
