---
image: /generated/articles-docs-lambda-uninstall.png
id: uninstall
title: Uninstall Lambda
slug: /lambda/uninstall
---

Of course we are bummed if you decided not to use Remotion Lambda anymore. We are very receptive to feedback if you'd like to share it with us.

If you would like to remove **all Remotion Lambda related objects** from your infrastructure, you can follow these steps.

:::warning
This will remove all videos already rendered, and break your programs that are using Remotion Lambda to render videos.
:::

## Delete Lambda Functions

You can delete all functions using the following command. The `yes` flag is already included, if you run this, it will delete all functions without confirmation.

```
npx remotion lambda functions rmall -y
```

## Delete projects

```
npx remotion lambda sites rmall -y
```

## Delete renders and artifacts

Delete all S3 buckets starting with `remotionlambda-` from your AWS account.

---

Make sure you have [applied the instructions to all regions](/docs/lambda/region-selection). You have now cleared up your AWS infrastructure from all Remotion Lambda-related resources.
