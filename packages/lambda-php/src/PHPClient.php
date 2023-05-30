<?php
namespace Remotion\LambdaPhp;

use Aws\Lambda\LambdaClient;
use Exception;
use stdClass;

require_once __DIR__ . '/Version.php';
use VERSION;

class PHPClient
{
    private $client;
    private $region;
    private $serveUrl;
    private $functionName;

    public function __construct(string $region, string $serveUrl, string $functionName,  ? array $credential)
    {
        $this->client = LambdaClient::factory([
            'version' => 'latest',
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

        $render->setInputProps($input);
        $render->setServerUrl($this->getServeUrl());
        $render->setRegion($this->getRegion());

        return $render->serializeParams();
    }

    public function renderMediaOnLambda(RenderParams $render) :  ? stdClass
    {
        $params = $this->constructInternals($render);

        $result = $this->invokeLambdaFunction(json_encode($params));
        return $this->handleLambdaResponse($result);
    }

    public function makeRenderProgressPayload(string $renderId, string $bucketName)
    {
        $params = array(
            'renderId' => $renderId,
            'bucketName' => $bucketName,
            'type' => 'status',
            "version" => VERSION,
            "s3OutputProvider" => null
        );
        $result = json_encode($params);
        return $result;
    }

    public function getRenderProgress(string $renderId, string $bucketName) :  ? stdClass
    {
        $payload = $this->makeRenderProgressPayload($renderId, $bucketName);
        $result = $this->invokeLambdaFunction($payload);
        return $this->handleLambdaResponse($result);
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

    private function handleLambdaResponse(string $response) :  ? stdClass
    {
        $response = json_decode($response);

        if (isset($response->errorMessage)) {
            throw new Exception($response->errorMessage);
        }

        return $response;
    }

    private function serializeInputProps($inputProps, string $region, string $type,  ? string $userSpecifiedBucketName) : array
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

    public function getRegion() : string
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
