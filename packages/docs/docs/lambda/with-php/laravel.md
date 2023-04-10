---
image: /generated/articles-docs-lambda-with-php-laravel.png
title: Using Remotion on Laravel PHP Framework
slug: /lambda/remotion-laravel-php
sidebar_label: On Laravel PHP Framework
crumb: "@remotion/lambda"
---

This guide will show you how to use Remotion with a Laravel PHP application. Note that this setup is similar to [Using Remotion in PHP](/docs/lambda/with-php/index).

To supplement this guide, two projects have been created. 

- The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS. It should be noted that this is the same application featured in the [Serverless Framework guide](/docs/lambda/serverless-framework-integration). If the Remotion Lambda has not yet been deployed to your AWS account, follow the setup [guide](/docs/lambda/serverless-framework-integration#remotion-app).

- The [remotion-laravel](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-laravel) is an application that serves a REST endpoint. This endpoint invokes the Remotion lambda function with the necessary parameters to render a video. The Remotion lambda function is deployed from the application.

### Prequisites

- Make sure that your local AWS profile is able to deploy to AWS, or follow this [guide](/docs/lambda/setup) to set up a user for your local machine.
- Ensure that [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) is already deployed on your AWS Account.
- An understanding of [PHP](https://www.php.net/) language.
- Knowledge of how to use the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/) client is required.
- An understanding the use of [composer](https://gettcomposer.org/doc/01-basic-usage.md) in [PHP](https://www.php.net/). And this needs to be installed on your local machine.
- Knowledge of development with [Laravel](https://laravel.com/) PHP framework

## remotion-laravel

This application can be executed on a local machine or computing instance, such as AWS EC2, to call Remotion Lambda and render a video. It includes the minimum parameters required for Remotion's lambda [arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments) from a REST endpoint. After constructing the parameters, they will be passed on to the AWS Lambda Client using the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/). It also contains Laravel boilerplate code for setting up a REST endpoint that calls the Remotion Lambda. This project imitates the operation of [rendermediaonlambda](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and uses [composer](https://gettcomposer.org/doc/01-basic-usage.md).


### Setup

#### 1. Clone or download the project

The project can be found at [`remotion-laravel`](https://github.com/alexfernandez803/remotion-laravel).  
If not done in the previous step, clone the project using:

```bash
git clone https://github.com/alexfernandez803/remotion-laravel
```

#### 2. Go to `remotion-serverless` and traverse to `remotion-laravel` directory

```bash
cd remotion-serverless && cd remotion-laravel
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

  This code is extracted from [here](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Services/RemotionService.php#L24).

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

  The application requires a database, for this application SQLLite is used. So these configuration from `.env` need to be provided.

  ```bash title=".env continued"
  DB_CONNECTION=sqlite
  DB_DATABASE=database.sqlite
  ```

  - `DB_CONNECTION` is the connection type that represents which database to use ie, `MYSQL`
  - `DB_DATABASE` is the database name, for this instance this represents the absolute url path of the sqllte database.

#### 5. Seed the database

The application requires database tables so that users can register and generate authentication token, this is backed by [SQLLite](https://sqlite.org/index.html).

Create the database and table in SQL Lite defined in `DB_DATABASE`.

```bash title="create db and table"
   php artisan vendor:publish --tag=sanctum-migrations
```


#### 6. Running the application

Run the application by executing the command below:

```bash title="Run application"
php artisan serve  
```

```bash title="application logs"
 INFO  Server running on [http://127.0.0.1:8000].  

  Press Ctrl+C to stop the server
```
This application will set up a web server that serves a PHP REST endpoint accessible on port `8000`. It can be interacted with using an API client such as [curl](https://curl.se/) or [Postman](https://www.postman.com/).


### Interacting with the application

The application has an authentication and authorization mechanism in place, backed by a [SQLLite](https://sqlite.org/index.html)  database located in the local directory. Below are the steps for interacting with the application.

  #### Steps
  - <Step>1</Step> Register to the application

  ```bash title="register user"
  curl --location 'http://127.0.0.1:8000/api/register' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "name": "John Doe",
      "email": "testuser@example.com",
      "password": "L3tm3in@@",
      "confirm_password": "L3tm3in@@"
  }'
  ```

  ```bash title="registration response"
{
  "success": true,
  "data": {
      "token": "1|fcIPBALS7sXXXXyJhS3d59qcNEjpaICuqf1J",
      "name": "John Doe"
  },
  "message": "User register successfully."
}
  ```

 - <Step>2</Step> Login to the application

  ```bash title="login request"
    curl --location 'http://127.0.0.1:8000/api/login' \
    --header 'Content-Type: application/json' \
    --data-raw '{
      "email": "alex.frndz@gmail.com",
      "password": "L3tm3in@@"
    }'
  ```

  ```bash title="login response"
  {
    "success": true,
    "data": {
        "token": "2|ykXXPxXXX86pO4rXXXF49VhVXX34yGupU",
        "name": "John Doe"
    },
    "message": "User login successfully."
  }
  ```

  - <Step>3</Step> Use token to render video
    
    ```bash title="render video"
    curl --location --request POST 'http://127.0.0.1:8000/api/renders' \
      --header 'Authorization: Bearer 2|ykXXPxXXX86pO4rXXXF49VhVXX34yGupU'
    ```

      ```bash title="render video response"
      {
        "success": true,
        "data": {
            "bucketName": "remotionlambda-apsoutheast2-xxxxx",
            "renderId": "745b9itxb2"
        },
        "message": "Render Successful."
    }
    ```

    This API operation starts with the Laravel [controller](https://laravel.com/docs/10.x/controllers) called [RenderController.php](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Http/Controllers/RenderController.php) located in the application's directory. The [render](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Http/Controllers/RenderController.php#L24) function within the RenderController.php is executed. From there, the RemotionService [render](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Services/RemotionService.php#L10) function is executed, followed by the [renderOps](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Services/RemotionService.php#L16) function. The renderOps function constructs the arguments required by Remotion's lambda.


## See also
- [Using Remotion on standalone application](/docs/lambda/with-php/index)
- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Using Lambda with SQS](/docs/lambda/sqs)
- [Permissions](/docs/lambda/permissions)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)
- Some codes are borrowed from [github-unwrapped-2021](https://github.com/remotion-dev/github-unwrapped-2021/tree/main/src)
