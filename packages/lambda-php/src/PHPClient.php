<?php

namespace Remotion;

use Aws\Lambda\LambdaClient;

class PHPClient
{
    private $client;

    public function __construct(
        string $region,
        string $serveUrl,
        string $functionName,
        array $credential) {
        $this->client = LambdaClient::factory([
            'version' => 'latest',
            'region' => $region,
            'credentials' => $credential,
        ]);
    }

    public function constructInternals(
        array $data,
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
        ? string $audioCodec = null,
    ) {

        return [
            "serveUrl" => $serveUrl,
            "inputProps" => $input,
            "composition" => $composition,
            "type" => $type,
            "codec" => $codec,
            "version" => $version,
            "imageFormat" => $imageFormat,
            "crf" => $crf,
            "envVariables" => $envVariables,
            "quality" => $quality,
            "maxRetries" => $maxRetries,
            "privacy" => $privacy,
            "logLevel" => $logLevel,
            "frameRange" => $frameRange,
            "outName" => $outName,
            "timeoutInMilliseconds" => $timeoutInMilliseconds,
            "chromiumOptions" => $chromiumOptions,
            "scale" => $scale,
            "everyNthFrame" => $everyNthFrame,
            "numberOfGifLoops" => $numberOfGifLoops,
            "concurrencyPerLambda" => $concurrencyPerLambda,
            "downloadBehavior" => $downloadBehavior,
            "muted" => $muted,
            "overwrite" => $overwrite,
            "audioBitrate" => $audioBitrate,
            "videoBitrate" => $videoBitrate,
            "webhook" => $webhook,
            "forceHeight" => $forceHeight,
            "forceWidth" => $forceWidth,
            "bucketName" => $bucketName,
            "audioCodec" => $audioCodec,
            "forceBucketName" => $bucketName,
        ];

    }

    public function invokeLambda(
        array $data,
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
        ? string $audioCodec = null,
    ) :  ? string{
        $input = serializeInputProps(
            $data,
            $region,
            "video-or-audio",
            null
        );

        $params = [
            "serveUrl" => $serveUrl,
            "inputProps" => $input,
            "composition" => $composition,
            "type" => $type,
            "codec" => $codec,
            "version" => $version,
            "imageFormat" => $imageFormat,
            "crf" => $crf,
            "envVariables" => $envVariables,
            "quality" => $quality,
            "maxRetries" => $maxRetries,
            "privacy" => $privacy,
            "logLevel" => $logLevel,
            "frameRange" => $frameRange,
            "outName" => $outName,
            "timeoutInMilliseconds" => $timeoutInMilliseconds,
            "chromiumOptions" => $chromiumOptions,
            "scale" => $scale,
            "everyNthFrame" => $everyNthFrame,
            "numberOfGifLoops" => $numberOfGifLoops,
            "concurrencyPerLambda" => $concurrencyPerLambda,
            "downloadBehavior" => $downloadBehavior,
            "muted" => $muted,
            "overwrite" => $overwrite,
            "audioBitrate" => $audioBitrate,
            "videoBitrate" => $videoBitrate,
            "webhook" => $webhook,
            "forceHeight" => $forceHeight,
            "forceWidth" => $forceWidth,
            "bucketName" => $bucketName,
            "audioCodec" => $audioCodec,
            "forceBucketName" => $bucketName,
        ];

        // Remove null values
        $data = array_filter($params, function ($value) {
            return !is_null($value);
        });

        $result = $this->client->invoke([
            'InvocationType' => 'RequestResponse',
            'FunctionName' => $functionName,
            'Payload' => json_encode($data),
        ]);

        // Check if the invocation was successful
        if ($result->getStatusCode() == 200) {
            // Get the response from the invocation
            $response = json_decode($result->get('Payload'));
            if (isset($response->errorMessage)) {
                // The Lambda function encountered an error
                throw new Exception($response->errorMessage);
            } else {
                // The Lambda function was invoked successfully
                return $response->output;
            }
        } else {
            // The Lambda function encountered an error
            throw new Exception("Failed to invoke Lambda function");
        }
    }
}
