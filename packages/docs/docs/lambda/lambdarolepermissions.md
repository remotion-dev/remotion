---
image: /generated/articles-docs-lambda-lambda-role-permissions.png
id: lambdarolepermissions
title: Lambda permissions
slug: /lambda/lambda-role-permissions
crumb: "Lambda"
---

import {UserPolicy} from '../../components/lambda/user-permissions.tsx';

## Context

As documented on [`permission`](/docs/lambda/permissions) we create a remotion user and assign `policies`, this policies gives permissions to the `lambda` to render video from [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda). This approach is sometimes not acceptable as AWS client id and secret associated with the user are considered long term credentials and prone for inadvertent leakage.

There also some that has requirements to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) on services such as [`Lambda`](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), [`EC2`](https://aws.amazon.com/ec2/) and other [`compute services`](https://aws.amazon.com/products/compute/) which using the long term credentials is not an option. AWS has the concept of [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles), when a role is assigned to a AWS service it assumes any elevated privileges from the attached AWS `policies`, it is empowered to execute activities such as putting a file to S3 bucket. The role is given short lived  AWS credentials such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN`, to generate the video. With this approach security is enhanced as we don't have any long term credential lurking around and we don't need to keep track of it's rotation.

The steps below provides authorization to the lambda function to execute `renderMediaOnLambda()` without permission issues.

#### Prerequisites
1. This assumes that you have deployed a `lambda` function running in AWS. An example is created in [`here`](https://github.com/remotion-dev/remotion/tree/main/packages/example-lambda) using [`CDK`](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html) to give you an idea how to call [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) inside another a lambda function, the function is triggered by [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html). This assumes that you have knowledge on using [`CDK`](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html), a [write up](/docs/lambda/serverless-lambdas-setup) for this is also created for anyone to follow.
2. Lambda execution role assigned to the lambda
3. User Policy [user permissions](/docs/lambda/permissions#user-permissions). 

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
- From your lambda function assign the policy to the lambda role execution role. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [Lambda(change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Your lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution Role` ➞ When redirected, click Permissions tab ➞ Click Add permissions ➞  Attach policy ➞ Find the policy, ie `remotion-executionrole-policy` ➞ Select the policy ➞ Then click the attach policies button.

With the assignment of the `policy` to the lambda execution role, it is now empowered to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), without permission issues. In the background, when the lambda function is executed it is provided with environment variables such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` that has temporary permission to AWS resources that `renderMediaOnLambda()` requires to render the video. The elevated powers came from the policy statements in `remotion-executionrole-policy`.


:::info
This activity can be also applied to other AWS compute services such as `EC2`, `Fargate` etc..
:::

## Optional 
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
  outName: "transfer-to-this-bucket-after-render/the-filename.mp4",
});
```

From the example above, the `renderMediaOnLambda()` is configured to output the video to `transfer-to-this-bucket-after-render` bucket. The steps to allows the lambda to move the file to the other bucket, which is similar to [this](/docs/lambda/trigger-lambda-from-aws#setup).

### Steps
- From your lambda function assign the policy to the lambda execution role. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [Lambda(change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Your lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution role` ➞ When redirected, click Permissions tab ➞ click `add permissions` ➞ Click create inline policy.
- Click JSON tab
- Add policy statement similar below defining the bucket the lambda needs to transfer the rendered file.

```json
  {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
               "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::{bucketname}",
                "arn:aws:s3:::{bucketname}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```
- Click review policy
- Then click save changes

The lambda function can now move the rendered video to the other bucket when render process is completed.

## See also
- [Serverless lambda setup](/docs/lambda/serverlesslambdasetup)