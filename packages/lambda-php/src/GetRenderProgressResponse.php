<?php

namespace Remotion\LambdaPhp;

class GetRenderProgressResponse
{
    public ?int $chunks;
    public bool $done;
    public float $overallProgress;
    public string $type;
    public ?string $outputFile;
    public int $lambdasInvoked;
    public int $renderSize;
    public int $currentTime;
    public bool $fatalErrorEncountered;
    public ?int $timeToFinish;
    public ?string $outBucket;
    public ?string $outKey;
    public ?string $bucket;
}
