<?php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// get all params
$region = $_ENV['REMOTION_APP_REGION'];
$functionName = $_ENV['REMOTION_APP_FUNCTION_NAME'];
$serveUrl = $_ENV["REMOTION_APP_SERVE_URL"];

// instantiate the client
$client = new PHPClient(
    $region,
    $serveUrl,
    $functionName,
    null);

// initiate the param object, customize as needed
$params = new RenderParams();

// define the composition to render
$params->setComposition("react-svg");

/* execute the render
 ***
Response
(
[bucketName] => remotionlambda-apsoutheast2-xxxx
[renderId] => xxxxxxx
) */
$renderResponse = $client->renderMediaOnLambda($params);

// Get the proggress
print_r($renderResponse);

$renderProgressResponse = $client->getRenderProgress($renderResponse->renderId, $renderResponse->bucketName);

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
