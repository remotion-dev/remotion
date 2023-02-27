---
image: /generated/articles-docs-paths-get-length.png
title: getLength()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Gets the length of an SVG path. The argument must be a valid SVG path property.

A number is returned if the path is valid:

```tsx twoslash
import { getLength } from "@remotion/paths";

const length = getLength("M 0 0 L 100 0");
console.log(length); // 100
```

The function will throw if the path is invalid:

```tsx twoslash
import { getLength } from "@remotion/paths";
// ---cut---
getLength("remotion"); // Error: Malformed path data: ...
```

## Credits

Source code stems mostly from [svg-path-properties](https://www.npmjs.com/package/svg-path-properties).

## See also

- [getPointAtLength()](/docs/paths/get-point-at-length)
- [getTangentAtLength()](/docs/paths/get-point-at-length)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/get-length.ts)
- [`@remotion/paths`](/docs/paths)
