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
  $fatalError = $renderProgressResponse->fatalErrorEncountered;

  if ($fatalError) {
    // Render failed
    print_r("Render failed!\n");
    // Exit
    exit(1);
  }
  // Output render progress
  print_r("progress: " . ($renderProgress * 100) . "%\n");
  // Wait 1 second
  sleep(1);
  // Get render progress again
  $renderProgressResponse = $client->getRenderProgress($renderId, $bucketName);
}

print_r("Render is done!\n");
