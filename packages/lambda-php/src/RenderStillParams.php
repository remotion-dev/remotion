<?php

namespace Remotion\LambdaPhp;

use InvalidArgumentException;

class RenderStillParams extends RenderParams
{
    private int $frame = 0;

    public function __construct(
        int $frame = 0,
        string $imageFormat = 'png',
        ...$options
    ) {
        parent::__construct(...array_merge($options, ['imageFormat' => $imageFormat]));
        $this->frame = $frame;
    }

    public function setFrame(int $frame)
    {
        $this->frame = $frame;
        return $this;
    }

    public function getFrame(): int
    {
        return $this->frame;
    }

    /** @deprecated Still renders do not send usage telemetry. */
    public function setLicenseKey($licenseKey)
    {
        parent::setLicenseKey($licenseKey);
    }

    public function serializeParams()
    {
        if (!in_array($this->getImageFormat(), ['png', 'jpeg', 'webp'], true)) {
            throw new InvalidArgumentException('imageFormat must be "png", "jpeg" or "webp".');
        }

        $parameters = parent::serializeParams();

        if ($parameters['licenseKey'] !== null && $parameters['licenseKey'] !== 'free-license'
            && !in_array($parameters['logLevel'], ['warn', 'error'], true)
        ) {
            error_log("Still renders don't need to be tracked anymore, an unlimited amount is now included in any Remotion License. You can now remove `licenseKey` from RenderStillParams.");
        }

        $parameters['licenseKey'] = null;
        $parameters['isProduction'] = null;

        // A still is a separate routine on the Lambda function than a video, and
        // it does not produce a video, so the video-only fields are removed.
        foreach ([
            'enableCancellation',
            'rendererFunctionName',
            'framesPerLambda',
            'codec',
            'colorSpace',
            'frameRange',
            'separateAudioTo',
            'everyNthFrame',
            'numberOfGifLoops',
            'concurrencyPerLambda',
            'concurrency',
            'muted',
            'preferLossless',
            'sampleRate',
            'overwrite',
            'audioBitrate',
            'videoBitrate',
            'encodingBufferSize',
            'encodingMaxRate',
            'webhook',
            'audioCodec',
            'x264Preset',
            'gopSize',
            'proResBitsPerMacroblock',
            'disableSharedMemoryCapture',
            'crf',
            'metadata',
            'pixelFormat',
            'proResProfile',
            'output',
        ] as $key) {
            unset($parameters[$key]);
        }

        $parameters['type'] = 'still';
        $parameters['frame'] = $this->frame;
        $parameters['attempt'] = 1;
        $parameters['streamed'] = false;

        return $parameters;
    }
}
