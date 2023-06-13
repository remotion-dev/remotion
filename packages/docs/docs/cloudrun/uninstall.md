---
image: /generated/articles-docs-cloudRun-uninstall.png
id: uninstall
title: Uninstall Cloud Run
slug: /cloudRun/uninstall
---

Of course we are bummed if you decided not to use Remotion Cloud Run anymore. We are very receptive to feedback if you'd like to share it with us.

If you would like to remove **all Remotion Cloud Run related objects** from your infrastructure, you can follow these steps.

:::warning
This will remove all videos already rendered, and break your programs that are using Remotion Cloud Run to render videos.
:::

## Delete Cloud Run Services

You can delete all services using the following command. The `yes` flag is already included, if you run this, it will delete all services without confirmation.

```
npx remotion cloudRun services rmall -y
```

## Delete projects

```
npx remotion cloudRun sites rmall -y
```

## Delete renders and artifacts

Delete all Cloud Storage buckets starting with `remotioncloudrun-` from your GCP Project.