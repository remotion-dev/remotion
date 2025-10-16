<?php
namespace Remotion\LambdaPhp;

use stdClass;
use Exception;
use Aws\S3\S3Client;
use Aws\Lambda\LambdaClient;
use InvalidArgumentException;
use Aws\Exception\AwsException;

class PHPClient
{
    private const BUCKET_NAME_PREFIX = 'remotionlambda-';
    private const REGION_US_EAST = 'us-east-1';

    protected $client;
    protected $s3Client;
    protected $region;
    protected $serveUrl;
    protected $functionName;
    protected $credential;
    protected $forcePathStyle;

    public function __construct(string $region, string $serveUrl, string $functionName, ?callable $credential, bool $forcePathStyle = false)
    {
        $this->client = new LambdaClient([
            'version' => '2015-03-31',
            'region' => $region,
            'credentials' => $credential,
        ]);
        $this->credential = $credential;
        $this->forcePathStyle = $forcePathStyle;
        $this->setRegion($region);
        $this->setServeUrl($serveUrl);
        $this->setFunctionName($functionName);
    }

    /**
     * Create S3 client with appropriate credentials
     */
    private function createS3Client(): S3Client
    {
        if ($this->s3Client !== null) {
            return $this->s3Client;
        }

        $config = [
            'version' => 'latest',
            'region' => $this->region,
        ];

        if ($this->forcePathStyle) {
            $config['use_path_style_endpoint'] = true;
        }

        if ($this->credential !== null) {
            $config['credentials'] = $this->credential;
        }

        $this->s3Client = new S3Client($config);

        return $this->s3Client;
    }

    /**
     * Generate a SHA256 hash for the payload
     */
    private function generateHash(string $payload): string
    {
        return hash('sha256', $payload);
    }

    /**
     * Generate a random hash for bucket operations
     */
    private function generateRandomHash(): string
    {
        $alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        return substr(str_shuffle(str_repeat($alphabet, 10)), 0, 10);
    }

    /**
     * Generate a bucket name following Remotion conventions
     */
    private function makeBucketName(): string
    {
        $regionNoDashes = str_replace('-', '', $this->region);
        $randomSuffix = $this->generateRandomHash();

        return self::BUCKET_NAME_PREFIX . $regionNoDashes . '-' . $randomSuffix;
    }

    /**
     * Generate S3 key for input props
     */
    private function inputPropsKey(string $hash): string
    {
        return "input-props/{$hash}.json";
    }

    /**
     * Check if a bucket is in the current region
     */
    private function isBucketInCurrentRegion(S3Client $s3Client, string $bucket): bool
    {
        try {
            $result = $s3Client->getBucketLocation(['Bucket' => $bucket]);
            $location = $result['LocationConstraint'];

            return $location === $this->region || ($location === null && $this->region === self::REGION_US_EAST);
        } catch (AwsException $exception) {
            return false;
        }
    }

    /**
     * Get all Remotion buckets in the current region
     */
    private function getRemotionBuckets(): array
    {
        $s3Client = $this->createS3Client();

        try {
            $result = $s3Client->listBuckets();
        } catch (AwsException $exception) {
            error_log("Could not list S3 buckets: " . $exception->getMessage());
            return [];
        }

        $buckets = [];

        foreach ($result['Buckets'] as $bucket) {
            $name = $bucket['Name'];

            if (strpos($name, self::BUCKET_NAME_PREFIX) !== 0) {
                continue;
            }

            if ($this->isBucketInCurrentRegion($s3Client, $name)) {
                $buckets[] = $name;
            }
        }

        return $buckets;
    }

    /**
     * Get existing bucket or create a new one following JS SDK logic
     */
    private function getOrCreateBucket(): string
    {
        $buckets = $this->getRemotionBuckets();

        if (count($buckets) > 1) {
            throw new Exception(
                sprintf(
                    "You have multiple buckets (%s) in your S3 region (%s) starting with \"remotionlambda-\". " .
                    "Please see https://remotion.dev/docs/lambda/multiple-buckets.",
                    implode(', ', $buckets),
                    $this->region
                )
            );
        }

        if (count($buckets) === 1) {
            return $buckets[0];
        }

        $bucket = $this->makeBucketName();
        $s3Client = $this->createS3Client();

        try {
            $params = ['Bucket' => $bucket];

            if ($this->region !== self::REGION_US_EAST) {
                $params['CreateBucketConfiguration'] = [
                    'LocationConstraint' => $this->region
                ];
            }

            $s3Client->createBucket($params);

            return $bucket;
        } catch (AwsException $exception) {
            throw new Exception("Failed to create bucket: " . $exception->getMessage());
        }
    }

    /**
     * Upload payload to S3
     */
    private function uploadToS3(string $bucket, string $key, string $payload): void
    {
        $s3Client = $this->createS3Client();

        try {
            $s3Client->putObject([
                'Bucket' => $bucket,
                'Key' => $key,
                'Body' => $payload,
                'ContentType' => 'application/json',
            ]);
        } catch (AwsException $exception) {
            throw new Exception("Failed to upload to S3: {$exception->getMessage()}");
        }
    }

    /**
     * Determine if payload needs to be uploaded to S3
     */
    private function needsUpload(int $payloadSize, string $renderType): bool
    {
        // Constants based on AWS Lambda limits with margin for other payload data
        $margin = 5_000 + 1_024; // 5KB margin + 1KB for webhook data
        $maxStillInlineSize = 5_000_000 - $margin;
        $maxVideoInlineSize = 200_000 - $margin;

        $maxSize = ($renderType === 'still') ? $maxStillInlineSize : $maxVideoInlineSize;

        if ($payloadSize < $maxSize) {
            return false;
        }

        $message = sprintf(
            "Warning: The props are over %dKB (%dKB) in size. Uploading them to S3 to " .
            "circumvent AWS Lambda payload size, which may lead to slowdown.",
            round($maxSize / 1000),
            ceil($payloadSize / 1024)
        );

        error_log($message);

        return true;
    }

    /**
     * Normalize payload to ensure valid JSON object is returned
     *
     * @param string|null $payload The JSON payload to normalize
     * @return string Valid JSON string, defaulting to empty object if invalid
     */
    private function ensureValidPayload(?string $payload): string
    {
        if (is_null($payload) || empty($payload) || $payload === "null") {
            return json_encode(new stdClass());
        }

        return $payload;
    }

    public function constructInternals(RenderParams $render)
    {
        if (empty($render->getComposition())) {
            throw new InvalidArgumentException("'composition' is required.");
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
        return json_encode([
            'renderId' => $renderId,
            'bucketName' => $bucketName,
            'type' => 'status',
            "version" => Semantic::VERSION,
            "s3OutputProvider" => null,
            "logLevel" => $logLevel,
            "forcePathStyle" => $forcePathStyle,
        ]);
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

    /**
     * Serialize inputProps to a format compatible with Lambda
     */
    private function serializeInputProps($inputProps, string $region, string $type, ?string $userSpecifiedBucketName): array
    {
        try {
            $payload = json_encode($inputProps, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            $payloadSize = strlen($payload);

            if (! $this->needsUpload($payloadSize, $type)) {
                return [
                    'type' => 'payload',
                    'payload' => $this->ensureValidPayload($payload),
                ];
            }

            $hash = $this->generateHash($payload);
            $bucketName = $this->getOrCreateBucket();
            $key = $this->inputPropsKey($hash);

            $this->uploadToS3($bucketName, $key, $payload);

            return [
                'hash' => $hash,
                'type' => 'bucket-url',
                'bucketName' => $bucketName,
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
