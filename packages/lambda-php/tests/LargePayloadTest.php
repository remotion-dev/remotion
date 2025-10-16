<?php

namespace Remotion\LambdaPhp\Tests;

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\PHPClient;
use ReflectionClass;
use ReflectionMethod;

/**
 * Test large payload compression and S3 upload functionality
 */
class LargePayloadTest extends TestCase
{
    private PHPClient $client;
    private ReflectionClass $reflectionClass;

    protected function setUp(): void
    {
        $this->client = new PHPClient(
            'us-east-1',
            'testbed',
            'remotion-render',
            null,
            false
        );
        $this->reflectionClass = new ReflectionClass(PHPClient::class);
    }

    /**
     * Helper method to call private methods
     */
    private function callPrivateMethod(string $methodName, array $args = [])
    {
        $method = $this->reflectionClass->getMethod($methodName);
        $method->setAccessible(true);
        return $method->invokeArgs($this->client, $args);
    }

    /**
     * Test that small payloads use the payload format
     */
    public function testSmallPayloadUsesPayloadFormat(): void
    {
        $smallProps = ['message' => 'small'];
        $result = $this->callPrivateMethod('serializeInputProps', [
            $smallProps,
            'us-east-1',
            'video-or-audio',
            null
        ]);

        $this->assertEquals('payload', $result['type']);
        $this->assertArrayHasKey('payload', $result);
        $this->assertArrayNotHasKey('hash', $result);
        $this->assertArrayNotHasKey('bucketName', $result);
    }

    /**
     * Test the logic for determining when upload is needed
     */
    public function testNeedsUploadLogic(): void
    {
        // Small payload should not need upload
        $this->assertFalse($this->callPrivateMethod('needsUpload', [1000, 'video-or-audio']));
        $this->assertFalse($this->callPrivateMethod('needsUpload', [1000, 'still']));

        // Large payload for video should need upload
        $this->assertTrue($this->callPrivateMethod('needsUpload', [200000, 'video-or-audio']));

        // Large payload for still should need upload (over 5MB)
        $this->assertTrue($this->callPrivateMethod('needsUpload', [5000000, 'still']));

        // Medium payload for still should not need upload
        $this->assertFalse($this->callPrivateMethod('needsUpload', [1000000, 'still']));
    }

    /**
     * Test that hash generation is consistent
     */
    public function testHashGeneration(): void
    {
        $payload = '{"test": "data"}';
        $hash1 = $this->callPrivateMethod('generateHash', [$payload]);
        $hash2 = $this->callPrivateMethod('generateHash', [$payload]);

        $this->assertEquals($hash1, $hash2);
        $this->assertIsString($hash1);
        $this->assertEquals(64, strlen($hash1)); // SHA256 hex string length
    }

    /**
     * Test S3 key generation for input props
     */
    public function testInputPropsKeyGeneration(): void
    {
        $hashValue = 'test123';
        $key = $this->callPrivateMethod('inputPropsKey', [$hashValue]);
        $this->assertEquals('input-props/test123.json', $key);
    }

    /**
     * Test bucket name generation following JS SDK conventions
     */
    public function testBucketNameGeneration(): void
    {
        $bucketName = $this->callPrivateMethod('makeBucketName', []);

        // Should start with remotionlambda- prefix
        $this->assertStringStartsWith('remotionlambda-', $bucketName);

        // Should contain region without dashes
        $expectedRegion = str_replace('-', '', 'us-east-1');
        $this->assertStringContainsString($expectedRegion, $bucketName);

        // Should be in format: remotionlambda-{region-no-dashes}-{random-hash}
        $parts = explode('-', $bucketName);
        $this->assertCount(3, $parts); // remotionlambda, region, hash
        $this->assertEquals('remotionlambda', $parts[0]);
        $this->assertEquals($expectedRegion, $parts[1]);
        $this->assertEquals(10, strlen($parts[2])); // random hash should be 10 chars
    }

    /**
     * Test random hash generation
     */
    public function testRandomHashGeneration(): void
    {
        $hash1 = $this->callPrivateMethod('generateRandomHash', []);
        $hash2 = $this->callPrivateMethod('generateRandomHash', []);

        // Should be 10 characters long
        $this->assertEquals(10, strlen($hash1));
        $this->assertEquals(10, strlen($hash2));

        // Should be different (extremely unlikely to be the same)
        $this->assertNotEquals($hash1, $hash2);

        // Should only contain lowercase alphanumeric characters
        $this->assertMatchesRegularExpression('/^[a-z0-9]{10}$/', $hash1);
        $this->assertMatchesRegularExpression('/^[a-z0-9]{10}$/', $hash2);
    }

    /**
     * Test payload size calculation matches expected thresholds
     */
    public function testPayloadSizeThresholds(): void
    {
        $margin = 5000 + 1024;
        $maxStillInlineSize = 5000000 - $margin;
        $maxVideoInlineSize = 200000 - $margin;

        // Test video threshold
        $this->assertFalse($this->callPrivateMethod('needsUpload', [$maxVideoInlineSize - 1, 'video-or-audio']));
        $this->assertTrue($this->callPrivateMethod('needsUpload', [$maxVideoInlineSize + 1, 'video-or-audio']));

        // Test still threshold
        $this->assertFalse($this->callPrivateMethod('needsUpload', [$maxStillInlineSize - 1, 'still']));
        $this->assertTrue($this->callPrivateMethod('needsUpload', [$maxStillInlineSize + 1, 'still']));
    }
}
