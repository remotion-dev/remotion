---
image: /generated/articles-docs-lambda-feb-2023-incident.png
title: Upgrade your Lambda functions to prevent breakage
sidebar_label: Feb 2023 Incident
crumb: DevOps advisory
---

import {UserPolicy} from '../../components/lambda/user-permissions.tsx';

:::info
In Remotion 4.0, this problem is fixed.
:::

On February 24th 2023, a new version of the AWS Lambda Node.JS runtime started rolling out that breaks Remotion Lambda.  
Remotion Lambda users are advised to read this document to avoid any downtime.

## Problem

Users might see an error:

```bash
Error: expected to launch
```

or

```bash
Failed to launch the browser process!



TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
```

## Cause

AWS Lambda has rolled out an update to their Lambda runtime for Node.JS to update it from `v14.28` to `v14.29`.  
This update causes the headless Chromium browser to exit with a `SIGBUS` error for a yet unknown reason.

## Advisory

We recommend to **not deploy any new functions** until the issue is resolved as new functions are subject to getting the new runtime.  
Since at a later point, AWS will roll out the runtime to any existing functions, we recommend to upgrade to Remotion `3.3.54` or later in the near future and redeploy your functions.

## Resolutions

### Option 1: `v3.3.54` update (recommended)

In Remotion `v3.3.54`, Remotion will lock the AWS Lambda Node.JS runtime to `v14.28` to prevent this issue from happening.  
Locking a runtime on AWS Lambda is only possible since January 23rd, 2023, hence the reason why we are only releasing this update now.

To apply the fix, you need to:

<Step>1</Step> upgrade Remotion: <br />
<br />

```bash
npx remotion upgrade
```

<Step>2</Step> change your policies to give your user the <code>
  lambda:PutRuntimeManagementConfig
</code> permission. The easiest way is to copy the following user policy: <br />
<br />

<details>
  <summary>
    Show full user permissions JSON file for latest Remotion Lambda version
  </summary>
  <UserPolicy />
</details>

or type in `npx remotion lambda policies user` after upgrading Remotion Lambda.

Go to the [Users](https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users) section in the AWS console and overwrite the JSON policy of your Remotion Lambda user with the above copied JSON.

<Step>3</Step> Redeploy your functions. You don't need to delete your old functions
as it might cause downtime for your application. <br />

<Step>4</Step> As a reminder, you also need to redeploy your site when you upgrade
to a higher Remotion version. <br />

<Step>5</Step> If any values are hardcoded, update the function and site name in
your application code.

### Option 2: Manually update the runtime in the AWS console

Alternatively, for each of your Lambda functions, you can lock the runtime version in the AWS console:

<Step>1</Step> Go to the function in the AWS dashboard and click "Edit Runtime management
configuration".
<br />
<br />

<img src="/img/runtimesettings.png" />

<Step>2</Step> Set it to "Manual". <br />

<Step>3</Step> Set the runtime to <code>arn:aws:lambda:[region]::runtime:69000d3430a08938bcab71617dffcb8ea551a2cbc36c59f38c52a1ea087e461b</code>
. Replace <code>[region]</code> with the code for the AWS region (e.g. <code>us-east-1</code>) <br />

<Step>4</Step> Click "Save". Repeat this for any functions you have deployed.

## Long-term solution

We have upgraded to a AWS Business support tier and reached out to them to make them aware of the issue and hope to cooperate on a solution soon.

Since it recently became possible to lock the AWS Lambda runtime version, we will be using this option going forward to make Remotion more resilient to future runtime updates.

## Questions?

Join our [Discord](https://remotion.dev/discord) community to get help from the Remotion team and other users.
