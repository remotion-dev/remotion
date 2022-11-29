---
id: functions
sidebar_label: functions
title: "npx remotion lambda functions"
slug: /lambda/cli/functions
crumb: "Lambda CLI Reference"
---

import {DefaultMemorySize} from '../../../components/lambda/default-memory-size';
import {DefaultEphemerealStorageInMb} from '../../../components/lambda/default-disk-size';
import {DefaultTimeout} from '../../../components/lambda/default-timeout';
import {DefaultLogRetention} from '../../../components/lambda/default-log-retention';
import {DefaultArchitecture} from '../../../components/lambda/default-architecture';

The `npx remotion lambda functions` command allows you to deploy, view and delete AWS lambda functions that can render videos.

- [`deploy`](#deploy)
- [`ls`](#ls)
- [`rm`](#rm)
- [`rmall`](#rmall)

You only need one function per AWS region and Remotion version. Suggested reading: [Do I need to deploy a function for each render?](/docs/lambda/faq#do-i-need-to-deploy-a-function-for-each-render)

## deploy

```
npx remotion lambda functions deploy
```

Creates a new function in your AWS account. If a function in the same region, with the same Remotion version, with the same amount of memory, disk space and timeout already exists, the name of the already deployed function will be returned instead.

By default, a CloudWatch Log Group will be created that will log debug information to CloudWatch that you can consult in the case something is going wrong. The default retention period for these logs is 14 days, which can be changed.

<details>
<summary>
Example output
</summary>
<pre>
Region = eu-central-1,
Memory = 2048MB,
Disk = 2048MB,
Timeout = 120sec,
Version = 2021-12-17,
CloudWatch Enabled = true,
CloudWatch Retention Period = 14 days
<br/>
Deployed as remotion-render-2021-12-17-2048mb-120sec
<br/>

</pre>
</details>

### `--region`

The [AWS region](/docs/lambda/region-selection) to select.

### `--memory`

Memory size in megabytes. Default: <DefaultMemorySize /> MB.

### `--disk`

Disk size in megabytes. Default: <DefaultEphemerealStorageInMb /> MB. See also: [Disk size](/docs/lambda/disk-size).

### `--timeout`

Timeout of the Lambda function. Default: <DefaultTimeout /> seconds.

:::info
Not to be confused with the [`--timeout` flag when rendering which defines the timeout for `delayRender()`](/docs/cli/render#--timeout).
:::

### `--architecture`

Architecture to be used for the Lambda. One of `arm64` and `x86_64`. Default: <DefaultArchitecture />.

### `--disable-cloudwatch`

Does not create a CloudWatch log group.

### `--retention-period`

Retention period for the CloudWatch Logs in days. Default: <DefaultLogRetention /> days.

### `--custom-role-arn`

Use a custom role for the function instead of the default (`arn:aws:iam::[aws-account-id]:role/remotion-lambda-role`)

### `--quiet`, `-q`

Only logs the function name.

## ls

```
npx remotion lambda functions ls
```

Lists the functions that you have deployed to AWS in the [selected region](/docs/lambda/region-selection).

<details>
<summary>
Example output
</summary>
<pre>
6 functions in the eu-central-1 region<br/>
Name                                              Version        Memory (MB)    Timeout (sec)  <br/>
remotion-render-2021-12-16-2048mb-240sec          2021-12-16     2048           240          <br/>  
remotion-render-2021-12-17-2048mb-120sec          2021-12-17     2048           120          <br/>  
remotion-render-2021-12-15-2048mb-240sec          2021-12-15     2048           240      
<br/>

</pre>
</details>

### `--region`

The [AWS region](/docs/lambda/region-selection) to select.

### `--quiet`, `-q`

Prints only the function names in a space-separated list. If no functions exist, prints `()`

## rm

```
npx remotion lambda functions rm remotion-render-2021-12-16-2048mb-240sec
```

Removes one or more functions from your AWS infrastructure. Pass a space-separated list of functions you'd like to delete.

<details>
<summary>
Example output
</summary>
<pre>
<br/>
Function name:   remotion-render-2021-12-16-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
Delete? (Y/n):  Y<br/>
Deleted!
<br/>

</pre>
</details>

### `--region`

The [AWS region](/docs/lambda/region-selection) to select.

### `--yes`, `-y`

Skips confirmation.

## rmall

```
npx remotion lambda functions rmall
```

Removes all functions in a region from your AWS infrastructure.

<details>
<summary>
Example output
</summary>
<pre>
<br/>
Function name:   remotion-render-2021-12-16-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
Delete? (Y/n):  Y<br/>
Deleted!
<br/>
Function name:   remotion-render-2021-12-18-2048mb-240sec<br/>
Memory:          2048MB<br/>
Timeout:         120sec<br/>
Version:         2021-12-16<br/>
Delete? (Y/n):  Y<br/>
Deleted!
<br/>

</pre>
</details>

### `--region`

The [AWS region](/docs/lambda/region-selection) to select.

### `--yes`, `-y`

Skips confirmation.

## See also

- [Do I need to deploy a function for each render?](/docs/lambda/faq#do-i-need-to-deploy-a-function-for-each-render)
- [Setup guide](/docs/lambda/setup)
