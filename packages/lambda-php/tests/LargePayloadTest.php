<?php

namespace Remotion\LambdaPhp\Tests;

use Exception;
use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use Remotion\LambdaPhp\RenderParams;

class LargePayloadTest extends TestCase
{
    private PHPClient $client;

    protected function setUp(): void
    {
        $this->client = new PHPClient(
            'us-east-1',
            'testbed',
            'remotion-render',
            null,
            false
        );
    }

    public function testSmallPayloadUsesInlineFormat(): void
    {
        $params = new RenderParams(data: ['message' => 'small']);
        $params->setComposition('react-svg');

        $result = $this->client->constructInternals($params);

        $this->assertEquals('payload', $result['inputProps']['type']);
    }

    public function testLargePayloadWouldUseBucketUrl(): void
    {
        $largeData = [];
        foreach (range(1, 5000) as $item) {
            $largeData[$item] = [
                'id' => $item,
                'description' => str_repeat('x', 100),
            ];
        }

        $params = new RenderParams(data: $largeData);
        $params->setComposition('react-svg');

        // When a large payload is detected, it will attempt to upload to S3
        // Without AWS credentials, this will fail, proving the S3 path is triggered
        $this->expectException(Exception::class);

        $result = $this->client->constructInternals($params);
    }
}
