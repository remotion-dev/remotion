---
image: /generated/articles-docs-lambda-checklist.png
id: checklist
sidebar_label: Production Checklist
title: Production Checklist
slug: /lambda/checklist
crumb: "Lambda"
---

import {DefaultTimeout} from '../../components/lambda/default-timeout';

You have implemented your solution with Remotion Lambda and are ready to launch your project into the world. Congrats!
Before you go live, go through this checklist to make sure Lambda is running stable.

### Optimizing for memory

Adding too much memory to your Lambda functions can make rendering more costly. Reducing the memory of your function by 25% will also decrease your cost by 25%! Redeploy your function multiple times and lower the memory size as much as possible until you feel you hit the sweet spot between low costs and confidence that your video will render reliably.

### Maximum file size

Lambda is constrained to a maximum output file size of approximately [half the disk space](/docs/lambda/disk-size). Adjust the disk space parameter of Lambda to accommodate for the maximum video length that you would like to support. Test the file sizes of your outputs and make sure they don't run at risk of exceeding the limit.
If your video is based on user input, prevent your users from rendering very long videos that would exceed the space available in Remotion Lambda.

### Permissions

Make sure your AWS user only has as many permissions as needed and store your credentials as environment variables. Review the [Permissions](/docs/lambda/permissions) page to see what the minimum amount of permissions is.

### Selecting the right concurrency

If you are using the [`framesPerLambda`](/docs/lambda/rendermediaonlambda#framesperlambda) option, make sure that for each video you render, the parameter is set in a way that it stays within the allowed bounds (no more than 200 lambda functions per render). See: [Concurrency](/docs/lambda/concurrency)

### Bucket privacy

By default the rendered videos are publicly accessible in your bucket. Use the `privacy` setting in [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) and [`renderStillOnLambda()`](/docs/lambda/renderstillonlambda) to make renders private if you'd like so.

### Rate limiting

Consider if it's possible for a user to invoke many video renders that will end up on your AWS bill, and implement a rate limiter to prevent a malicious actor from rendering many videos.

### Timeout

The default timeout for your Lambda function is <DefaultTimeout /> seconds which should be plenty, given that the video rendering is massively parallelized. But also here, measure and adjust the timeout for your needs and make sure it is high enough so that your video render will not fail.

### Valid Company license

Companies with more than 3 people need to buy cloud rendering seats in order to use Remotion Lambda. Please familiarize yourself with the [license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) and [buy the necessary cloud seats](https://www.remotion.pro/) before launching.
