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

Sometimes companies would need to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) on services such as [`Lambda`](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html), [`EC2`](https://aws.amazon.com/ec2/) and other [`Compute Services`](https://aws.amazon.com/products/compute/). Using the long term credential provides risks to be shared inadvertently by residing inside the artifact. The issue of credential sharing can be solve by using [`IAM Roles`](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html), this role can be assumed by lambda to execute activities to AWS resources. The role is given short lived  AWS credentials ie. client id, secret and token, to perform operation it is required to do ie. render a video.


#### Prerequisites
1. This assumes that you have deployed a lambda function running in AWS. Example is created in here using typesript.
2. Lambda Execution Role assiigned to the lambda
3. User Policy [User permissions](/docs/lambda/permissions#user-permissions). 

#### Setup

### 1.  Create role policy
- Go to AWS account IAM Policies section
- Click on "Create policy"
- Click on JSON
- Copy the JSON Policy template below
  
<details>
<summary>Show full user permissions JSON file for latest Remotion Lambda version
</summary>
<UserPolicy />
</details>
- Click next. On the tags page, you don't need to fill in anything. Click next again.
- Give the policy exactly the name `remotion-executionrole-policy`. The other fields can be left as they are.


### 2. Assign the policy to the Lamdba execution role
- From your lambda function assign the policy to the lambda role execution role. To do so, go to the [AWS console](https://console.aws.amazon.com/console/home) ➞ [Lambda(change to your actual region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover) ➞ [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions) ➞ Your lambda function ➞ Configuration tab ➞ Permissions tab ➞ Click the role under `Execution Role` ➞ When redirected, click Permissions tab ➞ Click Add permissions ➞  Attach policy ➞ Find the policy, ie `remotion-executionrole-policy` ➞ Select the policy ➞ Then click the attach policies.

With the assignment of the `policy` to the lambda role, it is now empowered to execute the [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda), thus preventing the issue `UnrecognizedClientException`


:::info
This activity can be also applied to other AWS compute services such as `EC2`.
:::



### Other approaches

#### Use Secrets Manager and access it from Lambda
  Use the [`Secrets Manager`](https://aws.amazon.com/secrets-manager/) to store the long term credentials and retrieve before [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) is executed.
 
### Example

```ts twoslash
// @module: esnext
// @target: es2017
// ---cut---
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'
import { renderMediaOnLambda } from "@remotion/lambda/client";

const secret_name = 'dev/remotion-user'

const client = new SecretsManagerClient({
      region: "us-east-1",
  })


// @ts-ignore
const response = await client.send(
    new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: 'AWSCURRENT',
    })
)
const secret = response.SecretString
const secretValue= JSON.parse(secret)
process.env['REMOTION_AWS_ACCESS_KEY_ID'] = secretValue.remotion_aws_client_id
process.env['REMOTION_AWS_SECRET_ACCESS_KEY'] = secretValue.remotion_aws_client_secret


const { bucketName, renderId } = await renderMediaOnLambda({
  region: "us-east-1",
  functionName: "remotion-render-bds9aab",
  composition: "MyVideo",
  serveUrl:
    "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
  codec: "h264",
});



```

## See also

[Permissions](/docs/lambda/permissions)