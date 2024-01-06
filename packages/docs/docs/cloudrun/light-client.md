---
sidebar_label: Light client
title: Light client
crumb: "Cloud Run"
---

_available from v4.0.84_

The following methods and types can be imported from `@remotion/cloudrun/client`:

```tsx twoslash
// organize-imports-ignore
// ---cut---
import {
  deleteService,
  deleteSite,
  getOrCreateBucket,
  getRegions,
  getServiceInfo,
  getServices,
  getSites,
  renderMediaOnCloudrun,
  renderStillOnCloudrun,
  speculateServiceName
} from "@remotion/cloudrun/client";

import type {
  RenderMediaOnCloudrunInput,
  RenderStillOnCloudrunInput
} from "@remotion/cloudrun/client"
```


These functions don't have any Node.JS or Bun dependencies and can be bundled with a bundler such as Webpack or ESBuild.

**We don't recommend calling these functions from the browser directly, as you will leak your Google Cloud Platform credentials.**

Instead, this light client is meant to reduce the bundle size and avoid problems if you are calling Remotion Cloud Run APIs from another serverless function and therefore need to bundle your function code.

This import is useful for example for Next.js serverless endpoints or similar, which bundle the server-side code.
