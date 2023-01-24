---
image: /generated/articles-docs-paths-translate-path.png
title: translatePath()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package._

Translates the X or Y coordinates of the path

 The function takes three arguments:

- `path`, string SVG paths coordinates.
- `x`, a number representing path x coordinate
- `y`, `optional` a number representing path y coordinate


Returns a SVG path string if the path is valid:

```tsx twoslash title='Translate path x coordinates'
import { translatePath } from "@remotion/paths";

const translatedPath = translatePath("M 50 50 L 150 50", 10);
console.log(translatedPath); // "M 50 50 L 150 50"
```


```tsx twoslash title='Translate path x and y coordinates'
import { translatePath } from "@remotion/paths";

const translatedPath = translatePath('M10 10 L15 15', 10, 10);
console.log(translatedPath); // "M 20,20 L 25,25"
```


```tsx twoslash title='Translate circle path x and y coordinates'
import { translatePath } from "@remotion/paths";

const translatedPath = translatePath('M 35,50 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0', 10, 20);
console.log(translatedPath); // "M 45,70 a 25,25,0,1,1,50,0 a 25,25,0,1,1,-50,0"
```

The function will throw if the path is invalid:

```tsx twoslash
import { translatePath } from "@remotion/paths";
// ---cut---
translatePath("remotion", 10); // Malformed path data: "m" ...
```

## Credits

Source code stems mostly from [translate-svg-path](https://github.com/michaelrhodes/translate-svg-path) and [serialize-svg-path](https://github.com/jkroso/serialize-svg-path).

## See also

- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/translate-path.ts)
