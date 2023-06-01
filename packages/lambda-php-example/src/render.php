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
print_r($renderResponse->body);

/****
stdClass Object
(
[statusCode] => 200
[headers] => stdClass Object
(
[content-type] => application/json
)

[body] => {"bucketName":"remotionlambda-apsoutheast2-qv16gcf02l","renderId":"zjllgavb07"}
)
 **/
// check the status of the render
if ($renderResponse->statusCode === 200) {
    $responseObject = json_decode($renderResponse->body);

    // Get render progress
    $renderId = $responseObject->renderId;
    $bucketName = $responseObject->bucketName;

    $renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);

    // Output render progress response
    print_r($renderProgressResponse);
}

/**
 * Response
 *
 *
 * (
[statusCode] => 200
[headers] => stdClass Object
(
[content-type] => application/json
)

[body] => {"framesRendered":0,"chunks":0,"done":false,"encodingStatus":null,"costs":{"accruedSoFar":0,"displayCost":"<$0.001","currency":"USD","disclaimer":"Estimated cost only. Does not include charges for other AWS services."},"renderId":"61j7un13i1","renderMetadata":null,"bucket":"remotionlambda-apsoutheast2-xxxx","outputFile":null,"timeToFinish":null,"errors":[],"fatalErrorEncountered":false,"currentTime":1685605900279,"renderSize":22,"lambdasInvoked":0,"cleanup":null,"timeToFinishChunks":null,"overallProgress":0,"retriesInfo":[],"outKey":null,"outBucket":null,"mostExpensiveFrameRanges":null,"timeToEncode":null,"outputSizeInBytes":null}
)
 */
