<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once __DIR__ . '/PHPClient.php';
require_once __DIR__ . '/RenderParams.php';

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

class PHPClientTest extends TestCase
{
    public function testClient()
    {
        $client = new PHPClient(
            "us-east-1",
            "testbed",
            "remotion-render",
            null
        );

        $params = new RenderParams(
            data: [
                'hi' => 'there'
            ],
        );
        $params->setComposition("react-svg");

        $internalParams = $client->constructInternals($params);

        $this->assertEquals($client->getRegion(), "us-east-1");
        $this->assertIsArray($internalParams);
        $this->assertNotEmpty($internalParams);

        print(json_encode($internalParams));
    }
}
