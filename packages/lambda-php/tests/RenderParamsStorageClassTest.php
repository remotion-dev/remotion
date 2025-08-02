<?php

namespace Remotion\LambdaPhp\Tests;

use PHPUnit\Framework\TestCase;
use Remotion\LambdaPhp\RenderParams;

class RenderParamsStorageClassTest extends TestCase
{
    public function testStorageClassProperty()
    {
        // Test default value
        $params = new RenderParams();
        $this->assertNull($params->getStorageClass());

        // Test setting storage class via constructor
        $params = new RenderParams(storageClass: 'STANDARD_IA');
        $this->assertEquals('STANDARD_IA', $params->getStorageClass());

        // Test setting storage class via setter
        $params = new RenderParams();
        $params->setStorageClass('GLACIER');
        $this->assertEquals('GLACIER', $params->getStorageClass());

        // Test that storageClass is included in serialization
        $params = new RenderParams(storageClass: 'REDUCED_REDUNDANCY');
        $serialized = $params->serializeParams();
        $this->assertArrayHasKey('storageClass', $serialized);
        $this->assertEquals('REDUCED_REDUNDANCY', $serialized['storageClass']);

        // Test null value in serialization
        $params = new RenderParams();
        $serialized = $params->serializeParams();
        $this->assertArrayHasKey('storageClass', $serialized);
        $this->assertNull($serialized['storageClass']);
    }
}