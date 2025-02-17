<?php

namespace Remotion\LambdaPhp;

use stdClass;

class RenderParams
{
    protected $data = null;
    protected $bucketName = null;
    protected $region = null;
    protected $outName = null;
    protected $composition = null;
    protected $serverUrl = null;
    protected $framesPerLambda = null;

    protected $codec = 'h264';
    protected $version = "";
    protected $imageFormat = 'jpeg';
    protected $crf = null;
    protected $envVariables = [];
    protected $metadata = [];
    protected $maxRetries = 1;
    protected $jpegQuality = 80;
    protected $privacy = 'privacy';
    protected $colorSpace = null;
    protected $logLevel = 'info';
    protected $frameRange = null;
    protected $timeoutInMilliseconds = 30000;
    protected $chromiumOptions = null;
    protected $scale = 1;
    protected $everyNthFrame = 1;
    protected $numberOfGifLoops = 0;
    protected $concurrencyPerLambda = 1;
    protected $downloadBehavior = [
        'type' => 'play-in-browser',
    ];
    protected $muted = false;
    protected $preferLossless = false;
    protected $overwrite = false;
    protected $audioBitrate = null;
    protected $videoBitrate = null;
    protected $encodingBufferSize = null;
    protected $maxRate = null;
    protected $webhook = null;
    protected $forceHeight = null;
    protected $forceWidth = null;
    protected $apiKey = null;
    protected $offthreadVideoCacheSizeInBytes = null;
    protected $offthreadVideoThreads = null;
    protected $audioCodec = null;
    protected $rendererFunctionName = null;
    protected $proResProfile = null;
    protected $pixelFormat = null;
    protected $x264Preset = null;
    protected $deleteAfter = null;
    protected $forcePathStyle = false;

    public function __construct(
        ?array  $data = null,
        ?string $composition = 'main',
        string  $codec = 'h264',
        ?string $version = null,
        string  $imageFormat = 'jpeg',
        ?int    $crf = null,
        ?array  $envVariables = null,
        int     $maxRetries = 1,
        int     $jpegQuality = 80,
        string  $privacy = 'public',
        ?string  $colorSpace = null,
        string  $logLevel = 'info',
        ?string $frameRange = null,
        ?string $outName = null,
        ?int    $timeoutInMilliseconds = 30000,
        ?object $chromiumOptions = null,
        ?int    $scale = 1,
        ?int    $everyNthFrame = 1,
        ?int    $numberOfGifLoops = 0,
        ?int    $concurrencyPerLambda = 1,
        ?array  $downloadBehavior = null,
        ?bool   $muted = false,
        ?bool   $overwrite = false,
        ?int    $audioBitrate = null,
        ?int    $videoBitrate = null,
        ?string $webhook = null,
        ?int    $forceHeight = null,
        ?int    $forceWidth = null,
        ?int    $apiKey = null,
        ?int    $offthreadVideoCacheSizeInBytes = null,
        ?int    $offthreadVideoThreads = null,
        ?string $audioCodec = null,
        ?int    $framesPerLambda = null,
        ?string $rendererFunctionName = null,
        ?string $proResProfile = null,
        ?string $pixelFormat = null,
        ?string $x264Preset = null,
        ?string $deleteAfter = null,
        ?string $encodingBufferSize = null,
        ?string $maxRate = null,
        ?bool   $preferLossless = false,
        ?bool   $forcePathStyle = false,
        ?array  $metadata = null
    )
    {
        if ($chromiumOptions === null) {
            $this->chromiumOptions = new stdClass();
        } else {
            $this->chromiumOptions = $chromiumOptions;
        }
        $this->data = $data;
        $this->composition = $composition;
        $this->codec = $codec;
        $this->version = $version;
        $this->imageFormat = $imageFormat;
        $this->crf = $crf;
        $this->envVariables = $envVariables;
        $this->metadata = $metadata;
        $this->maxRetries = $maxRetries;
        $this->jpegQuality = $jpegQuality;
        $this->privacy = $privacy;
        $this->colorSpace = $colorSpace;
        $this->logLevel = $logLevel;
        $this->frameRange = $frameRange;
        $this->outName = $outName;
        $this->timeoutInMilliseconds = $timeoutInMilliseconds;
        $this->scale = $scale;
        $this->everyNthFrame = $everyNthFrame;
        $this->numberOfGifLoops = $numberOfGifLoops;
        $this->concurrencyPerLambda = $concurrencyPerLambda;
        $this->downloadBehavior = $downloadBehavior ?? ['type' => 'play-in-browser'];
        $this->muted = $muted;
        $this->overwrite = $overwrite;
        $this->audioBitrate = $audioBitrate;
        $this->videoBitrate = $videoBitrate;
        $this->encodingBufferSize = $encodingBufferSize;
        $this->maxRate = $maxRate;
        $this->webhook = $webhook;
        $this->forceHeight = $forceHeight;
        $this->forceWidth = $forceWidth;
        $this->apiKey = $apiKey;
        $this->offthreadVideoCacheSizeInBytes = $offthreadVideoCacheSizeInBytes;
        $this->offthreadVideoThreads = $offthreadVideoThreads;
        $this->audioCodec = $audioCodec;
        $this->framesPerLambda = $framesPerLambda;
        $this->rendererFunctionName = $rendererFunctionName;
        $this->proResProfile = $proResProfile;
        $this->pixelFormat = $pixelFormat;
        $this->x264Preset = $x264Preset;
        $this->deleteAfter = $deleteAfter;
        $this->preferLossless = $preferLossless;
        $this->forcePathStyle = $forcePathStyle;
    }

