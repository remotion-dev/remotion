---
image: /generated/articles-docs-cloudrun-getserviceinfo.png
id: getserviceinfo
title: getServiceInfo()
slug: /cloudrun/getserviceinfo
crumb: "Cloudrun API"
---

Gets information about a service given it's name and region.

To get a list of deployed services, use [`getServices()`](/docs/cloudrun/getservices).

To deploy a service, use [`deployService()`](/docs/lambda/deployservice).

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { getServiceInfo } from "@remotion/cloudrun";

const info = await getServiceInfo({
  region: "us-east1",
  serviceName: "remotion--3-3-82--mem512mi--cpu1-0--t-500",
});
console.log(info.serviceName); // remotion--3-3-82--mem512mi--cpu1-0--t-500
console.log(info.timeoutInSeconds); // 500
console.log(info.memoryLimit); // 1500
console.log(info.cpuLimit); // 2048
console.log(info.remotionVersion); // '2021-07-14'
```

## Arguments

An object containing the following properties:

### `region`

The [GCP region](/docs/cloudrun/region-selection) the service resides in.

### `serviceName`

The name of the service.

## Return value

If the service does not exist, an error is thrown by the GCP SDK.
If the service exists, a promise resolving to an object with the following properties is returned:

### `memoryLimit`

The upper bound on the amount of RAM that the Cloud Run service can consume.

### `cpuLimit`

The maximum number of CPU cores that the Cloud Run service can use to process requests.

### `remotionVersion`

The Remotion version of the service. Remotion is versioning the Cloud Run service and a render can only be triggered from a version of `@remotion/cloudrun` that is matching the one of the service.

### `timeoutInSeconds`

The timeout that has been assigned to the Cloud Run service.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-service-info.ts)
- [`getServices()`](/docs/cloudrun/getservices)
- [`deployService()`](/docs/cloudrun/deployservice)
- [`deleteService()`](/docs/cloudrun/deleteservice)
