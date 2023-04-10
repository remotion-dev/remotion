---
image: /generated/articles-docs-lambda-with-php-index.png
title: Using Remotion on standalone PHP application
slug: /lambda/remotion-standalone-php
sidebar_label: On standalone PHP application
crumb: "@remotion/lambda"
---

This guide will show you how to use Remotion with PHP in a standalone application.

To supplement this guide, two projects have been created. 

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. It should be noted that this is the same application as the one featured in the [Serverless Framework guide](/docs/lambda/serverless-framework-integration). Follow the setup [guide](/docs/lambda/serverless-framework-integration#remotion-app), if the Remotion lambda is not yet deployed to your AWS account.

- The [php-remotion](https://github.com/alexfernandez803/remotion-serverless/tree/main/php-remotion). This is an application that invokes the Remotion lambda function containing the bare minimum parameters to render a video. 

### Prequisites

- Make sure that your local AWS profile is able to deploy to AWS, or follow this [guide](/docs/lambda/setup) to set up a user for your local machine.
- Ensure that [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) is already deployed on your AWS Account.
- An understanding of [PHP](https://www.php.net/) language.
- Knowledge of how to use the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/) client is required.
- An understanding the use of [composer](https://gettcomposer.org/doc/01-basic-usage.md) in [PHP](https://www.php.net/). And this needs to be installed on your local machine.

## php-remotion

This is an application that can be executed on a local machine or computing instance like [AWS EC2](https://aws.amazon.com/ec2/). It will call Remotion Lambda to render a video and contains the bare minimum parameters for Remotion's lambda [arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments). Once the parameters are constructed, they will be passed on to the AWS Lambda Client using the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/). This project imitates the operation of [rendermediaonlambda](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and uses [composer](https://gettcomposer.org/doc/01-basic-usage.md).


### Setup

#### 1. Clone or download the project

The project can be found at [`php-remotion`](https://github.com/alexfernandez803/php-remotion).  
If not done in the previous step, clone the project using:

```bash
git clone https://github.com/alexfernandez803/php-remotion
```

#### 2. Go to `remotion-serverless` and traverse to `php-remotion` directory

```bash
cd remotion-serverless && cd php-remotion
```

#### 3. Install dependencies

```bash
php composer.phar update
```

:::note
If you don't have [composer](https://getcomposer.org/) installed, follow this [guide](https://getcomposer.org/doc/00-intro.md) to install in your local machine.
:::

#### 4. Configuring environment variables

The application has a `.env` file that needs to be populated for the video render to work properly. An `.env.example` has been included in the project containing example values.

```bash title=".env"
REMOTION_APP_IS_ASSUME_ROLE="false"
REMOTION_APP_REGION="ap-southeast-2"
REMOTION_APP_BUCKET="remotionlambda-apsoutheast2-xxxxxx"
REMOTION_APP_FUNCTION_NAME="remotion-render-3-3-78-mem2048mb-disk2048mb-240sec"
REMOTION_APP_SERVER_URL="https://remotionlambda-apsoutheast2-qv16gcf02l.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.78/index.html"
REMOTION_APP_ROLE_ARN="arn:aws:iam::123456789012:role/xaccounts3access"
REMOTION_APP_ROLE_SESSION_NAME="remotion_session_name"
```

- `REMOTION_APP_REGION` this is where the Remotion Lambda function AWS region resides.
- `REMOTION_APP_IS_ASSUME_ROLE` accepts either `true` or `false`. This serves as a toggle to use AWS STS or use your AWS local credentials. When set to `true` the application the application calls the AWS STS [Assume Role](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) command, retrieve the  `key`, `secret` and `token` and pass those credentials in `LambdaClient::factory`. Ensure that `REMOTION_APP_ROLE_ARN` and `REMOTION_APP_ROLE_SESSION_NAME` are provided when using the `assume role` functionality. This approach is appropriate if you want to deploy this application in AWS [EC2](https://aws.amazon.com/ec2/). 
  
  ```bash title="assume role"

  $credential = NULL;
  if ($_ENV["REMOTION_APP_IS_ASSUME_ROLE"] === true) {
      $credential = assumeRole($_ENV["REMOTION_APP_REGION"],
          $_ENV["REMOTION_APP_ROLE_ARN"], $_ENV["REMOTION_APP_ROLE_SESSION_NAME"]);
  }

  $client = LambdaClient::factory([
      'version' => 'latest',
      'region' => $region,
      'credentials' => $credential,
  ]);
  ```

  The values for the `env` variables below can be found during the execution of the deployment of the [remotion-app](/docs/lambda/serverless-framework-integration#remotion-app). Please refer to the [Deploy the Lambda function section](/docs/lambda/serverless-framework-integration#5-deploy-the-lambda-function) for more information. Below is an example of the deployment logs:

  ```bash title="Deployment logs"

  Found 1 accounts. Deploying...
  Ensured function="remotion-render-3-3-78-mem2048mb-disk2048mb-240sec" to region="ap-southeast-2" in account 1
  entryPoint /xxxx/code/remotion-serverless/remotion-app/src/index.tsx
  Deployed site to region="ap-southeast-2" in account 1 with bucket="remotionlambda-apsoutheast2-xxxxx" under serverUrl="https://remotionlambda-apsoutheast2-xxxxx.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.78/index.html"
  ```

- `REMOTION_APP_BUCKET` is an `S3` bucket where Remotion temporarily stores metadata and video during the render process. From the deployment logs it will be `remotionlambda-apsoutheast2-xxxxx`.
- `REMOTION_APP_FUNCTION_NAME` is the Remotion function name deployed in AWS, from the deployment logs it will be `remotion-render-3-3-78-mem2048mb-disk2048mb-240sec`.
- `REMOTION_APP_SERVER_URL` is where the remotion host all the compositions, from the deployment logs it will be `https://remotionlambda-apsoutheast2-xxxxx.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.78/index.html`

 If you plan on using this application in an AWS EC2 instance, make sure to fill up the following env variables. To set up the required roles, please refer to the [Authenticating Lambda with EC2](/docs/lambda/ec2) guide and follow steps 1 to 4.

- `REMOTION_APP_ROLE_ARN` represents the ARN of the role which the application assume to render the video, for this instance it is `remotion-ec2-executionrole` ARN from `step 2` on this [guide](docs/lambda/ec2).
- `REMOTION_APP_ROLE_SESSION_NAME` a name to uniquely identify the role session when the same role is assumed by different principals.

#### 5. Running the application

Run the application by executing the command below:

```bash title="Run application"
php lambda-remotion-render.php
```

```bash title="application response"
{"bucketName":"remotionlambda-apsoutheast2-xxxx","renderId":"b2xhi715yn"}
```
## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using Remotion on Laravel PHP Framework](/docs/lambda/with-php/laravel)
- [Using Lambda with SQS](/docs/lambda/sqs)
- [Permissions](/docs/lambda/permissions)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)
- Some codes are borrowed from [github-unwrapped-2021](https://github.com/remotion-dev/github-unwrapped-2021/tree/main/src)
