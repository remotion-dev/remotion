<?php

namespace Remotion\LambdaPhp;

require_once dirname(__DIR__) . '/vendor/autoload.php';
use Aws\Lambda\LambdaClient;
use stdClass;

class PHPClient
{
    private $client;
    private $region;
    private $serveUrl;
    private $functionName;

    public function __construct(
        string $region,
        string $serveUrl,
        string $functionName,
        ? array $credential) {
        $this->client = LambdaClient::factory([
            'version' => 'latest',
            'region' => $region,
            'credentials' => $credential,
        ]);
        $this->setRegion($region);
        $this->setServeUrl($serveUrl);
        $this->setFunctionName($functionName);
    }

    public function constructInternals(
        RenderParams $render
    ) {
        if (empty($render->getComposition())) {
            throw new ValidationException("'compostion' is required.");
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
        return json_encode($render->serializeParams());

    }

    public function render(RenderParams $render) :  ? string
    {
        $params = $this->constructInternals($render);
        $result = $this->client->invoke([
            'InvocationType' => 'RequestResponse',
            'FunctionName' => $functionName,
            'Payload' => json_encode($params),
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
                json_encode($payload) : json_encode(new stdClass()),
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
