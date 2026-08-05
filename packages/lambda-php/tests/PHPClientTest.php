<?php

namespace Remotion\LambdaPhp\Tests;

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

class PHPClientTest extends TestCase
{
    public function testOverwriteDefaultsToFalseInV4()
    {
        $params = new RenderParams();

        $this->assertFalse($params->getOverwrite());
        $this->assertFalse($params->serializeParams()['overwrite']);
    }

    public function testExplicitOverwriteValueIsPreserved()
    {
        $params = new RenderParams(overwrite: false);
        $this->assertFalse($params->getOverwrite());

        $params->setOverwrite(true);
        $this->assertTrue($params->getOverwrite());
    }

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
        $params->setMetadata([
            'Author' => 'Remotion'
        ]);

        $internalParams = $client->constructInternals($params);

        $this->assertEquals($client->getRegion(), "us-east-1");
        $this->assertIsArray($internalParams);
        $this->assertNotEmpty($internalParams);

        print(json_encode($internalParams));
    }
}
