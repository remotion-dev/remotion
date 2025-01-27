---
image: /generated/articles-docs-lambda-autodelete.png
title: Auto-delete renders
id: autodelete
slug: /lambda/autodelete
crumb: 'Lambda API'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

_available from v4.0.32_

To automatically delete renders and associated files after some time, you need to:

<Step>1</Step> Enable the lifecycle rules on the AWS bucket. <br />
<Step>2</Step> Render a video with the <code>deleteAfter</code> option.

## Apply the lifecycle rules

<Step>1</Step> <strong>Ensure the right permission</strong>

To put a lifecycle rule on the bucket, you need to have the `s3:PutLifecycleConfiguration` permission for your user.

- If you set up Remotion Lambda after 4.0.32, you have it automatically.
- If you set up Remotion Lambda previously, execute the following:
  1. Upgrade to at least Remotion 4.0.32.
  2. [Click here](https://us-east-1.console.aws.amazon.com/iamv2/home) to go to the users section in the AWS console.
  3. Select your user.
  4. Under "Permissions policies", click your policy (underlined in blue)
  5. Choose the "JSON" mode for editing.
  6. Under the `"Sid": "Storage"` section, add `"s3:PutLifecycleConfiguration"` to the `"Action"` array.
  7. Save.

<br />
<Step>2</Step> <strong>Enable the lifecycle rules</strong>

Redeploy the site with the `--enable-folder-expiry` option. This operation will modify the S3 bucket to apply [AWS Lifecycle Rules](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html).

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'Node.JS', value: 'bucket', },
]
}>
<TabItem value="cli">

```bash title="In the command line"
npx remotion lambda sites create --site-name=my-site-name --enable-folder-expiry
```

  </TabItem>

  <TabItem value="bucket">

```ts twoslash title="deploy.mjs" {6}
import {deploySite, getOrCreateBucket} from '@remotion/lambda';
import path from 'path';

const {bucketName} = await getOrCreateBucket({
  region: 'us-east-1',
  enableFolderExpiry: true,
});

const {serveUrl} = await deploySite({
  entryPoint: path.resolve(process.cwd(), 'src/index.ts'),
  bucketName, // use the bucket with lifecyle rules
  region: 'us-east-1',
});
console.log(serveUrl);
```

  </TabItem>

</Tabs>

<details>
  <summary>Verify that it worked</summary>
  <p>In your S3 bucket, under "Management", you should see 4 lifecycle rules.</p>
  <img src="/img/lambda/applied-lc-rules.png" />
</details>

<br />

## Trigger a render with expiration

Valid values are `"1-day"`, `"3-days"`, `"7-days"` and `"30-days"`.

<Tabs
defaultValue="cli"
values={[
{ label: 'CLI', value: 'cli', },
{ label: 'renderMediaOnLambda()', value: 'rendermedia', },
{ label: 'renderStillOnLambda()', value: 'renderstill', },
]
}>
<TabItem value="cli">

```bash
npx remotion lambda render testbed-v6 react-svg --delete-after="1-day"
```

  </TabItem>

  <TabItem value="rendermedia">

```tsx twoslash title="render.ts" {10}
// ---cut---
import {renderMediaOnLambda} from '@remotion/lambda/client';

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  codec: 'h264',
  deleteAfter: '1-day',
});
```

  </TabItem>
  <TabItem value="renderstill">

```tsx twoslash title="render.ts" {12}
// ---cut---
import {renderStillOnLambda} from '@remotion/lambda/client';

const {bucketName, renderId} = await renderStillOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  inputProps: {},
  privacy: 'public',
  imageFormat: 'png',
  deleteAfter: '1-day',
});
```

  </TabItem>
</Tabs>

<details>
<summary>
Verify that it worked

</summary>

<p>All files should have an expiration rule and expiration date set when viewing the object properties.</p>

<img src="/img/lambda/rendered-file-path.png" />
<img src="/img/lambda/rendered-file-management.png" />

<br />
<br />

AWS does not delete the file at the exact time, but the deletion will happen.

</details>

## How it works

By applying the AWS Lifecycle rules, we are instructing AWS S3 to delete files based on their prefixes. When `deleteAfter` is defined with a value of `"1-day"`, the `renderId` will be prefixed with `1-day`, and the S3 key will start with `renders/1-day-*`, to which the deletion rule will be applied.  
The basis of the deletion is based on the `Last modified date` of the file/folder.

<table>
  <tr>
    <th>
      <code>deleteAfter</code> value
    </th>
    <th>
      Render Prefix
    </th>
  </tr>
  <tr>
    <td>
      <code>1-day</code>
    </td>
    <td>
      <code>renders/1-day</code>
    </td>
   
  </tr>
  
  <tr>
    <td>
      <code>3-days</code>
    </td>
    <td>
      <code>renders/3-days</code>
    </td>
   
  </tr>
  <tr>
    <td>
      <code>7-days</code>
    </td>
    <td>
      <code>renders/7-days</code>
    </td>
   
  </tr>
  <tr>
    <td>
      <code>30-days</code>
    </td>
    <td>
      <code>renders/30-days</code>
    </td>
   
  </tr>

</table>

## See also

- [AWS Expiring objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/lifecycle-expire-general-considerations.html)
- [`deploySite()`](/docs/lambda/deploysite)
- [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda)
