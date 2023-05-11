<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';
require_once __DIR__ . '/PHPClient.php';
require_once __DIR__ . '/RenderParams.php';
use Remotion\PHPClient;
use Remotion\RenderParams;

class PHPClientTest extends PHPUnit\Framework\TestCase

{
    public function testClient()
    {

        $client = new PHPClient(
            "us-east-1",
            "react-svg",
            "remotion-render",
            null);

        $params = new RenderParams();

        $internalParams = $client->constructInternals($params);
        $this->assertEquals($client->getRegion(), "us-east-1");
        print($internalParams);

    }
}
