---
title: getRemotionEnvironment()
id: get-remotion-environment
crumb: "API"
---

With this hook, you can retrieve information on the current Remotion Environment.
`useRemotionEnvironment` returns an object with the following properties:

- `isStudio`: Indicates if one is currently in the studio.
- `ìsRendering`: Tells if one is currently in a render.
- `isPlayer`: Tells if one is in the Player.
- `isProduction`: Based on your .env file, tells if you are in production or in development

This can be useful if you want components to compute some value differently based on the environment you are in.

### Example

```tsx twoslash
import React from "react";
import { getRemotionEnvironment } from "remotion";

export const MyComp: React.FC = () => {
  const { isStudio, isRendering, isPlayer, isProduction } =
    getRemotionEnvironment();
  console.log(isStudio); // false;
  console.log(isRendering); // true
  console.log(isPlayer); // false
  console.log(isProduction); //true

  return <div>Hello World!</div>;
};
```

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/get-environment.ts)
- [useVideoConfig()](/docs/use-video-config)
- [`<Sequence />`](/docs/sequence)
