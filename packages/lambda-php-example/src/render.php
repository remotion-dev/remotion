<?php
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;
$client = new PHPClient(
    "us-east-1",
    "testbed",
    "remotion-render",
    null);

$params = new RenderParams();
$params->setComposition("react-svg");
$internalParams = $client->constructInternals($params);

print($internalParams);
