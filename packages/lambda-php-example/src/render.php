<?php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$region = $_ENV['REMOTION_APP_REGION'];
$functionName = $_ENV['REMOTION_APP_FUNCTION_NAME'];
$serveUrl = $_ENV["REMOTION_APP_SERVE_URL"];

$client = new PHPClient(
    $region,
    $serveUrl,
    $functionName,
    null);

$params = new RenderParams();
$params->setComposition("react-svg");
$renderResponse = $client->render($params);

//print($renderResponse);
