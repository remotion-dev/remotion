---
image: /generated/articles-docs-cloudrun-deployservice.png
id: deployservice
title: deployService()
slug: /cloudrun/deployservice
crumb: "Cloudrun API"
---

Creates a [GCP Cloud Run](https://cloud.google.com/run) service in your GCP project that will be able to render a video in the cloud.

If a service with the same Remotion version, memory limit, cpu limit and timeout already existed in the specified region, it will be returned instead without a new one being created. This means this service can be treated as idempotent.

## Example

```ts twoslash
// @module: esnext
// @target: es2017

import { deployService } from "@remotion/cloudrun";

const { shortName } = await deployService({
  memoryLimit: "2Gi",
  cpuLimit: "2.0",
  timeoutSeconds: 500,
  projectID: "my-remotion-project",
  region: "us-east1",
});
console.log(shortName);
```

## Arguments

An object with the following properties:

### `memoryLimit`

The upper bound on the amount of RAM that the Cloud Run service can consume. By default we recommend a value of 2GiB. You may increase or decrease it depending on how memory-consuming your video is. The minimum allowed number is `512MiB`, the maximum allowed number is `32GiB`. Since the costs of Remotion Cloud Run is directly proportional to the amount of RAM, we recommend to keep this amount as low as possible. As the Memory limit is raised, there is a [corresponding minimum CPU Limit](https://cloud.google.com/run/docs/configuring/memory-limits#cpu-minimum) that must be observed.

### `cpuLimit`

The maximum number of CPU cores that the Cloud Run service can use to process requests. The default is 1. As the CPU limit is raised, there is a [corresponding minimum Memory Limit](https://cloud.google.com/run/docs/configuring/cpu#setting) that must be observed.

### `minInstances`

The minimum number of service instances to have available, regardless of requests. The default is 0. Some users may wish to increase the minimum instances so that renders are started faster, though this would only reduce cold start time for simultaneous renders up to that minimum limit. [Read more about the minimum instance limit here](/docs/cloudrun/instancecount#minimum-instance-count)

:::warning
Any running instances, even if they are not performing a render, will be billable in GCP. The default minimum number of instances is zero, which means that when no requests are made to your service, you are not billed.
:::

### `maxInstances`

The maximum number of service instances that can be create by GCP in response to incoming requests. The default is 100. [Read more about the maximum instance limit here](/docs/cloudrun/instancecount#maximum-instance-count)

### `timeoutSeconds`

How long the Cloud Run Service may run before it gets killed. Must be below 3600 seconds.

### `projectID`

The [project ID](https://cloud.google.com/resource-manager/docs/creating-managing-projects#:~:text=to%20be%20unique.-,Project%20ID,-%3A%20A%20globally%20unique) of the GCP Project that has been configured for Remotion Cloud Run.

### `region`

The [GCP region](/docs/cloudrun/region-selection) which you want to deploy the Cloud Run Service too.

### `performImageVersionValidation`

Default as true. This will validate that an image exists in the public Artifact Registry that matches the Remotion Version you are trying to deploy. Can be set false for a potential time saving.

## Return value

An object with the following values:

- `fullName` (_string_): The full name of the service just created, in the form `projects/{projectId}/locations/{region}/services/{serviceName}`.
- `shortName` (_string_): The name of the service just created, as it appears in the console.
- `uri` (_string_): The endpoint of the service just created.
- `alreadyExists`: (_boolean_): Whether the creation was skipped because the service already existed.

## See also

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/deploy-service.ts)
- [CLI equivalent: npx remotion cloudrun services deploy](/docs/cloudrun/cli/services#deploy)
- [deleteService()](/docs/cloudrun/deleteservice)
- [getServices()](/docs/cloudrun/getservices)
