<?php

namespace Remotion;

use Aws\Lambda\LambdaClient;

// Define a custom JSON_UNESCAPED_SLASHES flag with a filter function
define('JSON_UNESCAPED_SLASHES_NULL_FILTER', function ($value) {
    return is_null($value) ? '' : $value;
});

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
        RenderParams $render
    ) {
        if (empty($render->getComposition())) {
            throw new ValidationException("'compostion' is required.");
        }
        $input = $this->serializeInputProps(
            $data,
            $region,
            "video-or-audio",
            null
        );

        $json = json_encode($obj, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES_NULL_FILTER);

        return $json;

    }

    public function invokeLambda(RenderParams $render):  ? string
    {
        // $this->constructInternals($data, )
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

    private function serializeInputProps($inputProps, string $region, string $type,  ? string $userSpecifiedBucketName) : array
    {
        try {
            $payload = json_encode($inputProps);
            $hash = randomHash();

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
                'payload' => $payload,
            ];
        } catch (Exception $e) {
            throw new Exception(
                'Error serializing inputProps. Check it has no circular references or reduce the size if the object is big.'
            );
        }
    }
}
