---
image: /generated/articles-docs-cloudrun-checklist.png
id: checklist
sidebar_label: Production Checklist
title: Production Checklist
slug: /cloudrun/checklist
crumb: "Cloud Run"
---

<ExperimentalBadge>
<p>Cloud Run is in <a href="/docs/cloudrun-alpha">Alpha</a>, which means APIs may change in any version and documentation is not yet finished. See the <a href="https://remotion.dev/changelog">changelog to stay up to date with breaking changes</a>.</p>
</ExperimentalBadge>

import {DefaultTimeout} from '../../components/cloudrun/default-timeout';

You have implemented your solution with Remotion Cloud Run and are ready to launch your project into the world. Congrats!
Before you go live, go through this checklist to make sure Cloud Run is running stable.

### Optimizing for memory

Adding too much memory to your Cloud Run services can make rendering more costly. Redeploy your service multiple times and lower the memory size as much as possible until you feel you hit the sweet spot between low costs and confidence that your video will render reliably.

### Maximum file size

The output file size on Cloud Run is constrained by the memory limit, minus the size of the supporting software for Remotion Cloud Run running on the service. Adjust the disk space parameter of Cloud Run to accommodate for the maximum video length that you would like to support. Test the file sizes of your outputs and make sure they don't run at risk of exceeding the limit.
If your video is based on user input, prevent your users from rendering very long videos that would exceed the space available in Remotion Cloud Run.

### Permissions

Make sure your GCP Service Account only has as many permissions as needed and store your credentials as environment variables. Review the [Permissions](/docs/cloudrun/permissions) page to see what the minimum amount of permissions is.

### Selecting the right concurrency

Using the Remotion API, services will be deployed with a concurrency of 1 (i.e no concurrency). This is to ensure no issues arise from shared CPU and memory of unrelated renders. If you wish to change this, you will need to click 'Edit and Deploy New Revision' from within the Cloud Run section of the GCP Console, and select the desired concurrency.

### Selecting the right instance limit

By default, the Cloud Run service will have a minimum number of instances set to 0, and a maximum instance limit of 100. If more than 100 simultaneous render requests are made at once, a 503 service unavailable will be returned. [Read more about the instance limit here](/docs/cloudrun/instancecount).

### Bucket privacy

By default the rendered videos are publicly accessible in your bucket. Use the `privacy` setting in [`renderMediaOnCloudrun()`](/docs/cloudrun/rendermediaoncloudrun) and [`renderStillOnCloudrun()`](/docs/cloudrun/renderstilloncloudrun) to make renders private if you'd like so.

### Rate limiting

Consider if it's possible for a user to invoke many video renders that will end up on your GCP bill, and implement a rate limiter to prevent a malicious actor from rendering many videos.

### Timeout

The default timeout for your Cloud Run service is <DefaultTimeout /> seconds. Measure and adjust the timeout for your needs and make sure it is high enough so that your video render will not fail.

### Valid Company license

Companies with more than 3 people need to buy cloud rendering seats in order to use Remotion Cloud Run. Please familiarize yourself with the [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) and [buy the necessary cloud seats](https://www.remotion.pro) before launching.
