---
image: /generated/articles-docs-lambda-php.png
title: Triggering renders from PHP
slug: /lambda/php
sidebar_label: Rendering from PHP
crumb: "@remotion/lambda"
---

To trigger a Lambda render using PHP, you need to use a PHP client. Below is a snippet showing how to initiate a render request and get its status. Note the following before continuing:

- You first need to [complete the Lambda setup](/docs/lambda/setup).
- Sending large input props (>200KB) is not supported with PHP at the moment.

```php title="render.php"
<?php

// We'll assume you use Composer, which will add autoload.php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Specify the region you deployed to, for example "us-east-1"
$region = $_ENV['REMOTION_APP_REGION'];
// Specify the function you would like to call
$functionName = $_ENV['REMOTION_APP_FUNCTION_NAME'];
// Specify the URL to your Webpack bundle
$serveUrl = $_ENV['REMOTION_APP_SERVE_URL'];

// Instantiate the client
$client = new PHPClient($region, $serveUrl, $functionName, null);

// Initiate the param object and customize as needed
$params = new RenderParams();
$params->setComposition('react-svg');

// Execute the render and get the response
$renderResponse = $client->renderMediaOnLambda($params);

// Output render response
print_r($renderResponse);

/****
 * Response
 * 
 stdClass Object
    (
        [bucketName] => remotionlambda-apsoutheast2-xxxx
        [renderId] => xxxxxxx
    ) 
*/

// Get render progress
$renderId = $renderResponse->renderId;
$bucketName = $renderResponse->bucketName;
$renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);

// Output render progress response
print_r($renderProgressResponse);

/**
 * Response
 * stdClass Object
(
    [framesRendered] => 0
    [chunks] => 0
    [done] =>
    [encodingStatus] =>
    [costs] => stdClass Object
    (
        [accruedSoFar] => 0
        [displayCost] => <$0.001
        [currency] => USD
        [disclaimer] => Estimated cost only. Does not include charges for other AWS services.
)

    [renderId] => xxx
    [renderMetadata] =>
    [bucket] => remotionlambda-apsoutheast2-xxx
    [outputFile] =>
    [timeToFinish] =>
[errors] => Array
    (
    )

    [fatalErrorEncountered] =>
    [currentTime] => 1684570372214
    [renderSize] => 22
    [lambdasInvoked] => 0
    [cleanup] =>
    [timeToFinishChunks] =>
    [overallProgress] => 0
    [retriesInfo] => Array
        (
        )

    [outKey] =>
    [outBucket] =>
    [mostExpensiveFrameRanges] =>
    [timeToEncode] =>
    [outputSizeInBytes] =>
)
 */

```
## See also

- [Using Lambda without IAM user](/docs/lambda/without-iam)
- [Permissions](/docs/lambda/permissions)
