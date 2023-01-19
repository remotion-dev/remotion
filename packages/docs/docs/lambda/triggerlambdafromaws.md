---
image: /generated/articles-docs-lambda-triggerlambdafromaws.png
id: triggerlambdafromaws
title: Remotion and AWS Compute Services
slug: /lambda/trigger-lambda-from-aws
crumb: "Lambda"
---

import {UserPolicy} from '../../components/lambda/user-permissions.tsx';

## Context

As specified on [`permission()`](/docs/lambda/permissions), we create a remotion user to assume the permissions to render a video using  [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda). This approach is sometimes not acceptable for other companies as the AWS client id and secret associated with the user are long term credentials and prone to be leaked.

Sometimes companies would need to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) on services such as [`Lambda`](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), [`EC2`](https://aws.amazon.com/ec2/) and other [`compute services`](https://aws.amazon.com/products/compute/). Using the long term credential provides risks to be shared inadvertently by residing inside the artifact. The issue of credential sharing can be solve by using [`IAM Roles`](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html), this role can be assumed by lambda to execute activities to AWS resources. The role is given short lived  AWS credentials ie. client id, secret and token, to perform operation it is required to do ie. render a video.

#### Allowing lambda to execute `renderMediaOnLambda`

#### Prerequisites
1. This assumes that you have deployed a `lambda` function running in AWS. Example is created in here using typesript. This function can be triggered by [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) or [SQS](https://aws.amazon.com/sqs/).
2. Lambda Execution Role assiigned to the lambda
3. User Policy [User permissions](/docs/lambda/permissions#user-permissions). 

### Setup

#### 1.  Create role policy
- Go to AWS account IAM Policies section
- Click on "Create policy"
- Click on JSON
- Copy the JSON Policy template below
  
<details>
<summary>Show full role permissions JSON file for latest Remotion Lambda version
</summary>
<UserPolicy />
</details>
- Click next. On the tags page, you don't need to fill in anything. Click next again.
- Give the policy exactly the name `remotion-executionrole-policy`. The other fields can be left as they are.


#### 2. Assign the policy to the Lamdba execution role
- From your lambda function assign the policy to the lambda role execution role. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [Lambda(change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Your lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution Role` ➞ When redirected, click Permissions tab ➞ Click Add permissions ➞  Attach policy ➞ Find the policy, ie `remotion-executionrole-policy` ➞ Select the policy ➞ Then click the attach policies.

With the assignment of the `policy` to the lambda role, it is now empowered to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), as it assumed permission required to do so from policy statements. In the background, when the lambda function is executed it is provided with environment variables such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` that has temporary permission to AWS resources that `renderMediaOnLambda` requires to render the video.


:::info
This activity can be also applied to other AWS compute services such as `EC2`.
:::

#### Optional 
If you want to move the video to another s3 bucket when the video is rendered, the `lambda` also needs a permission to do so into the new bucket.

#### Example
```ts twoslash
// @module: esnext
// @target: es2017
// ---cut---

import { renderMediaOnLambda } from "@remotion/lambda/client";
 
const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  codec: "h264",
  outName: "transfer-to-this-bucket-after-render",
});
```

From the example above, the `renderMediaOnLambda` is configured to output the video to `transfer-to-this-bucket-after-render`. The steps to allow the lambda to access the bucket is similar to [this](/docs/lambda/trigger-lambda-from-aws#setup).

### Steps
- From your lambda function assign the policy to the lambda role execution role. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [Lambda(change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Your lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution Role` ➞ When redirected, click Permissions tab ➞ Click Add permissions ➞ Click create inline policy.
- Click JSON tab
- Add policy statement similar below defining the bucket the lambda needs to transfer the rendered file.

```json
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::{buckername}",
                "arn:aws:s3:::{buckername}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```
- Click review policy
- Then click save changes


## See also

[Permissions](/docs/lambda/permissions)