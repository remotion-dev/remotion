---
image: /generated/articles-docs-cloudrun-getregions.png
id: getregions
title: getRegions()
crumb: "Cloudrun API"
---

Gets an array of all supported GCP regions of this release of Remotion Cloudrun.

## Example

```tsx twoslash
// @module: esnext
// @target: es2017
import { getRegions } from "@remotion/cloudrun";

// ---cut---

const regions = getRegions();
// ["asia-east1", "us-east1"]
```

## Return value

An array of supported regions by this release of Remotion Cloudrun.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-regions.ts)
- [Region selection](/docs/cloudrun/region-selection)
