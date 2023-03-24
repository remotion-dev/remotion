---
title: Using Lambda with EC2
slug: /lambda/sqs
sidebar_label: Lambda rendering from ec2
crumb: "@remotion/lambda"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This guide will show you how to trigger Remotion's [`renderMediaOnLambda()`](/docs/lambda/rendermediaonlambda) API from AWS ec2 instance from NodeJS and Typescript. 


To supplement this guide, two projects have been created:

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) contains a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. Note that this is the same application as from the [Serverless Framework guide](/docs/lambda/serverless-framework-integration).
- The [ec2-remotion-lambda](https://github.com/alexfernandez803/remotion-serverless/tree/main/ec2-remotion-lambda). 


## remotion-app

- Follow the same setup instruction from [remotion-app guide](/docs/lambda/serverless-framework-integration#remotion-app) as we will just re-use the application.

## ec2-remotion-lambda

In the following step, the Lambda functions [`enqueue-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/enqueue-function/index.ts) and [`render-lambda-function`](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/src/render-lambda-function/index.ts) will be deployed to your AWS account. This guide is designed to be executed on your local machine.

The project will create all the resources defined by the CDK stack, including setting up [Cognito](https://github.com/alexfernandez803/remotion-serverless/blob/main/apigw-sqs-app/lib/remotion-cdk-starter-stack.ts#L19) for the project's authentication and authorization system, uploading Lambda code, generating and associating IAM roles to your AWS account.

### Prerequisites

- AWS deployment profile on your local machine, to configure an AWS deployment profile on your local machine.
- A AWS policy created named `remotion-executionrole-policy` which is created from this [guide](/docs/lambda/without-iam/#1-create-role-policy).
- The AWS CDK should be installed globally on your local machine. If not yet done, follow the instructions in the "Install the AWS CDK" section [here](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).

### Setup

#### 1. Create the Remotion policy

- The `remotion-executionrole-policy` should have been created, if not, follow this [guide](/docs/lambda/without-iam/#1-create-role-policy) in setting this up.

#### 2. Create a role for the ec2 instance

#### Steps
- Again we assign the policy to the Lambda execution role. Go to the [AWS Management Console](https://console.aws.amazon.com/console/home) and:
  - Navigate to [Lambda (change to your function region)](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/discover)
  - [Functions](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/functions)
  - Select your Lambda function
  - Configuration tab
  - Permissions tab
  - Click the role under `Execution role`
  - When redirected, click Permissions tab
  - Click on `Add permissions`
  - Click "Create inline policy"
  - Click the "JSON" tab

Add a policy statement similar to the one below, which is defining the bucket Lambda needs to transfer the rendered video to.


#### 3. Trust the ec2 role from remotion role

#### 4. Deploy the applicatiion to the ec2

#### 4. Assign the ec2 role from ec2

#### 6. Deploy the apigw-sqs-app project

#### 8. Remove the apigw-sqs-app from your AWS account, if not needed anymore

### Interacting with the API

The API requires an authorization token to interact with it. To obtain the token:

- After successful deployment you will be given out outputs such as `apigw-sqs-app-stack.region`, `apigw-sqs-app-stack.userPoolClientId`, and `apigw-sqs-app-stack.userPoolId`, which are used to authenticate with Cognito.
- If you don't have a frontend which user needs to login, you can create a user and an authentication token manually for the API by following this [guide](docs/lambda/without-iam/example#test-your-endpoint).

From the guide, `YOUR_USER_POOL_CLIENT_ID` is `apigw-sqs-app-stack.userPoolClientId` and `YOUR_USER_POOL_ID` is the `apigw-sqs-app-stack.userPoolId`, the steps should be followed up to retrieving the `IdToken`.

The base API URL has the format of `https://25w651t09g.execute-api.ap-southeast-2.amazonaws.com/dev/enqueue` from the output `apigw-sqs-app-stack.apiUrl`.

## Notes

- 

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using the Serverless Framework with Remotion Lambda](/docs/lambda/serverless-framework-integration)
