---
image: /generated/articles-docs-lambda-s3-public-access.png
title: Cannot create a S3 bucket using Remotion
sidebar_label: Cannot create public bucket
crumb: DevOps advisory
---

import {UserPolicy} from '../../components/lambda/user-permissions.tsx';

Since approximately April 25th 2023, AWS blocks the creation of public buckets without extra configuration, making it impossible to create new S3 buckets with Remotion version v3.3.86 and older.

To make bucket creation work again, you need to upgrade to a newer Remotion version and update your user policy.

## Problem

Users might see an error:

```sh
InvalidBucketAclWithObjectOwnership: Bucket cannot have ACLs set with ObjectOwnership's BucketOwnerEnforced setting.
```

or

```shell
AccessDenied: Access Denied
```

coming from the AWS SDK when trying to create a new site or bucket.

## Cause

AWS does make all buckets private by default and Remotion tries to create a public bucket.

## Resolution

<Step>1</Step> Upgrade to Remotion <code>v3.3.87</code> or later. <br />
<br />

```bash
npx remotion upgrade
```

:::note
Note: When you upgrade Remotion, you will need to deploy new functions as well.
:::

<Step>2</Step> change your policies to give your user the <code>s3:PutBucketOwnershipControls</code> and <code>s3:PutBucketPublicAccessBlock</code> permission. The easiest way
is to copy the following user policy: <br />
<br />

<details>
  <summary>
    Show full user permissions JSON file for latest Remotion Lambda version
  </summary>
  <UserPolicy />
</details>

or type in `npx remotion lambda policies user` after upgrading Remotion Lambda.

Go to the [Users](https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users) section in the AWS console and overwrite the JSON policy of your Remotion Lambda user with the above copied JSON.

You can verify that it worked by running `npx remotion lambda policies validate`.

<Step>3</Step> Redeploy your functions. You don't need to delete your old functions
as it might cause downtime for your application. <br />

<Step>4</Step> As a reminder, you also need to redeploy your site when you upgrade
to a higher Remotion version. <br />

<Step>5</Step> If any values are hardcoded, update the function and site name in
your application code.

## Questions?

Join our [Discord](https://remotion.dev/discord) community to get help from the Remotion team and other users.
