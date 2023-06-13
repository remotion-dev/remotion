---
image: /generated/articles-docs-cloudrun-cli-services.png
id: services
sidebar_label: services
title: "npx remotion cloudrun services"
slug: /cloudrun/cli/services
crumb: "Cloud Run CLI Reference"
---

The `npx remotion cloudrun services` command allows you to deploy, view and delete GCP Cloud Run services that can render videos and stills.

- [`deploy`](#deploy)
- [`ls`](#ls)
- [`rm`](#rm)
- [`rmall`](#rmall)

You only need one service per GCP region and Remotion version. Suggested reading: [Do I need to deploy a service for each render?](/docs/cloudrun/faq#do-i-need-to-deploy-a-service-for-each-render)

## deploy

```
npx remotion cloudrun services deploy
```

Creates a new service in your GCP project. If a service exists in the same region, with the same Remotion version, with the same amount of memory, disk space and timeout duration, the name of the already deployed service will be returned instead.

<details>
<summary>
Example output
</summary>
<pre>
Validating Deployment of Cloud Run Service:<br/><br/>
Remotion Version:  3.3.95<br/>
Memory Limit:      2Gi<br/>
CPU Limit:         1.0<br/>
Timeout:           300<br/>
Project Name:      remotion-example<br/>
Region:            us-east1<br/><br/>
Deploying Cloud Run Service...<br/><br/><br/>
Cloud Run Deployed!<br/><br/>
Service name:      remotion--3-3-95--mem512mi--cpu2--t-1200<br/>
Version:           3.3.95<br/>
CPU Limit:         2<br/>
Memory Limit:      512Mi<br/>
Timeout:           1200sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-95--mem512mi--cpu2--t-1200-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-95--mem512mi--cpu2--t-1200/logs<br/><br/>
</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select. The site that the service will be accessing should also be in this same region to minimise latency.

### `--memoryLimit`

The upper bound on the amount of RAM that the Cloud Run service can consume. Default: 512 MB.

### `--cpuLimit`

The maximum number of CPU cores that the Cloud Run service can use to process requests. Default: 1.0.

### `--minInstances`

The minimum number of service instances to have available, regardless of requests. Default: 0.

:::note
Any running instances, even if they are not performing a render, will be billable in GCP. The default minimum number of instances is zero, which means that when no requests are made to your service, you are not billed.
:::

### `--maxInstances`

The maximum number of service instances that can be create by GCP in response to incoming requests. Default: 100.

### `--timeoutSeconds`

Timeout of the Cloud Run service. Default: 300 seconds.

:::info
Not to be confused with the [`--timeout` flag when rendering which defines the timeout for `delayRender()`](/docs/cli/render#--timeout).
:::

### `--quiet`, `-q`

Only logs the service name, and 'Authenticated access granted'.

## ls

```
npx remotion cloudrun services ls
```

Lists the services that you have deployed to GCP in the [selected region](/docs/cloudrun/region-selection).

<details>
<summary>
Example output
</summary>
<pre>
2 services in us-east1<br/><br/>
Service name:      remotion--3-3-95--mem512mi--cpu2--t-1200<br/>
Version:           3.3.95<br/>
CPU Limit:         2<br/>
Memory Limit:      512Mi<br/>
Timeout:           1200sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-95--mem512mi--cpu2--t-1200-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-95--mem512mi--cpu2--t-1200/logs<br/><br/>
Service name:      remotion--3-3-82--mem512mi--cpu1-0--t-800<br/>
Version:           3.3.82<br/>
CPU Limit:         1.0<br/>
Memory Limit:      512Mi<br/>
Timeout:           800sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-82--mem512mi--cpu1-0--t-800-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem512mi--cpu1-0--t-800/logs<br/><br/>
</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to list services from.

### `--quiet`, `-q`

Prints only the service names in a space-separated list. If no services exist, prints `()`

## rm

```
npx remotion cloudrun services rm remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Removes one or more services from your GCP project. Pass a space-separated list of services you'd like to delete.

<details>
<summary>
Example output
</summary>
<pre>
<br/>
Service name:      remotion--3-3-82--mem2gi--cpu1-0--t-800<br/>
Version:           3.3.82<br/>
CPU Limit:         1.0<br/>
Memory Limit:      2Gi<br/>
Timeout:           300sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-82--mem2gi--cpu1-0--t-800-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem2gi--cpu1-0--t-800/logs
Delete? (Y/n):  Y<br/>
Deleted!
<br/>

</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select.

### `--yes`, `-y`

Skips confirmation.

## rmall

```
npx remotion cloudrun services rmall
```

Removes all services from your GCP project for a certain region.

<details>
<summary>
Example output
</summary>
<pre>
2 services in us-east1<br/><br/>
Service name:      remotion--3-3-95--mem512mi--cpu2--t-1200<br/>
Version:           3.3.95<br/>
CPU Limit:         2<br/>
Memory Limit:      512Mi<br/>
Timeout:           1200sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-95--mem512mi--cpu2--t-1200-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-95--mem512mi--cpu2--t-1200/logs<br/><br/>
Delete? (Y/n) n<br/>
Skipping service - remotion--3-3-95--mem512mi--cpu2--t-1200.<br/><br/>
Service name:      remotion--3-3-82--mem512mi--cpu1-0--t-800<br/>
Version:           3.3.82<br/>
CPU Limit:         1.0<br/>
Memory Limit:      512Mi<br/>
Timeout:           800sec<br/>
Region:            us-east1<br/>
Service URL:       https://remotion--3-3-82--mem512mi--cpu1-0--t-800-1a2b3c4d5e-ue.a.run.app<br/>
GCP Console URL:   https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem512mi--cpu1-0--t-800/logs<br/><br/>
Delete? (Y/n) n<br/>
Skipping service - remotion--3-3-82--mem512mi--cpu1-0--t-800.<br/>
</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to remove services from.

### `--yes`, `-y`

Skips confirmation.

## See also

- [Do I need to deploy a service for each render?](/docs/cloudrun/faq#do-i-need-to-deploy-a-service-for-each-render)
- [Setup guide](/docs/cloudrun/setup)
