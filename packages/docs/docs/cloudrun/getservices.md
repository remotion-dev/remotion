---
image: /generated/articles-docs-cloudrun-getservices.png
title: getServices()
id: getservices
slug: /cloudrun/getservices
crumb: "Cloudrun API"
---

Retrieves a list of Remotion services deployed to GCP Cloud Run.

The parameter `compatibleOnly` determines whether only services that are compatible with the installed version of Remotion Cloud Run should be returned.

:::note
The Cloud Run service is versioned and the version of the service must match the version of the `@remotion/cloudrun` package. So if you upgrade Remotion, you should deploy a new service or otherwise you might get an empty array from this function.
:::

To get information about only a single service, use [`getServiceInfo()`](/docs/cloudrun/getserviceinfo).

If you are sure that a service exists, you can also guess the name of it using [`speculateServiceName()`](/docs/cloudrun/speculateservicename) and save an API call to Cloud Run.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { getServices } from "@remotion/cloudrun";

const info = await getServices({
  region: "us-east1",
  compatibleOnly: true,
});

for (const service of info) {
  console.log(service.serviceName); // "remotion--3-3-82--mem512mi--cpu1-0"
  console.log(service.timeoutInSeconds); // 300
  console.log(service.memoryLimit); // 512Mi
  console.log(service.cpuLimit); // 1.0
  console.log(service.remotionVersion); // "3.3.82"
}
```

## Argument

An object containing the following properties:

### `region`

The [GCP region](/docs/cloudrun/region-selection) that you would like to query. It is also possible to pass 'all regions' here, to ignore the region constraint.

### `compatibleOnly`

If `true`, only services that match the version of the current Remotion Lambda package are returned. If `false`, all services are returned.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { getServices } from "@remotion/cloudrun";

const info = await getServices({
  region: "all regions",
  compatibleOnly: true,
});

for (const service of info) {
  console.log(service.serviceName); // "remotion--3-3-82--mem2gi--cpu2--t-1100"
  console.log(service.timeoutInSeconds); // 1100
  console.log(service.memoryLimit); // 2Gi
  console.log(service.cpuLimit); // 2
  console.log(service.remotionVersion); // "3.3.82"
}
```

### `compatibleOnly`

If `true`, only services that match the version of the current Remotion Cloudrun package are returned. If `false`, all Remotion services are returned.

## Return value

A promise resolving to an **array of objects** with the following properties:

### `serviceName`

The name of the service.

### `memoryLimit`

The upper bound on the amount of RAM that the Cloud Run service can consume.

### `cpuLimit`

The maximum number of CPU cores that the Cloud Run service can use to process requests.

### `remotionVersion`

The Remotion version of the service. Remotion is versioning the Cloud Run service and a render can only be triggered from a version of `@remotion/cloudrun` that is matching the one of the service.

### `timeoutInSeconds`

The timeout that has been assigned to the Cloud Run service.

### `uri`

The endpoint of the service.

### `region`

The region of the deployed service. Useful if passing 'all regions' to the region input.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-services.ts)
- [`getServiceInfo()`](/docs/cloudrun/getserviceinfo)
- [`deployService()`](/docs/cloudrun/deployservice)
- [`deleteService()`](/docs/cloudrun/deleteservice)
