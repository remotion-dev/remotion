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

// ---- Test with big input props ----
print_r("Running test with big input props...\n");

// Initiate the param object and customize as needed
$paramsBig = new RenderParams();

$paramsBig->setComposition('react-svg');

// Generate a huge amount of mock data (~500kb)
$bigString = str_repeat('A', 500 * 1024); // 500KB of 'A's

$inputPropsBig = ['message' => 'yo whats up', 'bigString' => $bigString];

// Set input props
$paramsBig->setInputProps($inputPropsBig);

// Execute the render and get the response

$renderResponseBig = $client->renderMediaOnLambda($paramsBig);

// Output render response
print_r($renderResponseBig);

// Get render progress
$renderIdBig = $renderResponseBig->renderId;
$bucketNameBig = $renderResponseBig->bucketName;

$renderProgressResponseBig = $client->getRenderProgress($renderIdBig, $bucketNameBig);

while (!$renderProgressResponseBig->done) {
  // Render is not done
  // Get the render progress
  $renderProgress = $renderProgressResponseBig->overallProgress;
  $fatalError = $renderProgressResponseBig->fatalErrorEncountered;
  print_r($renderProgress);

  if ($fatalError) {
    // Render failed
    print_r("Render failed (big props)!\n");
    // Exit
    exit(1);
  }
  // Output render progress
  print_r("progress (big props): " . ($renderProgress * 100) . "%\n");
  // Wait 1 second
  sleep(1);
  // Get render progress again
  $renderProgressResponseBig = $client->getRenderProgress($renderIdBig, $bucketNameBig);
}

print_r("Render with big props is done!\n");

// ---- Test with small input props ----
print_r("Running test with small input props...\n");

$paramsSmall = new RenderParams();

$paramsSmall->setComposition('react-svg');

$inputPropsSmall = ['message' => 'small hello'];

// Set input props
$paramsSmall->setInputProps($inputPropsSmall);

// Execute the render and get the response

$renderResponseSmall = $client->renderMediaOnLambda($paramsSmall);

// Output render response
print_r($renderResponseSmall);

// Get render progress
$renderIdSmall = $renderResponseSmall->renderId;
$bucketNameSmall = $renderResponseSmall->bucketName;


$renderProgressResponseSmall = $client->getRenderProgress($renderIdSmall, $bucketNameSmall);

while (!$renderProgressResponseSmall->done) {
  // Render is not done
  // Get the render progress
  $renderProgress = $renderProgressResponseSmall->overallProgress;
  $fatalError = $renderProgressResponseSmall->fatalErrorEncountered;

  if ($fatalError) {
    // Render failed
    print_r("Render failed (small props)!\n");
    // Exit
    exit(1);
  }
  // Output render progress
  print_r("progress (small props): " . ($renderProgress * 100) . "%\n");
  // Wait 1 second
  sleep(1);
  // Get render progress again
  $renderProgressResponseSmall = $client->getRenderProgress($renderIdSmall, $bucketNameSmall);
}

print_r("Render with small props is done!\n");
