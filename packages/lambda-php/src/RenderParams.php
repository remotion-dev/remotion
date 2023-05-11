<?php
namespace Remotion;

class RenderParams
{

    private $data = array();
    private $composition = 'main';
    private $type = 'start';
    private $codec = 'h264';
    private $version = '3.3.78';
    private $imageFormat = 'jpeg';
    private $crf = 1;
    private $envVariables = [];
    private $quality = 80;
    private $maxRetries = 1;
    private $privacy = 'private';
    private $logLevel = 'info';
    private $frameRange = null;
    private $outName = null;
    private $timeoutInMilliseconds = 30000;
    private $chromiumOptions = [];
    private $scale = 1;
    private $everyNthFrame = 1;
    private $numberOfGifLoops = 0;
    private $concurrencyPerLambda = 1;
    private $downloadBehavior = [
        'type' => 'play-in-browser',
    ];
    private $muted = false;
    private $overwrite = false;
    private $audioBitrate = null;
    private $videoBitrate = null;
    private $webhook = null;
    private $forceHeight = null;
    private $forceWidth = null;
    private $audioCodec = null;

    public function __construct(
        array $data = array(),
        string $composition = 'main',
        string $type = 'start',
        string $codec = 'h264',
        string $version = '3.3.78',
        string $imageFormat = 'jpeg',
        int $crf = 1,
        array $envVariables = [],
        int $quality = 80,
        int $maxRetries = 1,
        string $privacy = 'public',
        string $logLevel = 'info',
        ? string $frameRange = null,
        ? string $outName = null,
        int $timeoutInMilliseconds = 30000,
        array $chromiumOptions = [],
        float $scale = 1,
        int $everyNthFrame = 1,
        int $numberOfGifLoops = 0,
        int $concurrencyPerLambda = 1,
        array $downloadBehavior = [
            'type' => 'play-in-browser',
        ],
        bool $muted = false,
        bool $overwrite = false,
        ? int $audioBitrate = null,
        ? int $videoBitrate = null,
        ? string $webhook = null,
        ? int $forceHeight = null,
        ? int $forceWidth = null,
        ? string $audioCodec = null
    ) {
        $this->data = $data;
        $this->composition = $composition;
        $this->type = $type;
        $this->codec = $codec;
        $this->version = $version;
        $this->imageFormat = $imageFormat;
        $this->crf = $crf;
        $this->envVariables = $envVariables;
        $this->quality = $quality;
        $this->maxRetries = $maxRetries;
        $this->privacy = $privacy;
        $this->logLevel = $logLevel;
        $this->frameRange = $frameRange;
        $this->outName = $outName;
        $this->timeoutInMilliseconds = $timeoutInMilliseconds;
        $this->chromiumOptions = $chromiumOptions;
        $this->scale = $scale;
        $this->everyNthFrame = $everyNthFrame;
        $this->numberOfGifLoops = $numberOfGifLoops;
        $this->concurrencyPerLambda = $concurrencyPerLambda;
        $this->downloadBehavior = $downloadBehavior;
        $this->muted = $muted;
        $this->overwrite = $overwrite;
        $this->audioBitrate = $audioBitrate;
        $this->videoBitrate = $videoBitrate;
        $this->webhook = $webhook;
        $this->forceHeight = $forceHeight;
        $this->forceWidth = $forceWidth;
        $this->audioCodec = $audioCodec;

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
     * Get the value of type
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set the value of type
     *
     * @return  self
     */
    public function setType($type)
    {
        $this->type = $type;

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
     * Set the value of envVariables
     *
     * @return  self
     */
    public function setEnvVariables($envVariables)
    {
        $this->envVariables = $envVariables;

        return $this;
    }

    /**
     * Get the value of quality
     */
    public function getQuality()
    {
        return $this->quality;
    }

    /**
     * Set the value of quality
     *
     * @return  self
     */
    public function setQuality($quality)
    {
        $this->quality = $quality;

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

    // Getter methods
    public function getMuted()
    {
        return $this->muted;
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

    public function toJson()
    {
        $json = [
            'data' => $this->getData(),
            'composition' => $this->getComposition(),
            'type' => $this->getType(),
            'codec' => $this->getCodec(),
            'version' => $this->getVersion(),
            'imageFormat' => $this->getImageFormat(),
            'crf' => $this->getCrf(),
            'envVariables' => $this->getEnvVariables(),
            'quality' => $this->getQuality(),
            'maxRetries' => $this->getMaxRetries(),
            'privacy' => $this->getPrivacy(),
            'logLevel' => $this->getLogLevel(),
            'frameRange' => $this->getFrameRange(),
            'outName' => $this->getOutName(),
            'timeoutInMilliseconds' => $this->getTimeoutInMilliseconds(),
            'chromiumOptions' => $this->getChromiumOptions(),
            'scale' => $this->getScale(),
            'everyNthFrame' => $this->getEveryNthFrame(),
            'numberOfGifLoops' => $this->getNumberOfGifLoops(),
            'concurrencyPerLambda' => $this->getConcurrencyPerLambda(),
            'downloadBehavior' => $this->getDownloadBehavior(),
            'muted' => $this->getMuted(),
            'overwrite' => $this->getOverwrite(),
            'audioBitrate' => $this->getAudioBitrate(),
            'videoBitrate' => $this->getVideoBitrate(),
            'webhook' => $this->getWebhook(),
            'forceHeight' => $this->getForceHeight(),
            'forceWidth' => $this->getForceWidth(),
            'audioCodec' => $this->getAudioCodec(),
        ];

        $json = array_filter($json, function ($value) {
            return $value !== null;
        });

        return json_encode($json);
    }

}
