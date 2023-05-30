<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once __DIR__ . '/PHPClient.php';
require_once __DIR__ . '/RenderParams.php';

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

class PHPRenderProgressTest extends TestCase
{
    public function testClient()
    {
        $client = new PHPClient(
            "us-east-1",
            "testbed",
            "remotion-render",
            null
        );

        $internalParams = $client->makeRenderProgressPayload("abcdef", "remotion-render");

        $this->assertNotEmpty($internalParams);

        print($internalParams);
    }
}
