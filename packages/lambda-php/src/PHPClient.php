<?php
namespace Remotion\LambdaPhp;

use Aws\Lambda\LambdaClient;
use Exception;
use stdClass;

class PHPClient
{
    protected $client;
    protected $region;
    protected $serveUrl;
    protected $functionName;

    public function __construct(string $region, string $serveUrl, string $functionName, ?callable $credential)
    {
        $this->client = new LambdaClient([
            'version' => '2015-03-31',
            'region' => $region,
            'credentials' => $credential,
        ]);
        $this->setRegion($region);
        $this->setServeUrl($serveUrl);
        $this->setFunctionName($functionName);
    }

    public function constructInternals(RenderParams $render)
    {
        if (empty($render->getComposition())) {
            throw new ValidationException("'composition' is required.");
        }

        $input = $this->serializeInputProps(
            $render->getData(),
            $this->getRegion(),
            "video-or-audio",
            null
        );

        $render->internal_setSerializedInputProps($input);
        $render->setServeUrl($this->getServeUrl());
        $render->setRegion($this->getRegion());

        return $render->serializeParams();
    }

    public function renderMediaOnLambda(RenderParams $render): RenderMediaOnLambdaResponse
    {
        $params = $this->constructInternals($render);

        $result = $this->invokeLambdaFunction(json_encode($params));
        return $this->handleLambdaResponseRender($result);
    }

    public function makeRenderProgressPayload(string $renderId, string $bucketName, string $logLevel = "info", $forcePathStyle = false)
    {
        $params = array(
            'renderId' => $renderId,
            'bucketName' => $bucketName,
            'type' => 'status',
            "version" => Semantic::VERSION,
            "s3OutputProvider" => null,
            "logLevel" => $logLevel,
            "forcePathStyle" => $forcePathStyle,
        );
        $result = json_encode($params);
        return $result;
    }

    public function getRenderProgress(string $renderId, string $bucketName, string $logLevel = "info", $forcePathStyle = false): GetRenderProgressResponse
    {
        $payload = $this->makeRenderProgressPayload($renderId, $bucketName, $logLevel, $forcePathStyle);
        $result = $this->invokeLambdaFunction($payload);
        return $this->handleLambdaResponseProgress($result);
    }

    private function invokeLambdaFunction(string $payload)
    {
        $result = $this->client->invoke([
            'InvocationType' => 'RequestResponse',
            'FunctionName' => $this->getFunctionName(),
            'Payload' => $payload,
        ]);

        if ($result['StatusCode'] !== 200) {
            throw new Exception("Failed to invoke Lambda function");
        }

        return $result['Payload']->getContents();
    }

    private function handleLambdaResponseRender(string $response): RenderMediaOnLambdaResponse
    {
        $response = json_decode($response, true);

        // AWS response
        if (isset($response->errorMessage)) {
            throw new Exception($response->errorMessage);
        }

        $classResponse = new RenderMediaOnLambdaResponse();

        // Remotion response
        if ($response['type'] === 'error') {
            throw new Exception($response['message']);
        }
        $classResponse->type = $response['type'];
        $classResponse->renderId = $response['renderId'];
        $classResponse->bucketName = $response['bucketName'];
        return $classResponse;
    }

    private function handleLambdaResponseProgress(string $response): GetRenderProgressResponse
    {
        $response = json_decode($response, true);

        if (isset($response->errorMessage)) {
            throw new Exception($response->errorMessage);
        }

        $classResponse = new GetRenderProgressResponse();
        $classResponse->bucket = $response['bucket'];
        $classResponse->chunks = $response['chunks'];
        $classResponse->currentTime = $response['currentTime'];
        $classResponse->done = $response['done'];
        $classResponse->fatalErrorEncountered = $response['fatalErrorEncountered'];
        $classResponse->lambdasInvoked = $response['lambdasInvoked'];
        $classResponse->outBucket = $response['outBucket'];
        $classResponse->outKey = $response['outKey'];
        $classResponse->outputFile = $response['outputFile'];
        $classResponse->overallProgress = $response['overallProgress'];
        $classResponse->renderSize = $response['renderSize'];
        $classResponse->timeToFinish = $response['timeToFinish'];
        $classResponse->type = $response['type'];
        return $classResponse;
    }

    private function serializeInputProps($inputProps, string $region, string $type, ?string $userSpecifiedBucketName): array
    {
        try {
            $payload = json_encode($inputProps);
            $MAX_INLINE_PAYLOAD_SIZE = $type === 'still' ? 5000000 : 200000;

            if (strlen($payload) > $MAX_INLINE_PAYLOAD_SIZE) {
                throw new Exception(
                    sprintf(
                        "Warning: inputProps are over %dKB (%dKB) in size.\n This is not currently supported.",
                        round($MAX_INLINE_PAYLOAD_SIZE / 1000),
                        ceil(strlen($payload) / 1024)
                    )
                );
            }

            return [
                'type' => 'payload',
                'payload' => !is_null($payload) && !empty($payload) && $payload !== "null" ?
                $payload : json_encode(new stdClass()),
            ];
        } catch (Exception $e) {
            throw new Exception(
                'Error serializing inputProps. Check it has no circular references or reduce the size if the object is big.'
            );
        }
    }

    public function getRegion(): string
    {
        return $this->region;
    }

    public function setRegion(string $region): void
    {
        $this->region = $region;
    }

    public function getServeUrl(): string
    {
        return $this->serveUrl;
    }

    public function setServeUrl(string $serveUrl): void
    {
        $this->serveUrl = $serveUrl;
    }

    public function getFunctionName(): string
    {
        return $this->functionName;
    }

    public function setFunctionName(string $functionName): void
    {
        $this->functionName = $functionName;
    }
}
