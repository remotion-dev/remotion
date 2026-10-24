<?php

namespace Remotion\LambdaPhp;

class RenderStillOnLambdaResponse
{
    public string $type;
    public string $bucketName;
    public string $renderId;
    public string $output;
    public string $outKey;
    public int $sizeInBytes;
    public ?array $estimatedPrice = null;
}
