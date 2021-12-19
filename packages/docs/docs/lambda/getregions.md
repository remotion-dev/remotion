---
id: getregions
title: getRegions()
---

Gets an array of all supported AWS regions of this release of Remotion Lambda.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { getRegions } from "@remotion/lambda";

// ---cut---

const regions = await getRegions();
// ["eu-central-1", "us-east-1"]
```

## API

The function takes no arguments.

## Return value

An array of supported regions by this release of Remotion Lambda.

## See also

- [Region selection](/docs/lambda/region-selection)
