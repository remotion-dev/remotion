---
title: getRemotionEnvironment()
id: get-remotion-environment
crumb: "API"
---

With the `getRemotionEnvironment()` function , you can retrieve information about the current Remotion Environment.
`getRemotionEnvironment()` returns an object with the following properties:

- `isStudio`: Indicates if you are currently in the studio.
- `ìsRendering`: Tells if one is currently in a render.
- `isPlayer`: Indicates if you are in the Player.
- `isProduction`: Based on your .env file, tells if you are in production or in development

This can be useful if you want components to compute some values differently based on the environment you are in.

### Example

```tsx twoslash
import React from "react";
import { getRemotionEnvironment } from "remotion";

export const MyComp: React.FC = () => {
  const { isStudio, isPlayer } = getRemotionEnvironment();

  if (isStudio) {
    return <div>I'm in the Studio!</div>;
  }

  if (isPlayer) {
    return <div>I'm in the Player!</div>;
  }

  return <div>Hello World!</div>;
};
```

A more realistic use case: In the Remotion Studio you might want to debounce a request, but not during rendering. See [debouncing requests](/docs/data-fetching#debouncing-requests) for an indepth explanation.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/get-environment.ts)
- [useVideoConfig()](/docs/use-video-config)
- [`<OffthreadVideo/> while rendering`](/docs/miscellaneous/snippets/offthread-video-while-rendering)
