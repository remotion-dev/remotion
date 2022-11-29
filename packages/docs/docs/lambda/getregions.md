---
id: getregions
title: getRegions()
crumb: "Lambda API"
---

Gets an array of all supported AWS regions of this release of Remotion Lambda.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { getRegions } from "@remotion/lambda";

// ---cut---

const regions = getRegions();
// ["eu-central-1", "us-east-1"]
```

## API

The function takes no arguments.

## Return value

An array of supported regions by this release of Remotion Lambda.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-regions.ts)
- [Region selection](/docs/lambda/region-selection)
