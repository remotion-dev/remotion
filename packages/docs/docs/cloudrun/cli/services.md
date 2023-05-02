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
Validating Deployment of Cloud Run Service:

    Remotion Version = 3.3.82
    Service Memory Limit = 512Mi
    Service CPU Limit = 1.0
    Service Timeout In Seconds = 300
    Project Name = remotion-6
    Region = us-east1
    Allow Unauthenticated Access = false

Deploying Cloud Run Service...

<br/>
🎉 Cloud Run Deployed! 🎉

    Full Service Name = projects/remotion-6/locations/us-east1/services/remotion--3-3-82--mem512mi--cpu1-0--t-300
    Cloud Run URL = https://remotion--3-3-82--mem512mi--cpu1-0--t-300-abcdefg-ue.a.run.app
    Project = remotion-6
    GCP Console URL = https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem512mi--cpu1-0--t-300/revisions

<br/>

</pre>
</details>

### `--memoryLimit`

The upper bound on the amount of RAM that the Cloud Run service can consume. Default: 512 MB.

### `--cpuLimit`

The maximum number of CPU cores that the Cloud Run service can use to process requests. Default: 1.0.

### `--timeoutSeconds`

Timeout of the Cloud Run service. Default: 300 seconds.

:::info
Not to be confused with the [`--timeout` flag when rendering which defines the timeout for `delayRender()`](/docs/cli/render#--timeout).
:::

### `--allow-unauthenticated`

If passed this allows anyone, including unauthenticated users, to access and interact with the deployed service's endpoint.

### `--quiet`, `-q`

Only logs the service name, and 'Authenticated access granted' or 'Unauthenticated access granted'.

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
3 services in the us-east1 region<br/>
Name                                                                  Version        CPU Limit      Memory Limit   Timeout (sec) <br/>
remotion--3-3-82--mem512mi--cpu1-0--t-800                             3.3.82         1.0            512Mi          800           <br/>
remotion--3-3-82--mem512mi--cpu1-0--t-500                             3.3.82         1.0            512Mi          500           <br/>
remotion--3-3-82--mem1gi--cpu1-0--t-300                               3.3.82         1.0            1Gi            300           <br/>
<br/>

</pre>
</details>

### `--quiet`, `-q`

Prints only the service names in a space-separated list. If no services exist, prints `()`

## rm

```
npx remotion cloudrun services rm remotion-render-2021-12-16-2048mb-240sec
```

Removes one or more services from your GCP project. Pass a space-separated list of services you'd like to delete.

<details>
<summary>
Example output
</summary>
<pre>
<br/>
Function name:   remotion-render-2021-12-16-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
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

Removes all services in a region from your GCP project.

<details>
<summary>
Example output
</summary>
<pre>
<br/>
Function name:   remotion-render-2021-12-16-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
Delete? (Y/n):  Y<br/>
Deleted!
<br/>
Function name:   remotion-render-2021-12-18-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
Delete? (Y/n):  Y<br/>
Deleted!
<br/>

</pre>
</details>

### `--region`

The [GCP region](/docs/cloudrun/region-selection) to select.

### `--yes`, `-y`

Skips confirmation.

## See also

- [Do I need to deploy a service for each render?](/docs/cloudrun/faq#do-i-need-to-deploy-a-service-for-each-render)
- [Setup guide](/docs/cloudrun/setup)
