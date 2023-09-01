---
image: /generated/articles-docs-lambda-auto-delete-renderfiles.png
title: Auto-delete render files
id: auto-delete-renderfiles
slug: /lambda/auto-delete-renderfiles
crumb: "Lambda API"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Automatically delete older render files created by Remotion.

<ExperimentalBadge>
<p>This feature is still new and there is a risk that you cannot recover your files. Please report any issues you encounter.</p>
</ExperimentalBadge>

Do the following to set the automatic delete of older render files.

## Apply the lifecycle rules

This operation will modify the S3 bucket to apply [AWS Lifecycle Rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html). The lifecycle rules will automatically delete files under folder names or prefixes. The predefined expiration or deletion periods for files/folders are `1`, `3`, `7`, and `30` days.

### From Remotion CLI

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npx remotion lambda sites create --site-name=testbed-v6 --enable-folder-expiry=true
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm exec remotion lambda sites create --site-name=testbed-v6 --enable-folder-expiry=true
```

  </TabItem>

</Tabs>

### From Node.js

```ts twoslash
// @module: esnext
// @target: es2017
import { deploySite, getOrCreateBucket } from "@remotion/lambda";
import path from "path";

const { bucketName } = await getOrCreateBucket({
  region: "us-east-1",
  enableFolderExpiry: true,
}); // tells function to create the lifecycle rules

const { serveUrl } = await deploySite({
  entryPoint: path.resolve(process.cwd(), "src/index.ts"),
  bucketName, // use the bucket with lifecyle rules
  region: "us-east-1",
});
console.log(serveUrl);
```

### Applied Life Cycle Rules

<img src="/img/lambda/applied-lc-rules.png" />

## Make renders auto-delete

### Using it in Remotion CLI

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npx remotion lambda render testbed-v6 react-svg --log=verbose --render-folder-expiry-in-days=1
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm exec remotion lambda render testbed-v6 react-svg --log=verbose --render-folder-expiry-in-days=1
```

  </TabItem>

</Tabs>

### Using it in Node.JS

```tsx twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { RenderExpiryDays, renderMediaOnLambda } from "@remotion/lambda/client";

const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  codec: "h264",
  colorSpace: "default",
  renderFolderExpiryInDays: RenderExpiryDays.AFTER_1_DAYS, // the generated file will be deleted after 1 day.
});
```

## How it works

By applying the AWS Lifecycle rules, we are instructing AWS S3 to delete files based on their prefixes. When `renderFolderExpiryInDays` is defined with a value of `RenderExpiryDays.AFTER_1_DAYS`, the render files will be placed into the `render/1days/` folder in S3, to which the deletion rule will be applied. The basis of the deletion is based on the `Last modified date` of the file/folder.

<table>
  <tr>
    <th>
      renderFolderExpiryInDays value
    </th>
    <th>
      Render Prefix
    </th>
  </tr>
  <tr>
    <td>
      <code>AFTER_1_DAYS</code>
    </td>
    <td>
      <code>render/1days/</code>
    </td>
   
  </tr>
  
  <tr>
    <td>
      <code>AFTER_3_DAYS</code>
    </td>
    <td>
      <code>render/3days/</code>
    </td>
   
  </tr>
  <tr>
    <td>
      <code>AFTER_7_DAYS</code>
    </td>
    <td>
      <code>render/7days/</code>
    </td>
   
  </tr>
  <tr>
    <td>
      <code>AFTER_30_DAYS</code>
    </td>
    <td>
      <code>render/30days/</code>
    </td>
   
  </tr>

</table>

### Example expiry applied

<img src="/img/lambda/rendered-file-path.png" />
<img src="/img/lambda/rendered-file-management.png" />

<br/>
<br/>

:::note
AWS does not delete the file on exact time, but it will delete it!
:::

## Getting the progress of render

Due to AWS limitation on postfix search, we need to provide the `renderFolderExpiryInDays` values that we have defined during the render to get the progress of the render.

### From Node.js

```tsx twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { getRenderProgress, RenderExpiryDays } from "@remotion/lambda/client";

const progress = await getRenderProgress({
  renderId: "d7nlc2y",
  bucketName: "remotionlambda-d9mafgx",
  functionName: "remotion-render-la8ffw",
  region: "us-east-1",
  renderFolderExpiryInDays: RenderExpiryDays.AFTER_1_DAYS,
});
```

## See also

- [AWS Expiring objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html)
- [`deploySite()`](/docs/lambda/deploysite)
- [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda)
