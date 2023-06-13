---
image: /generated/articles-docs-cloudrun-instancecount.png
id: instancecount
sidebar_label: Instance Count
title: Instance Count
slug: /cloudrun/instancecount
crumb: "Cloud Run"
---

Remotion Cloud Run will scale up and down as required to account for the number of requests being made to the service. By default, there is no concurrency in the Remotion services. This means that only one render will occur on an instance. When another request is made, GCP will spin up another Cloud Run instance to perform that render.

### Minimum instance count

By default, the Cloud Run service will have a minimum number of instances set to 0. The advantage of this is that it can scale to zero, so if no users are requesting your service, you will not be billed. You may wish to increase the minimum instances so that renders are started faster, though this would only remove cold start time for simultaneous renders up to that minimum limit.

:::warning
Any running instances, even if they are not performing a render, will be billable in GCP. The default minimum number of instances is zero, which means that when no requests are made to your service, you are not billed.
:::

### Maximum instance count

This is the maximum number of instances that can be created at one time, with the default set to 100. The maximum that can be set in GCP is also 100 - [more information around limits can be found here](https://cloud.google.com/run/docs/configuring/max-instances#limits). If the maximum number of instances is exceeded, further requests will fail with a `503 service unavailable` response. GCP provides Cloud Tasks for queueing requests, [which can be used in conjunction with Cloud Run](https://cloud.google.com/run/docs/triggering/using-tasks).

:::note
You may wish to provide a low maximum instance limit for certain tiers of your product, and have a higher instance limit for higher tier plans. This can be achieved by deploying multiple Cloud Run services and calling them within your product as required.
:::

## See also

- Cloud Run CLI - Deploy service with [maximum](/docs/cloudrun/deployservice#maxinstances) and [minimum](/docs/cloudrun/deployservice#mininstances) limits.
- Cloud Run Node API - Deploy service with [maximum](/docs/cloudrun/deployservice#maxinstances) and [minimum](/docs/cloudrun/deployservice#mininstances) limits.
- GCP documentation around [max instance limits](https://cloud.google.com/run/docs/configuring/max-instances#limits).