---
image: /generated/articles-docs-lambda-usinglambdawithoutiamuser.png
id: usinglambdawithoutiamuser
title: Using Lambda without IAM user
slug: /lambda/using-lambda-without-iam-user
crumb: "Lambda"
---

import {UserPolicy} from '../../components/lambda/user-permissions.tsx';

## Context

As documented on [`permission`](/docs/lambda/permissions) we create a Remotion user and assign `policies`. These policies give permission to Lambda to render a video with [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda). However, this approach poses security risks as the AWS access key ID and secret access key associated with the user are considered long-term credentials and could be inadvertently leaked. Additionally, there might be requirements to execute [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) on services such as [`Lambda`](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), [`EC2`](https://aws.amazon.com/ec2/), and other [`computing services`](https://aws.amazon.com/products/compute/) where the use of long-term credentials is not an option. 

AWS offers the concept of [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles) as a solution to the problem above. When a role is assigned to an AWS service, AWS gives any elevated privileges based on the attached policies and the role is empowered to execute activities such as putting a file to an S3 bucket. The role is given temporary AWS credentials such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` to generate the video. This approach enhances security as there are no long-term credentials lingering around and the need to keep track of their rotation is eliminated.

The steps below provide authorization for the Lambda function to execute `renderMediaOnLambda()` without permission issues.

## Prerequisites
1. A deployed Lambda function running on AWS. An example that tells you how this is done is created [`here`](https://github.com/alexfernandez803/example-lambda) using [`CDK`](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html). It gives you an idea how to call [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) inside another Lambda function. The function is triggered by [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html). The example assumes that you have knowledge of using [`CDK`](https://docs.aws.amazon.com/cdk/v2/guide/work-with-cdk-typescript.html), a [write up](/docs/lambda/example-setup-without-iam-user) for this is also created for anyone that wants to follow.
2. An execution role is assigned to the Lambda function
3. A user policy with the necessary [user permissions](/docs/lambda/permissions#user-permissions).

## Setup

#### 1.  Create role policy
- Go to the IAM policies section in the AWS Management Console
- Click on "Create policy"
- Click on JSON
- Copy the JSON policy template below:
  <details>
  <summary>Show full role permissions JSON file for latest Remotion Lambda version
  </summary>
  <UserPolicy />
  </details>
- Click next. On the tags page, you don't need to fill in anything. Click next again.
- Give the policy the name `remotion-executionrole-policy`. The other fields can be left as they are.


#### 2. Assign the policy to the Lambda execution role
- Go to the [AWS Management Console](https://console.aws.amazon.com/console/home) ➞ Navigate to [Lambda (change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Select your Lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution role` ➞ When redirected, click Permissions tab ➞ Click on `Add permissions` ➞  Attach policy ➞ Find the policy, i.e. `remotion-executionrole-policy` ➞ Select the policy ➞ Then click the `Attach policies` button.

With the assignment of the `policy` to the Lambda execution role, it is now empowered to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) without permission issues. In the background, when the Lambda function is executed, it is provided with environment variables such as `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_SESSION_TOKEN` that has temporary permission to AWS resources that `renderMediaOnLambda()` requires to render the video. The elevated powers came from the policy statements in `remotion-executionrole-policy`.


:::info
This procedure can be also applied to other AWS compute services such as `EC2`, `Fargate` etc..
:::

## Optional 
If you want to move the video to another S3 bucket after it is rendered, the Lambda function also needs permission to do so. The process is similar to the previous steps, but you will need to create a new policy statement that defines the bucket that Lambda needs to transfer the rendered video to.

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

In the example above, the `renderMediaOnLambda()` is configured to output the rendered video to `transfer-to-this-bucket-after-render` bucket. The following steps allow Lambda to move the file to another bucket.

### Steps
- Again we assign the policy to the Lambda execution role. Go to the [AWS Management Console](https://console.aws.amazon.com/console/home) ➞ Navigate to [Lambda (change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Select your Lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution role` ➞ When redirected, click Permissions tab ➞ Click on `Add permissions` ➞ Click create inline policy.
- Click JSON tab
- Add a policy statement similar to the one below, which is defining the bucket Lambda needs to transfer the rendered video to.

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
- Replace {bucketname} with the name of the bucket where you want to move the rendered video to.
- Click Click on `Review policy`
- Then click save changes

The Lambda function can now move the rendered video to the other bucket when the render process is completed.

## See also
- [Example setup without IAM user](/docs/lambda/example-setup-without-iam-user)
