<?php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Dotenv\Dotenv;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Get environment variables
$region = $_ENV['REMOTION_APP_REGION'];
$functionName = $_ENV['REMOTION_APP_FUNCTION_NAME'];
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
Response
(
[bucketName] => remotionlambda-apsoutheast2-xxxx
[renderId] => xxxxxxx
) */

// Get render progress
$renderId = $renderResponse->renderId;
$bucketName = $renderResponse->bucketName;
$renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);

// Output render progress response
print_r($renderProgressResponse);

/**
 * Response
 *
 *
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

[renderId] => 2q989xf6id
[renderMetadata] =>
[bucket] => remotionlambda-apsoutheast2-qv16gcf02l
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
