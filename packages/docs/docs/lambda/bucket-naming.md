---
title: Bucket names in Remotion Lambda
slug: /lambda/bucket-naming
sidebar_label: Bucket naming
crumb: "@remotion/lambda"
---

Remotion Lambda buckets by default are all prefixed `remotionlambda-` and contain their region.

If you want to change the defaults , it comes with a few disadvantages.

## Using a different bucket names

## Region information in the name

The buckets contain the region in their name. This is because when the list of AWS buckets is obtained through the AWS API, the region is not included in the response. If the region is not in the bucket name, it needs to be queried for each bucket, which is a lot of extra API calls and can slow down the render.

If you set up your buckets with a Remotion version before December 2022, you have bucket names that do not include the region in their name. If you re-setup the buckets, you may get a speed gain and reduced API calls, especially if you have a lot of Remotion buckets across regions.
