<?php

namespace Remotion\LambdaPhp\Tests;

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

class CancellationPHPClient extends PHPClient
{
    public array $writes = [];
    public bool $cancellationEnabled = true;

    public function __construct()
    {
    }

    protected function readProgressFromS3(string $bucketName, string $key): string
    {
        return json_encode(['cancellationEnabled' => $this->cancellationEnabled]);
    }

    protected function writeCancellationToS3(string $bucketName, string $key, string $body): void
    {
        $this->writes[] = compact('bucketName', 'key', 'body');
    }
}

class PHPClientTest extends TestCase
{
    public function testOverwriteDefaultsToFalseInV4()
    {
        $params = new RenderParams();

        $this->assertFalse($params->getOverwrite());
        $this->assertFalse($params->serializeParams()['overwrite']);
        $this->assertFalse($params->serializeParams()['enableCancellation']);
    }

    public function testEnableCancellationAndCancelRender()
    {
        $params = new RenderParams(enableCancellation: true);
        $this->assertTrue($params->serializeParams()['enableCancellation']);

        $client = new CancellationPHPClient();
        $client->cancelRenderOnLambda('render-id', 'remotionlambda-test');

        $this->assertCount(1, $client->writes);
        $this->assertEquals('remotionlambda-test', $client->writes[0]['bucketName']);
        $this->assertEquals('renders/render-id/cancel.json', $client->writes[0]['key']);
        $this->assertGreaterThan(0, json_decode($client->writes[0]['body'], true)['cancelledAt']);
    }

    public function testCancelRenderRequiresOptIn()
    {
        $client = new CancellationPHPClient();
        $client->cancellationEnabled = false;

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('enableCancellation: true');
        $client->cancelRenderOnLambda('render-id', 'remotionlambda-test');
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
