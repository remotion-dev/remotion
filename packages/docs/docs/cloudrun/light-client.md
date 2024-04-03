---
image: /generated/articles-docs-cloudrun-light-client.png
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
  speculateServiceName,
} from "@remotion/cloudrun/client";

import type {
  RenderMediaOnCloudrunInput,
  RenderStillOnCloudrunInput,
} from "@remotion/cloudrun/client";
```

These functions don't have any dependencies on our renderer and can be bundled for example with ESBuild or Webpack (like is the case for example in Next.js).

Importing the light client on edge frameworks (Vercel Edge, Cloudflare Workers) is currently not supported.

**We don't recommend calling these functions from the browser directly, as you will leak your Google Cloud Platform credentials.**

Instead, this light client is meant to reduce the bundle size and avoid problems if you are calling Remotion Cloud Run APIs from another serverless function and therefore need to bundle your function code.

This import is useful for example for Next.js serverless endpoints or similar, which bundle the server-side code.