    private array $inputProps = array();

    public function serializeParams()
    {
        $parameters = [
            'rendererFunctionName' => $this->getRendererFunctionName(),
            'framesPerLambda' => $this->getFramesPerLambda(),
            'composition' => $this->getComposition(),
            'serveUrl' => $this->getServeUrl(),
            'inputProps' => $this->getInputProps(),
            'codec' => $this->getCodec(),
            'imageFormat' => $this->getImageFormat(),
            'maxRetries' => $this->getMaxRetries(),
            'jpegQuality' => $this->getJpegQuality(),
            'privacy' => $this->getPrivacy(),
            'colorSpace' => $this->getColorSpace(),
            'logLevel' => $this->getLogLevel(),
            'frameRange' => $this->getFrameRange(),
            'outName' => $this->getOutName(),
            'timeoutInMilliseconds' => $this->getTimeoutInMilliseconds(),
            'chromiumOptions' => $this->getChromiumOptions() === null ? new stdClass() : $this->getChromiumOptions(),
            'scale' => $this->getScale(),
            'everyNthFrame' => $this->getEveryNthFrame(),
            'numberOfGifLoops' => $this->getNumberOfGifLoops(),
            'concurrencyPerLambda' => $this->getConcurrencyPerLambda(),
            'downloadBehavior' => $this->getDownloadBehavior(),
            'muted' => $this->getMuted(),
            'preferLossless' => $this->getPreferLossless(),
            'version' => Semantic::VERSION,
            'overwrite' => $this->getOverwrite(),
            'audioBitrate' => $this->getAudioBitrate(),
            'videoBitrate' => $this->getVideoBitrate(),
            'encodingBufferSize' => $this->getEncodingBufferSize(),
            'encodingMaxRate' => $this->getMaxRate(),
            'webhook' => $this->getWebhook(),
            'forceHeight' => $this->getForceHeight(),
            'forceWidth' => $this->getForceWidth(),
            'apiKey' => $this->getApiKey(),
            'offthreadVideoCacheSizeInBytes' => $this->getOffthreadVideoCacheSizeInBytes(),
            'offthreadVideoThreads' => $this->getOffthreadVideoThreads(),
            'bucketName' => $this->getBucketName(),
            'audioCodec' => $this->getAudioCodec(),
            'x264Preset' => $this->getX264Preset(),
            'deleteAfter' => $this->getDeleteAfter(),
            'forcePathStyle' => $this->getForcePathStyle(),
            'type' => 'start'
        ];

        if ($this->getCrf() !== null) {
            $parameters['crf'] = $this->getCrf();
        }

        if ($this->getEnvVariables() !== null) {
            $parameters['envVariables'] = $this->getEnvVariables();
        } else {
            $parameters['envVariables'] = new stdClass();
        }

        if ($this->getMetadata() !== null) {
            $parameters['metadata'] = $this->getMetadata();
        } else {
            $parameters['metadata'] = new stdClass();
        }

        if ($this->getPixelFormat() !== null) {
            $parameters['pixelFormat'] = $this->getPixelFormat();
        }

        if ($this->getX264Preset() !== null) {
            $parameters['x264Preset'] = $this->getX264Preset();
        }

        if ($this->getProResProfile() !== null) {
            $parameters['proResProfile'] = $this->getProResProfile();
        } else {
            $parameters['proResProfile'] = null;
        }

        if ($this->getPixelFormat() !== null) {
            $parameters['pixelFormat'] = $this->getPixelFormat();
        } else {
            $parameters['pixelFormat'] = null;
        }

        if ($this->getCrf() !== null) {
            $parameters['crf'] = $this->getCrf();
        } else {
            $parameters['crf'] = null;
        }

        return $parameters;
    }

