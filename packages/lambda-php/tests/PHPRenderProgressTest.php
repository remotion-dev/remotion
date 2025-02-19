<?php

namespace Remotion\LambdaPhp\Tests;

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;

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
