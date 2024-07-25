---
image: /generated/articles-docs-lambda-sqs.png
title: Using Lambda with SQS
slug: /lambda/sqs
sidebar_label: Queueing with SQS
crumb: '@remotion/lambda'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::note
This process has a flaw: The queue continues as soon as the render is triggered, not as soon as the render has finished. This means the renders do not all execute serially. We are working on an improved version of a Lambda queueing strategy, in the meanwhile be aware of this behavior.
:::

This guide will show you how to use [Amazon SQS](https://aws.amazon.com/sqs/) (Simple Queue Service) and Remotion's [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) API.

Queues are used to park requests to make way for the underlying resources to cope up demand. Since AWS Lambda is subject to a [concurrency limit](/docs/lambda/troubleshooting/rate-limit), you can use SQS to queue renders in the background and you notify the user when the render process is completed by sending them an email or using other means of notification.

To supplement this guide, two projects have been created:

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) contains a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. Note that this is the same application as from the [Serverless Framework guide](/docs/lambda/serverless-framework-integration).
- The [apigw-sqs-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/apigw-sqs-app) (API Gateway SQS) contains a [CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) project that deploys two Lambda functions. The [enqueue-function](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/enqueue-function/index.ts) function, when invoked, queues JSON data sent by the user; this can be an input payload for the Remotion Lambda function. The [render-lambda-function](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/render-lambda-function/index.ts) function listens to enqueued message from SQS, processes it and renders videos.