    public function getForcePathStyle()
    {
        return $this->forcePathStyle;
    }   

    /**
     * Get the value of inputProps
     */
    public function getInputProps()
    {
        return $this->inputProps;
    }

    /**
     * Set the value of inputProps
     *
     * @return  self
     */
    public function internal_setSerializedInputProps($inputProps)
    {
        $this->inputProps = $inputProps;

        return $this;
    }

    /**
     * Get the value of bucketName
     */
    public function getBucketName()
    {
        return $this->bucketName;
    }

    /**
     * Set the value of bucketName
     *
     * @return  self
     */
    public function setBucketName($bucketName)
    {
        $this->bucketName = $bucketName;

        return $this;
    }

    /**
     * Get the value of audioCodec
     */
    public function getAudioCodec()
    {
        return $this->audioCodec;
    }

    /**
     * Set the value of audioCodec
     *
     * @return  self
     */
    public function setAudioCodec($audioCodec)
    {
        $this->audioCodec = $audioCodec;

        return $this;
    }

    /**
     * Get the value of data
     */
    public function getData()
    {
        return $this->data;
    }

    /**
     * Backwards compatible version of setInputProps()
     * Set the value of data
     *
     * @return  self
     */
    public function setData($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Set the value of inputProps
     * @return
     */
    public function setInputProps($data)
    {
        $this->data = $data;

        return $this;
    }

    /**
     * Get the value of composition
     */
    public function getComposition()
    {
        return $this->composition;
    }

    /**
     * Set the value of composition
     *
     * @return  self
     */
    public function setComposition($composition)
    {
        $this->composition = $composition;

        return $this;
    }

    /**
     * Get the value of codec
     */
    public function getCodec()
    {
        return $this->codec;
    }

    /**
     * Set the value of codec
     *
     * @return  self
     */
    public function setCodec($codec)
    {
        $this->codec = $codec;

        return $this;
    }

    /**
     * Get the value of version
     */
    public function getVersion()
    {
        return $this->version;
    }

    /**
     * Set the value of version
     *
     * @return  self
     */
    public function setVersion($version)
    {
        $this->version = $version;

        return $this;
    }

    /**
     * Get the value of imageFormat
     */
    public function getImageFormat()
    {
        return $this->imageFormat;
    }

    /**
     * Set the value of imageFormat
     *
     * @return  self
     */
    public function setImageFormat($imageFormat)
    {
        $this->imageFormat = $imageFormat;

        return $this;
    }

    /**
     * Get the value of crf
     */
    public function getCrf()
    {
        return $this->crf;
    }

    /**
     * Set the value of crf
     *
     * @return  self
     */
    public function setCrf($crf)
    {
        $this->crf = $crf;

        return $this;
    }

    /**
     * Get the value of envVariables
     */
    public function getEnvVariables()
    {
        return $this->envVariables;
    }

    /**
     * Get the value of metadata
     */
    public function getMetadata()
    {
        return $this->metadata;
    }

    /**
     * Set the value of envVariables
     *
     * @return  self
     */
    public function setEnvVariables($envVariables)
    {
        $this->envVariables = $envVariables;

        return $this;
    }

    public function setMetadata($metadata)
    {
        $this->metadata = $metadata;
        return $this;
    }


    /**
     * Get the value of maxRetries
     */
    public function getMaxRetries()
    {
        return $this->maxRetries;
    }

    /**
     * Set the value of maxRetries
     *
     * @return  self
     */
    public function setMaxRetries($maxRetries)
    {
        $this->maxRetries = $maxRetries;

        return $this;
    }

    /**
     * Get the value of jpegQuality
     */
    public function getJpegQuality()
    {
        return $this->jpegQuality;
    }

    /**
     * Set the value of jpegQuality
     *
     * @return  self
     */
    public function setJpegQuality($jpegQuality)
    {
        $this->jpegQuality = $jpegQuality;

        return $this;
    }

    /**
     * Get the value of privacy
     */
    public function getPrivacy()
    {
        return $this->privacy;
    }

    /**
     * Set the value of privacy
     *
     * @return  self
     */
    public function setPrivacy($privacy)
    {
        $this->privacy = $privacy;

        return $this;
    }

    /**
     * Get the value of colorspace
     */
    public function getColorSpace()
    {
        return $this->colorSpace;
    }

    /**
     * Set the value of colorSpace
     *
     * @return  self
     */
    public function setColorSpace($colorSpace)
    {
        $this->colorSpace = $colorSpace;

        return $this;
    }

    /**
     * Get the value of logLevel
     */
    public function getLogLevel()
    {
        return $this->logLevel;
    }

    /**
     * Set the value of logLevel
     *
     * @return  self
     */
    public function setLogLevel($logLevel)
    {
        $this->logLevel = $logLevel;

        return $this;
    }

    // Setter methods
    public function setFrameRange($frameRange)
    {
        $this->frameRange = $frameRange;
    }

    public function setOutName($outName)
    {
        $this->outName = $outName;
    }

    public function setTimeoutInMilliseconds($timeoutInMilliseconds)
    {
        $this->timeoutInMilliseconds = $timeoutInMilliseconds;
    }

    public function setChromiumOptions($chromiumOptions)
    {
        $this->chromiumOptions = $chromiumOptions;
    }

    public function setScale($scale)
    {
        $this->scale = $scale;
    }

    public function setEveryNthFrame($everyNthFrame)
    {
        $this->everyNthFrame = $everyNthFrame;
    }

    public function setNumberOfGifLoops($numberOfGifLoops)
    {
        $this->numberOfGifLoops = $numberOfGifLoops;
    }

    public function setConcurrencyPerLambda($concurrencyPerLambda)
    {
        $this->concurrencyPerLambda = $concurrencyPerLambda;
    }

    public function setDownloadBehavior($downloadBehavior)
    {
        $this->downloadBehavior = $downloadBehavior;
    }

    // Getter methods
    public function getFrameRange()
    {
        return $this->frameRange;
    }

    public function getOutName()
    {
        return $this->outName;
    }

    public function getTimeoutInMilliseconds()
    {
        return $this->timeoutInMilliseconds;
    }

    public function getChromiumOptions()
    {
        return $this->chromiumOptions;
    }

    public function getScale()
    {
        return $this->scale;
    }

    public function getEveryNthFrame()
    {
        return $this->everyNthFrame;
    }

    public function getNumberOfGifLoops()
    {
        return $this->numberOfGifLoops;
    }

    public function getConcurrencyPerLambda()
    {
        return $this->concurrencyPerLambda;
    }

    public function getDownloadBehavior()
    {
        return $this->downloadBehavior;
    }

    // Setter methods
    public function setMuted($muted)
    {
        $this->muted = $muted;
    }

    // Setter methods
    public function setPreferLossless($preferLossless)
    {
        $this->preferLossless = $preferLossless;
    }

    public function setOverwrite($overwrite)
    {
        $this->overwrite = $overwrite;
    }

    public function setAudioBitrate($audioBitrate)
    {
        $this->audioBitrate = $audioBitrate;
    }

    public function setVideoBitrate($videoBitrate)
    {
        $this->videoBitrate = $videoBitrate;
    }

    public function setWebhook($webhook)
    {
        $this->webhook = $webhook;
    }

    public function setForceHeight($forceHeight)
    {
        $this->forceHeight = $forceHeight;
    }

    public function setForceWidth($forceWidth)
    {
        $this->forceWidth = $forceWidth;
    }

    public function setApiKey($apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function setOffthreadVideoCacheSizeInBytes($offthreadVideoCacheSizeInBytes)
    {
        $this->offthreadVideoCacheSizeInBytes = $offthreadVideoCacheSizeInBytes;
    }
    public function setOffthreadVideoThreads($offthreadVideoThreads)
    {
        $this->offthreadVideoThreads = $offthreadVideoThreads;
    }

    // Getter methods
    public function getMuted()
    {
        return $this->muted;
    }

    public function getPreferLossless()
    {
        return $this->preferLossless;
    }

    public function getOverwrite()
    {
        return $this->overwrite;
    }

    public function getAudioBitrate()
    {
        return $this->audioBitrate;
    }

    public function getVideoBitrate()
    {
        return $this->videoBitrate;
    }

    public function getEncodingBufferSize()
    {
        return $this->encodingBufferSize;
    }

    public function getMaxRate()
    {
        return $this->maxRate;
    }

    public function getWebhook()
    {
        return $this->webhook;
    }

    public function getForceHeight()
    {
        return $this->forceHeight;
    }

    public function getForceWidth()
    {
        return $this->forceWidth;
    }

    public function getApiKey()
    {
        return $this->apiKey;
    }

    public function getOffthreadVideoCacheSizeInBytes()
    {
        return $this->offthreadVideoCacheSizeInBytes;
    }
    public function getOffthreadVideoThreads()
    {
        return $this->offthreadVideoThreads;
    }

    /**
     * Get the value of serverUrl
     */
    public function getServeUrl()
    {
        return $this->serverUrl;
    }

    /**
     * Set the value of serverUrl
     *
     * @return  self
     */
    public function setServeUrl($serverUrl)
    {
        $this->serverUrl = $serverUrl;

        return $this;
    }

    /**
     * Get the value of rendererFunctionName
     */
    public function getRendererFunctionName()
    {
        return $this->rendererFunctionName;
    }

    /**
     * Set the value of rendererFunctionName
     *
     * @return  self
     */
    public function setRendererFunctionName($rendererFunctionName)
    {
        $this->rendererFunctionName = $rendererFunctionName;

        return $this;
    }

    /**
     * Get the value of framesPerLambda
     */
    public function getFramesPerLambda()
    {
        return $this->framesPerLambda;
    }

    /**
     * Set the value of framesPerLambda
     *
     * @return  self
     */
    public function setFramesPerLambda($framesPerLambda)
    {
        $this->framesPerLambda = $framesPerLambda;

        return $this;
    }

    /**
     * Get the value of region
     */
    public function getRegion()
    {
        return $this->region;
    }

    /**
     * Set the value of region
     *
     * @return  self
     */
    public function setRegion($region)
    {
        $this->region = $region;

        return $this;
    }

    /**
     * Get the value of proResProfile
     */
    public function getProResProfile()
    {
        return $this->proResProfile;
    }

    /**
     * Set the value of proResProfile
     *
     * @return  self
     */
    public function setProResProfile($proResProfile)
    {
        $this->proResProfile = $proResProfile;

        return $this;
    }

    /**
     * Get the value of pixelFormat
     */
    public function getPixelFormat()
    {
        return $this->pixelFormat;
    }

    /**
     * Set the value of pixelFormat
     *
     * @return  self
     */
    public function setPixelFormat($pixelFormat)
    {
        $this->pixelFormat = $pixelFormat;

        return $this;
    }

    public function getX264Preset()
    {
        return $this->x264Preset;
    }

    public function setX264Preset($x264Preset)
    {
        $this->x264Preset = $x264Preset;
        return $this;
    }

    public function getDeleteAfter()
    {
        return $this->deleteAfter;
    }

    public function setDeleteAfter($deleteAfter)
    {
        $this->deleteAfter = $deleteAfter;
        return $this;
    }
}
