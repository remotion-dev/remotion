---
image: /generated/articles-docs-cloudrun-multiple-buckets.png
title: Multiple buckets in Remotion Cloud Run
slug: /cloudrun/multiple-buckets
sidebar_label: Multiple buckets
crumb: "@remotion/cloudrun"
---

Remotion Cloud Run supports **1 bucket per region and project** that you use Remotion Cloud Run in. It is not necessary to create multiple buckets because:

- A Cloud Storage bucket is an effectively infinitely scalable storage solution.
- Remotion will perfectly isolate each render so they do not interfere with another.
- You can give sites a unique identifier to separate production and development environments.
- The Remotion Cloud Run service is a binary that does not change with your codebase.

You might intuitively create multiple buckets because you have multiple environments, but it is usually not needed.

## Deleting extraneous buckets

If you got an error message

```
You have multiple buckets [remotioncloudrun-1a2b3c4d, remotioncloudrun-howDidThisHappen] in your Cloud Storage region [us-east1] starting with "remotioncloudrun-".
```

delete the extraneous buckets in the GCP console to fix the error.