The `enqueue-function` is configured to be invoked through [API Gateway](https://aws.amazon.com/api-gateway/) and is secured by [Cognito](https://aws.amazon.com/cognito/). The API Gateway and Cognito setup is automatically created by the [CDK Stack](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts) deployment upon execution of `cdk deploy`.

This guide assumes that you have knowledge in using [CDK with TypeScript](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html) and [AWS SQS knowledge](https://aws.amazon.com/sqs/). The AWS Cloud Development Kit (CDK) has been chosen to provision infrastructure as it is an official library from [AWS](https://aws.amazon.com).

## remotion-app

- Follow the same setup instruction from [remotion-app guide](/docs/lambda/serverless-framework-integration#remotion-app) as we will just re-use the application.

## apigw-sqs-app

In the following step, the Lambda functions [`enqueue-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/enqueue-function/index.ts) and [`render-lambda-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/render-lambda-function/index.ts) will be deployed to your AWS account. This guide is designed to be executed on your local machine.

The project will create all the resources defined by the CDK stack, including setting up [Cognito](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L19) for the project's authentication and authorization system, uploading Lambda code, generating and associating IAM roles to your AWS account.

### Prerequisites

- AWS deployment profile on your local machine, to configure an AWS deployment profile on your local machine.
- A AWS policy created named `remotion-executionrole-policy` which is created from this [guide](/docs/lambda/without-iam/#1-create-role-policy).
- The AWS CDK should be installed globally on your local machine. If not yet done, follow the instructions in the "Install the AWS CDK" section [here](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).

### Setup

#### 1. Clone or download the project

The project can be found at [`remotion-serverless project`](https://github.com/alexfernandez803/remotion-serverless). If not done in the previous step, clone the project using:

```bash
git clone https://github.com/alexfernandez803/remotion-serverless
```

#### 2. Go to `remotion-serverless` and traverse to `apigw-sqs-app` directory

```bash
cd remotion-serverless && cd apigw-sqs-app
```

#### 3. Install dependencies

<Tabs
defaultValue="npm"
values={[
{ label: 'npm', value: 'npm', },
{ label: 'yarn', value: 'yarn', },
{ label: 'pnpm', value: 'pnpm', },
]
}>
<TabItem value="npm">

```bash
npm i
```

  </TabItem>

  <TabItem value="pnpm">

```bash
pnpm i
```

  </TabItem>
  <TabItem value="yarn">

```bash
yarn
```

  </TabItem>

</Tabs>

#### 4. Create the Remotion policy

- The `remotion-executionrole-policy` should have been created, if not, follow this [guide](/docs/lambda/without-iam/#1-create-role-policy) in setting this up.

The `remotion-executionrole-policy` is referenced from [here](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L64). The `CDK` stack creates a role for `render-lambda-function` with the `remotion-executionrole-policy`.

```ts
// 👇 Create a role with custom name
const renderFunctionLambdaRole = new Role(this, 'remotionSQSLambdaRole', {
  roleName: 'remotionSQSLambdaRole',
  assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
  managedPolicies: [
    ManagedPolicy.fromAwsManagedPolicyName(
      'service-role/AWSLambdaBasicExecutionRole',
    ),
    ManagedPolicy.fromManagedPolicyName(
      this,
      'remotion-executionrole-policy',
      'remotion-executionrole-policy',
    ),
  ],
});
```

This creates a role in AWS with the name of `remotionSQSLambdaRole` with 2 policies attached:

- `service-role/AWSLambdaBasicExecutionRole` grants permission to the Lambda function to interact with and log information to [CloudWatch](https://aws.amazon.com/cloudwatch/). This policy is part of the AWS library of policies.
- `remotion-executionrole-policy` policy grants permission to the Lambda function to interact to AWS services that Remotion Lambda needs access to in order to render a video. This policy is exactly the same policy from this [guide](/docs/lambda/without-iam/#1-create-role-policy).

#### 5. Optional - Synthesize

From the `apigw-sqs-app` directory, execute the `cdk synthesize` command.

```bash
cdk synthesize
```

This command will show the [CloudFormation Template](https://aws.amazon.com/cloudformation/) that CDK will execute to your AWS account.

#### 6. Deploy the apigw-sqs-app project

From the `apigw-sqs-app` directory, execute the `cdk deploy` command.

```bash
cdk deploy
```

This will orchestrate the generation of resources defined in the CDK stack, which are CloudFormation templates in the background.

```bash title="Deploy output"
 Bundling asset apigw-sqs-app-stack/enqueue-function/Code/Stage...

  cdk.out/bundling-temp-a813aece2454684086de775f918faac45b1b77c67fff24ec6aad4bff8c978ebe/index.js  881.5kb

⚡ Done in 72ms
Bundling asset apigw-sqs-app-stack/render-function/Code/Stage...

  cdk.out/bundling-temp-e7d973ee34691a8e6a2ceda969fbf59380866bb486be333238b7e554907f7b95/index.js  2.6kb

⚡ Done in 2ms

added 279 packages, and audited 280 packages in 2s

21 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

✨  Synthesis time: 7.97s

apigw-sqs-app-stack: building assets...

[0%] start: Building 8efaff13bbe794558db1f1cb8f506bc13b87d7ab3e568ebc324bac680da3a75d:XXXXXXXXXX-ap-southeast-2
[0%] start: Building 3b7a9f596977e2db94a676c6c89c99dd7eb87a5985f97a11ff23b9f338027764:XXXXXXXXXX-ap-southeast-2
[0%] start: Building cf7f13fe5c0ff3b22e7352152a554dd8a4767f6a5e2285e6bf353fc42070e697:XXXXXXXXXX-ap-southeast-2
[33%] success: Built 8efaff13bbe794558db1f1cb8f506bc13b87d7ab3e568ebc324bac680da3a75d:XXXXXXXXXX-ap-southeast-2
[66%] success: Built 3b7a9f596977e2db94a676c6c89c99dd7eb87a5985f97a11ff23b9f338027764:XXXXXXXXXX-ap-southeast-2
[100%] success: Built cf7f13fe5c0ff3b22e7352152a554dd8a4767f6a5e2285e6bf353fc42070e697:XXXXXXXXXX-ap-southeast-2

apigw-sqs-app-stack: assets built

This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬─────────────────────────────┬────────┬─────────────────────────────┬─────────────────────────────┬────────────────────────────────┐
│   │ Resource                    │ Effect │ Action                      │ Principal                   │ Condition                      │
├───┼─────────────────────────────┼────────┼─────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ + │ ${api-integration-role.Arn} │ Allow  │ sts:AssumeRole              │ Service:lambda.amazonaws.co │                                │
│   │                             │        │                             │ m                           │                                │
├───┼─────────────────────────────┼────────┼─────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ + │ ${enqueue-function.Arn}     │ Allow  │ lambda:InvokeFunction       │ Service:apigateway.amazonaw │ "ArnLike": {                   │
│   │                             │        │                             │ s.com                       │   "AWS:SourceArn": "arn:${AWS: │
│   │                             │        │                             │                             │ :Partition}:execute-api:ap-sou │
│   │                             │        │                             │                             │ theast-2:XXXXXXXXXX:${apiC85 │
│   │                             │        │                             │                             │ 50315}/*/*/enqueue"            │
│   │                             │        │                             │                             │ }                              │
│ + │ ${enqueue-function.Arn}     │ Allow  │ lambda:InvokeFunction       │ Service:apigateway.amazonaw │ "ArnLike": {                   │
│   │                             │        │                             │ s.com                       │   "AWS:SourceArn": "arn:${AWS: │
│   │                             │        │                             │                             │ :Partition}:execute-api:ap-sou │
│   │                             │        │                             │                             │ theast-2:XXXXXXXXXX:${apiC85 │
│   │                             │        │                             │                             │ 50315}/*/*/enqueue"            │
│   │                             │        │                             │                             │ }                              │
├───┼─────────────────────────────┼────────┼─────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ + │ ${queue.Arn}                │ Allow  │ sqs:ChangeMessageVisibility │ AWS:${remotionSQSLambdaRole │                                │
│   │                             │        │ sqs:DeleteMessage           │ }                           │                                │
│   │                             │        │ sqs:GetQueueAttributes      │                             │                                │
│   │                             │        │ sqs:GetQueueUrl             │                             │                                │
│   │                             │        │ sqs:ReceiveMessage          │                             │                                │
│ + │ ${queue.Arn}                │ Allow  │ sqs:GetQueueAttributes      │ AWS:${api-integration-role} │                                │
│   │                             │        │ sqs:GetQueueUrl             │                             │                                │
│   │                             │        │ sqs:SendMessage             │                             │                                │
├───┼─────────────────────────────┼────────┼─────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ + │ ${remotionSQSLambdaRole.Arn │ Allow  │ sts:AssumeRole              │ Service:lambda.amazonaws.co │                                │
│   │ }                           │        │                             │ m                           │                                │
└───┴─────────────────────────────┴────────┴─────────────────────────────┴─────────────────────────────┴────────────────────────────────┘
IAM Policy Changes
┌───┬──────────────────────────┬────────────────────────────────────────────────────────────────────────────────┐
│   │ Resource                 │ Managed Policy ARN                                                             │
├───┼──────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ + │ ${api-integration-role}  │ arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole │
├───┼──────────────────────────┼────────────────────────────────────────────────────────────────────────────────┤
│ + │ ${remotionSQSLambdaRole} │ arn:${AWS::Partition}:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole │
│ + │ ${remotionSQSLambdaRole} │ arn:${AWS::Partition}:iam::XXXXXXXXXX:policy/remotion-executionrole-policy   │
└───┴──────────────────────────┴────────────────────────────────────────────────────────────────────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? y

```

Select 'y' for the answer of the prompt and CDK will continue to deploy the Stack, with the 2 function.

```bash title="final output"
apigw-sqs-app-stack: deploying... [1/1]
[0%] start: Publishing 8efaff13bbe794558db1f1cb8f506bc13b87d7ab3e568ebc324bac680da3a75d:XXXXXXXXXX-ap-southeast-2
[0%] start: Publishing 3b7a9f596977e2db94a676c6c89c99dd7eb87a5985f97a11ff23b9f338027764:XXXXXXXXXX-ap-southeast-2
[0%] start: Publishing cf7f13fe5c0ff3b22e7352152a554dd8a4767f6a5e2285e6bf353fc42070e697:XXXXXXXXXX-ap-southeast-2
[33%] success: Published 3b7a9f596977e2db94a676c6c89c99dd7eb87a5985f97a11ff23b9f338027764:XXXXXXXXXX-ap-southeast-2
[66%] success: Published 8efaff13bbe794558db1f1cb8f506bc13b87d7ab3e568ebc324bac680da3a75d:XXXXXXXXXX-ap-southeast-2
[100%] success: Published cf7f13fe5c0ff3b22e7352152a554dd8a4767f6a5e2285e6bf353fc42070e697:XXXXXXXXXX-ap-southeast-2
apigw-sqs-app-stack: creating CloudFormation changeset...

 ✅  apigw-sqs-app-stack

✨  Deployment time: 158.36s

Outputs:
apigw-sqs-app-stack.apiUrl = https://6mvgq2iad9.execute-api.ap-southeast-2.amazonaws.com/
apigw-sqs-app-stack.queuearn = arn:aws:sqs:ap-southeast-2:XXXXXXXXXX:remotion_queue
apigw-sqs-app-stack.queuename = remotion_queue
apigw-sqs-app-stack.queueurl = https://sqs.ap-southeast-2.amazonaws.com/XXXXXXXXXX/remotion_queue
apigw-sqs-app-stack.region = ap-southeast-2
apigw-sqs-app-stack.userPoolClientId = 5d88adjpffj314pm4pot8g292i
apigw-sqs-app-stack.userPoolId = ap-southeast-2_vzSlhO9O0
Stack ARN:
arn:aws:cloudformation:ap-southeast-2:XXXXXXXXXX:stack/apigw-sqs-app-stack/acb8b8f0-a52a-11ed-a440-024da00b5a8e

```

The deployment will provide variables such as `apigw-sqs-app-stack.region`, `apigw-sqs-app-stack.userPoolClientId`, and `apigw-sqs-app-stack.userPoolId`.

#### 8. Remove the apigw-sqs-app from your AWS account, if not needed anymore

From the `apigw-sqs-app` directory.

```bash
cdk destroy
```

### Combining API Gateway, Remotion Lambda and SQS together.

These are important information on how IAM roles are used by the function and instructions to enable the [render-lambda-function](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L97) to consume SQS messages.

From [CDK stack code](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L64), here are the important parts to take note of.

- The stack creates a queue named `remotion_queue`.

```js title="create queue"
// 👇 create the queue
const remotionQueue = new sqs.Queue(this, 'queue', {
  encryption: sqs.QueueEncryption.KMS_MANAGED,
  queueName: 'remotion_queue',
});
```

- `remotion_queue` grants access to 2 Lambda functions to interact with it. Each individual role are assigned to their respective Lambda function.

  ```js title="apiIntegrationRole"
  // 👇 create the apiIntegrationRole role
  const apiIntegrationRole = new IAM.Role(this, 'api-integration-role', {
    assumedBy: new IAM.ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole',
      ),
    ],
  });
  ```

- This role is assigned to [`enqueue-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L86), to allow it to write CloudWatch logs.

  ```js title="remotionSQSLambdaRole"
  // 👇 create a role with custom name
  const renderFunctionLambdaRole = new Role(this, 'remotionSQSLambdaRole', {
    roleName: 'remotionSQSLambdaRole',
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaBasicExecutionRole',
      ),
      ManagedPolicy.fromManagedPolicyName(
        this,
        'remotion-executionrole-policy',
        'remotion-executionrole-policy',
      ),
    ],
  });
  ```

- The [`render-lambda-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L97) has been assigned this role, which includes access to interact with Cloudwatch and permission to access other AWS services as specified in the `remotion-executionrole-policy`.

  ```js title="Grant access to the queue"
  // 👇 Grant permission to publish to the queue
  remotionQueue.grantSendMessages(apiIntegrationRole);
  // 👇 grant permission to consume messages from the queue
  remotionQueue.grantConsumeMessages(renderFunctionLambdaRole);
  ```

- Allow the render function to listen to the queue.

  ```js title="Listen to queue"
  remotionRenderFunction.addEventSource(
    new SqsEventSource(remotionQueue, {
      batchSize: 1,
      maxBatchingWindow: Duration.minutes(5),
      reportBatchItemFailures: true, // default to false
    }),
  );
  ```

### Interacting with the API

The API requires an authorization token to interact with it. To obtain the token:

- After successful deployment you will be given out outputs such as `apigw-sqs-app-stack.region`, `apigw-sqs-app-stack.userPoolClientId`, and `apigw-sqs-app-stack.userPoolId`, which are used to authenticate with Cognito.
- If you don't have a frontend which user needs to login, you can create a user and an authentication token manually for the API by following this [guide](/docs/lambda/without-iam/example#test-your-endpoint).

From the guide, `YOUR_USER_POOL_CLIENT_ID` is `apigw-sqs-app-stack.userPoolClientId` and `YOUR_USER_POOL_ID` is the `apigw-sqs-app-stack.userPoolId`, the steps should be followed up to retrieving the `IdToken`.

The base API URL has the format of `https://25w651t09g.execute-api.ap-southeast-2.amazonaws.com/dev/enqueue` from the output `apigw-sqs-app-stack.apiUrl`.

#### Trigger a video generation request

```bash title="render video"
curl --location --request POST 'https://xxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/dev/enqueue' \
--header 'Authorization: Bearer eyJraWQiOiJMVVVVZGtIQ1JXWEEyWEEXXXXXXXXXjMKR1t5S-oA' \
--data-raw '{
    "message": "Hello"
}'
```

```bash title="response"
{
   {"message":"Message Send to SQS- Here is MessageId: a6abd0bc-b838-48b5-a562-4c511fac5b2f"}
}
```

This will initiate the render request of a video by taking the JSON and putting it in the queue.  
On the other end, [`render-lambda-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/render-lambda-function/index.ts) will be notified by SQS that is a video render request, it will consume the data from the render request and generate the video as per instruction, the function executes [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) as part of the process.

## Notes

- The deployment of Remotion Lambda is configured to be deployed only to `ap-southeast-2` region to simplify the project, adjust this in the code at [`region.ts`](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/regions.ts).
- The deployment of `apigw-sqs-app` is configured to be deployed at `ap-southeast-2` region to simplify the project, adjust this in the code at [`remotion-cdk-starter.ts`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/bin/remotion-cdk-starter.ts).
- Remotion packages should be bundled inside the function when deployed, you can this in `nodeModules` property from `bundling` object, the code for this located in [here](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L103).

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using the Serverless Framework with Remotion Lambda](/docs/lambda/serverless-framework-integration)
