---
image: /generated/articles-docs-paths-get-instruction-index-at-length.png
title: getInstructionIndexAtLength()
crumb: "@remotion/paths"
---

_Part of the [`@remotion/paths`](/docs/paths) package._

_available from v4.0.84_

Gets the index of the instruction that is at the length of the path.  
The first argument is an SVG path, the second one is the length at which the point should be sampled.  
It must be between `0` and the return value of [`getLength()`](/docs/paths/get-length).

An object containing `index` and `lengthIntoInstruction` is returned if the path is valid:

```tsx twoslash title="Example"
import { getInstructionIndexAtLength } from "@remotion/paths";

const { index, lengthIntoInstruction } = getInstructionIndexAtLength(
  "M 0 0 L 100 0 L 200 0",
  105,
);
console.log(index); // 1
console.log(lengthIntoInstruction); // 5
```

To get the instruction at a specific index, you can use [`parsePath()`](/docs/paths/parse-path):

```tsx twoslash title="Get instruction"
import { getInstructionIndexAtLength, parsePath } from "@remotion/paths";

const path = "M 0 0 L 100 0 L 200 0";
const { index } = getInstructionIndexAtLength(path, 105);

const parsed = parsePath(path);
const instruction = parsed[index]; // {type: 'L', x: 100, y: 0}
```

The function **will throw** if the path is invalid:

```tsx twoslash
import { getInstructionIndexAtLength } from "@remotion/paths";
// ---cut---
getInstructionIndexAtLength("remotion", 50); // Error: Malformed path data: ...
```

The function **will throw** if the sample length is bigger than the [length](/docs/paths/get-length) of the path:

```tsx twoslash
import { getInstructionIndexAtLength } from "@remotion/paths";
// ---cut---
getInstructionIndexAtLength("M 0 0 L 100 0", 105); // Error: A length of 105 was passed to getInstructionIndexAtLength() but the total length of the path is only 100;
```

## Credits

This function was adapted from [svg-path-properties](https://www.npmjs.com/package/svg-path-properties).

## See also

- [`getLength()`](/docs/paths/get-length)
- [`parsePath()`](/docs/paths/parse-path)
- [`@remotion/paths`](/docs/paths)
- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/paths/src/get-instruction-index-at-length.ts)
