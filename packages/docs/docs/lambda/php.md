---
image: /generated/articles-docs-lambda-php.png
title: Triggering renders from PHP
slug: /lambda/php
sidebar_label: Rendering from PHP
crumb: "@remotion/lambda"
---

_available from v3.3.96_

<ExperimentalBadge>
This feature is new. Please report any issues you encounter. API may change inbetween patch versions.
</ExperimentalBadge>

To trigger a Lambda render using PHP, install the `remotion/lambda` package using `composer`. Use the same version as the `remotion` version you are using from NPM and pin the version by removing the `^` character in your `composer.json`.

Below is a snippet showing how to initiate a render request and get its status. Note the following before continuing:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Set the following environment variables - the example below supports `.env` files:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `REMOTION_APP_REGION`
  - `REMOTION_APP_FUNCTION_NAME`
  - `REMOTION_APP_SERVE_URL`
- Sending large input props (>200KB) is not supported with PHP at the moment.

```php title="render.php"
<?php
use Aws\Credentials\CredentialProvider;

// We'll assume you use Composer, which will add autoload.php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

// Load environment variables
// Use "unsafe" because AWS reads environment variables from getenv(), not $_ENV
$dotenv = Dotenv::createUnsafeImmutable(__DIR__);
$dotenv->load();

// Specify the region you deployed to, for example "us-east-1"
$region = getenv('REMOTION_APP_REGION');
// Specify the function you would like to call
$functionName = getenv('REMOTION_APP_FUNCTION_NAME');
// Specify the URL to your Webpack bundle
$serveUrl = getenv('REMOTION_APP_SERVE_URL');


$provider = CredentialProvider::defaultProvider();

// Instantiate the client
$client = new PHPClient($region, $serveUrl, $functionName, $provider);

// Initiate the param object and customize as needed
$params = new RenderParams();

$params->setComposition('react-svg');

// Set input props
$params->setInputProps(['message' => 'yo whats up']);

// Execute the render and get the response

$renderResponse = $client->renderMediaOnLambda($params);

// Output render response
print_r($renderResponse);


// Get render progress
$renderId = $renderResponse->renderId;
$bucketName = $renderResponse->bucketName;


$renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);

while (!$renderProgressResponse->done) {
  // Render is not done
  // Get the render progress
  $renderProgress = $renderProgressResponse->overallProgress;
  // Output render progress
  print_r("progress: " . ($renderProgress * 100) . "%\n");
  // Wait 1 second
  sleep(1);
  // Get render progress again
  $renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);
}

print_r("Render is done!\n");
```

## Changelog

- `v4.0.15`: The fields are now typed. `->setInputProps()` now works as intended, serializing the input props to JSON for you.
- `v4.0.6`: The response payload structure has changed. See the history of this page to see the previous structure.

## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
