---
image: /generated/articles-docs-cloudrun-cli-permissions.png
id: permissions
sidebar_label: permissions
title: "npx remotion cloudrun permissions"
slug: /cloudrun/cli/permissions
crumb: "Cloud Run CLI Reference"
---

Prints and validates the permissions that should be on the IAM role that is attached to the Service Account in GCP, as per the [setup steps](/docs/cloudrun/setup).

```
npx remotion cloudrun permissions
```

<details>
<summary>Show output
</summary>
<pre>
✅ iam.serviceAccounts.actAs

✅ run.operations.get
✅ run.routes.invoke
✅ run.services.create
✅ run.services.get
✅ run.services.delete
✅ run.services.list
✅ run.services.update
✅ storage.buckets.create
✅ storage.buckets.get
✅ storage.buckets.list
✅ storage.objects.create
✅ storage.objects.delete
✅ storage.objects.list
✅ run.services.getIamPolicy
✅ run.services.setIamPolicy

</pre>
</details>

## See also

- [Setup guide](/docs/cloudrun/setup)
