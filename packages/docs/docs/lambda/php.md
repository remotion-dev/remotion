---
image: /generated/articles-docs-lambda-php.png
title: Triggering renders from PHP
slug: /lambda/php
sidebar_label: Rendering from PHP
crumb: "@remotion/lambda"
---

To trigger a Lambda render using PHP, you need to use the AWS SDK directly. Below you find a snippet showing the sample call to the AWS SDK. Note the following:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Unstable API: The format that Remotion Lambda accepts can change in every version. You need to consult the [history of this page](https://github.com/remotion-dev/remotion/commits/main/packages/docs/docs/lambda/php/index.md) to see the changes over time. This page always shows the latest version of the payload.
- Sending large input props (>200KB) is not supported with PHP at the moment.

```php title="remotion.php"
<?php

// We'll assume you use Composer, which will add autoload.php
require_once __DIR__ . '/vendor/autoload.php';

use Aws\Lambda\LambdaClient;

<?php


// Specify your environment variables in a .env file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Specify the region you deployed to, for example "us-east-1"
$region = $_ENV['REMOTION_APP_REGION'];
// Specify your S3 bucket name
$bucketName = $_ENV['REMOTION_APP_BUCKET'];
// Specify the function you would like to call
$functionName = $_ENV['REMOTION_APP_FUNCTION_NAME'];
// Specify the URL to your Webpack bundle
$serveUrl = $_ENV["REMOTION_APP_SERVE_URL"];

$credentials = null;

// If you don't have credentials but want to retrieve them using STS, use the AssumeRole feature
if ($_ENV["REMOTION_APP_IS_ASSUME_ROLE"] === true) {
    $credentials = assumeRole($_ENV["REMOTION_APP_REGION"],
        $_ENV["REMOTION_APP_ROLE_ARN"], $_ENV["REMOTION_APP_ROLE_SESSION_NAME"]);
}

$client = LambdaClient::factory([
    'version' => 'latest',
    'region' => $region,
    'credentials' => $credentials,
]);

// Specify your input props here
$data = array("data" => "");
$input = serializeInputProps(
    $data,
    $region,
    "video-or-audio",
    null
);

// Note that the payload format may change in any version.
// This is the structure of the latest version.
$params = array(
    "serveUrl" => $serverUrl,
    "inputProps" => $input,
    "composition" => "main",
    "type" => "start",
    "codec" => "h264",
    // Specify the Remotion version you are using
    "version" => "3.3.82",
    "codec" => "h264",
    "imageFormat" => "jpeg",
    "crf" => null,
    "envVariables" => array(),
    "quality" => 80,
    "maxRetries" => 1,
    "privacy" => 'public',
    "logLevel" => 'info',
    "frameRange" => null,
    "outName" => null,
    "timeoutInMilliseconds" => 30000,
    "chromiumOptions" => array(),
    "scale" => 1,
    "everyNthFrame" => 1,
    "numberOfGifLoops" => 0,
    "concurrencyPerLambda" => 1,
    "downloadBehavior" => array(
        "type" => "play-in-browser",
    ),
    "muted" => false,
    "overwrite" => false,
    "audioBitrate" => null,
    "videoBitrate" => null,
    "webhook" => null,
    "forceHeight" => null,
    "forceWidth" => null,
    "bucketName" => null,
    "audioCodec" => null,
    "forceBucketName" => $bucketName,
    "dumpBrowserLogs" => false,
);

try {
    // Invoke the Lambda function
    $result = $client->invoke([
        'InvocationType' => 'RequestResponse',
        'FunctionName' => $functionName,
        'Payload' => json_encode($params),
    ]);

    $json_response = $result['Payload']->getContents();
    echo $json_response;
} catch (AwsException $e) {
    // Handle the exception
    echo $e->getMessage();
}

function serializeInputProps($inputProps, string $region, string $type, ?string $userSpecifiedBucketName): array
{
    try {
        $payload = json_encode($inputProps);
        $hash = randomHash();

        $MAX_INLINE_PAYLOAD_SIZE = 200000;

        if (strlen($payload) > $MAX_INLINE_PAYLOAD_SIZE) {

            throw new Exception(
                sprintf(
                    "Warning: inputProps are over %dKB (%dKB) in size.\n This is not currently supported.",
                    round($MAX_INLINE_PAYLOAD_SIZE / 1000),
                    ceil(strlen($payload) / 1024)
                )

            );

        }

        return [
            'type' => 'payload',
            'payload' => $payload,
        ];
    } catch (Exception $e) {
        throw new Exception(
            'Error serializing inputProps. Check it has no circular references or reduce the size if the object is big.'
        );
    }
}

function assumeRole($region, $ARN, $sessionName)
{

    try {
        $stsClient = new Aws\Sts\StsClient([
            'region' => $region,
            'version' => 'latest',
        ]);

        $result = $stsClient->AssumeRole([
            'RoleArn' => $ARN,
            'RoleSessionName' => $sessionName,
        ]);

        return [
            'key' => $result['Credentials']['AccessKeyId'],
            'secret' => $result['Credentials']['SecretAccessKey'],
            'token' => $result['Credentials']['SessionToken'],
        ];
    } catch (AwsException $e) {
        // Handle the exception
        echo $e->getMessage();
        return null;
    }
}

```

## Reference applications

2 reference projects are available:

- [php-remotion](https://github.com/alexfernandez803/remotion-serverless/tree/main/php-remotion). This is an application that invokes the Remotion Lambda function containing the minimum parameters to render a video.
- [remotion-laravel](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-laravel) is an application that serves a REST endpoint using [Laravel](https://laravel.com/) PHP framework. This endpoint invokes the Remotion lambda function with the necessary parameters to render a video.

Both use [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app), which includes a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS.

### Bare PHP

Ensure that [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) is already deployed on your AWS Account.

The [`php-remotion`](https://github.com/alexfernandez803/remotion-serverless/tree/main/php-remotion) application will call Remotion Lambda to render a video and contains the bare minimum parameters for Remotion's Lambda [arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments). Once the parameters are [constructed](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Services/RemotionService.php#L42), they will be passed on to the AWS Lambda Client using the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/). This project imitates the operation of [rendermediaonlambda](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and uses [composer](https://gettcomposer.org/doc/01-basic-usage.md).

<p>
<Step>1</Step><strong> Clone or download the project</strong>
</p>

Clone the project using:

```bash
git clone https://github.com/alexfernandez803/php-remotion
```

<p>
<Step>2</Step><strong> Traverse to <code>remotion-serverless/php-remotion</code> </strong>
</p>

```bash
cd remotion-serverless && cd php-remotion
```

<p>
<Step>3</Step> <strong>Install dependencies using Composer</strong>
</p>

```bash
php composer.phar update
```

:::note
If you don't have [Composer](https://getcomposer.org/) installed, follow this [guide](https://getcomposer.org/doc/00-intro.md) to install it.
:::

<p>
<Step>4</Step> <strong>Configure environment variables</strong>
</p>

The application has a `.env` file that needs to be populated for the video render to work properly. An `.env.example` has been included in the project containing example values.

```bash title=".env"
REMOTION_APP_IS_ASSUME_ROLE="false"
REMOTION_APP_REGION="ap-southeast-2"
REMOTION_APP_BUCKET="remotionlambda-apsoutheast2-xxxxxx"
REMOTION_APP_FUNCTION_NAME="remotion-render-3-3-78-mem2048mb-disk2048mb-240sec"
REMOTION_APP_SERVE_URL="https://remotionlambda-apsoutheast2-qv16gcf02l.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.78/index.html"
REMOTION_APP_ROLE_ARN="arn:aws:iam::123456789012:role/xaccounts3access"
REMOTION_APP_ROLE_SESSION_NAME="remotion_session_name"
```

- `REMOTION_APP_REGION` Is the AWS region you are using, e.g `us-east-1`.
- `REMOTION_APP_IS_ASSUME_ROLE` accepts either `true` or `false`. When set to `true` the application the application calls the AWS STS [`AssumeRole`](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) command, retrieve the `key`, `secret` and `token` and pass those credentials in `LambdaClient::factory`. Ensure that `REMOTION_APP_ROLE_ARN` and `REMOTION_APP_ROLE_SESSION_NAME` are provided when using this flag. This approach is appropriate if you want to deploy this application in AWS [EC2](https://aws.amazon.com/ec2/). Roles are required to be set up for the application. Please refer to the [Authenticating Lambda with EC2](/docs/lambda/ec2) guide and follow steps 1 to 4.

  ```bash title="Assume role"
  $credentials = NULL;
  if ($_ENV["REMOTION_APP_IS_ASSUME_ROLE"] === true) {
      $credentials = assumeRole($_ENV["REMOTION_APP_REGION"],
          $_ENV["REMOTION_APP_ROLE_ARN"], $_ENV["REMOTION_APP_ROLE_SESSION_NAME"]);
  }

  $client = LambdaClient::factory([
      'version' => 'latest',
      'region' => $region,
      'credentials' => $credentials,
  ]);
  ```

The following variables can be retrieved by completing the Lambda [setup](/docs/lambda/setup):

- `REMOTION_APP_BUCKET` - Your bucket name
- `REMOTION_APP_FUNCTION_NAME` - The name of your deployed function. Note that it changes on every Remotion version.
- `REMOTION_APP_SERVE_URL` is where your Webpack bundle is hosted.

When you use Remotion on an AWS EC2 instance, set the following env variables. To set up the required roles, please refer to the [Authenticating Lambda with EC2](/docs/lambda/ec2) guide and follow steps `1` to `4`.

- `REMOTION_APP_ROLE_ARN` represents the ARN of the role which the application assume to render the video, for this instance it is `remotion-ec2-executionrole` ARN from `step 2` on this [guide](docs/lambda/ec2).
- `REMOTION_APP_ROLE_SESSION_NAME` a name to uniquely identify the role session when the same role is assumed by different principals.

<p>
<Step>5</Step> <strong>Running the application</strong>
</p>

Run the application by executing the command below:

```bash title="Run application"
php lambda-remotion-render.php
```

```bash title="Sample application response"
{"bucketName":"remotionlambda-apsoutheast2-xxxx","renderId":"b2xhi715yn"}
```

Once the execution is successful, the API will responsd with the `bucketName` and `renderId`. These are metadata required to get the status the video render or retrieving video.

### Laravel

This application can be executed on a local machine or computing instance, such as AWS EC2, to call Remotion Lambda and render a video. It includes the minimum parameters required for Remotion's Lambda [arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments) from a REST endpoint.

After [constructing](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-laravel/app/Services/RemotionService.php#L42) the parameters, they will be passed on to the AWS Lambda Client using the [AWS PHP SDK](https://aws.amazon.com/sdk-for-php/). It also contains Laravel boilerplate code for setting up a REST endpoint that calls the Remotion Lambda. This project imitates the operation of [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and uses [Composer](https://gettcomposer.org/doc/01-basic-usage.md).

<p>
<Step>1</Step><strong> Clone or download the project</strong>
</p>

```bash
git clone https://github.com/alexfernandez803/remotion-laravel
```

<p>
<Step>2</Step><strong> Traverse to <code>remotion-serverless/remotion-laravel</code> </strong>
</p>

```bash
cd remotion-serverless && cd remotion-laravel
```

<p>
<Step>3</Step> <strong>Install dependencies using Composer</strong>
</p>

```bash
php composer.phar update
```

<p>
<Step>4</Step> <strong>Setup environment variables</strong>
</p>

Refer to the bare PHP example for setting up the environment variables.

<p>
<Step>5</Step> <strong>Seed the database</strong>
</p>

The application requires a database, and for this application, [SQLLite](https://sqlite.org/index.html) is used. Therefore, the configuration details from the `.env` file need to be provided.

```bash title=".env (continued)"
DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite
```

- `DB_CONNECTION` is the connection type that represents which database to use ie, `MYSQL`
- `DB_DATABASE` is the database name, for this instance this represents the absolute URL path of the SQLite database.

Create the database and table in SQLite defined in `DB_DATABASE` by executing the command below:

```bash title="Create a database and table"
php artisan vendor:publish --tag=sanctum-migrations
```

<p>
<Step>6</Step> <strong>Running the application</strong>
</p>

Run the application by executing the command below:

```bash title="Run application"
php artisan serve
```

<p>
<Step>7</Step> <strong>Register with the application</strong>
</p>

```bash title="Send register request"
curl --location 'http://127.0.0.1:8000/api/register' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "name": "John Doe",
      "email": "testuser@example.com",
      "password": "L3tm3in@@",
      "confirm_password": "L3tm3in@@"
  }'
```

<p>
<Step>8</Step> <strong>Login to the application</strong>
</p>

```bash title="Log into the application"
curl --location 'http://127.0.0.1:8000/api/login' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "email": "alex.frndz@gmail.com",
    "password": "L3tm3in@@"
  }'

```

```json title="Sample response"
{
  "success": true,
  "data": {
    "token": "2|ykXXPxXXX86pO4rXXXF49VhVXX34yGupU",
    "name": "John Doe"
  },
  "message": "User login successfully."
}
```

<p>
<Step>9</Step> <strong>Use token to render video</strong>
</p>

```bash title="Render video request"
curl --location --request POST 'http://127.0.0.1:8000/api/renders' \
  --header 'Authorization: Bearer 2|ykXXPxXXX86pO4rXXXF49VhVXX34yGupU'
```

```json title="Example response"
{
  "success": true,
  "data": {
    "bucketName": "remotionlambda-apsoutheast2-xxxxx",
    "renderId": "745b9itxb2"
  },
  "message": "Render Successful."
}
```

## Checking progress

For retrieving the progress of a Lambda render, you need to send another request to the Lambda function. Currently we do not have instructions for it, as a reference you may see [here](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-render-progress.ts) for the payload that is being sent by the TypeScript SDK.

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
