<?php

namespace Remotion\LambdaPhp;

use InvalidArgumentException;

class RenderFramesParams extends RenderParams
{
    private string|array|null $outputPrefix;
    private ?string $imageSequencePattern;
    private bool $jpegQualityProvided;

    public function __construct(
        string|array|null $outputPrefix = null,
        ?string $imageSequencePattern = null,
        string $imageFormat = 'png',
        int|array|null $frameRange = null,
        ...$options
    ) {
        parent::__construct(...array_merge($options, ['imageFormat' => $imageFormat]));
        $this->frameRange = $frameRange;
        $this->outputPrefix = $outputPrefix;
        $this->imageSequencePattern = $imageSequencePattern;
        $this->jpegQualityProvided = array_key_exists('jpegQuality', $options);
    }

    public function setOutputPrefix(string|array|null $outputPrefix)
    {
        $this->outputPrefix = $outputPrefix;
        return $this;
    }

    public function setImageSequencePattern(?string $imageSequencePattern)
    {
        $this->imageSequencePattern = $imageSequencePattern;
        return $this;
    }

    public function setJpegQuality($jpegQuality)
    {
        $this->jpegQualityProvided = true;
        return parent::setJpegQuality($jpegQuality);
    }

    public function serializeParams()
    {
        if (!in_array($this->getImageFormat(), ['png', 'jpeg'], true)) {
            throw new InvalidArgumentException('imageFormat must be "png" or "jpeg".');
        }
        if ($this->jpegQualityProvided && $this->getImageFormat() !== 'jpeg') {
            throw new InvalidArgumentException('jpegQuality can only be passed with imageFormat: "jpeg".');
        }

        $parameters = parent::serializeParams();
        $parameters['codec'] = null;
        $parameters['muted'] = true;
        $parameters['outName'] = null;
        $parameters['numberOfGifLoops'] = null;
        $parameters['output'] = [
            'type' => 'sequence',
            'outputPrefix' => $this->outputPrefix,
            'imageSequencePattern' => $this->imageSequencePattern,
        ];
        return $parameters;
    }
}
