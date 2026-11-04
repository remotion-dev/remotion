// Internal API surface consumed by @remotion/lambda. Not public API.
export {
	getCloudWatchLogsClient,
	getIamClient,
	getLambdaClient,
	getServiceQuotasClient,
	getStsClient,
} from './aws-clients';
export {
	getAwsPartitionMetadata,
	getAwsRegionMetadata,
	getBillingCurrency,
	getServiceDnsSuffix,
} from './aws-region-metadata';
export {bucketExistsInRegionImplementation} from './bucket-exists';
export {calculateBillingDuration} from './calculate-billing-duration';
export {calculateChunkTimes} from './calculate-chunk-times';
export {callFunctionAsyncImplementation} from './call-lambda-async';
export {
	callFunctionWithStreamingImplementation,
	parseJsonOrThrowSource,
} from './call-lambda-streaming';
export {callFunctionSyncImplementation} from './call-lambda-sync';
export {internalCancelRenderOnLambda} from './cancel-render-on-lambda';
export {checkCredentials} from './check-credentials';
export {cleanItems} from './clean-items';
export {
	compressInputProps,
	decompressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from './compress-props';
export {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	REMOTION_BUCKET_PREFIX,
} from './constants';
export {convertToServeUrlImplementation} from './convert-to-serve-url';
export {createBucket} from './create-bucket';
export {lambdaDeleteFileImplementation} from './delete-file';
export {deleteFunction} from './delete-function';
export {internalDeleteRender} from './delete-render';
export {DOCS_URL} from './docs-url';
export {
	errorIsOutOfSpaceError,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
} from './error-category';
export {estimatePrice} from './estimate-price';
export {estimatePriceFromMetadata} from './estimate-price-from-bucket';
export {
	getCredentialsFromOutName,
	getExpectedOutName,
} from './expected-out-name';
export {findOutputFileInBucket} from './find-output-file-in-bucket';
export {formatCostsInfo} from './format-costs-info';
export {getAccountIdImplementation} from './get-account-id';
export {
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
	getLambdaFunctionUrl,
	getS3BucketUrl,
	getS3RenderUrl,
} from './get-aws-urls';
export {getRemotionBuckets} from './get-buckets';
export {getEnvVariable} from './get-env-variable';
export {getFunctions} from './get-functions';
export {internalGetOrCreateBucket} from './get-or-create-bucket';
export {getOutputUrlFromMetadata} from './get-output-url-from-metadata';
export {getOverallProgressFromStorage} from './get-overall-progress-from-storage';
export {getRemotionVersionFromIndexHtml} from './get-remotion-version-from-index-html';
export {getS3Client} from './get-s3-client';
export {internalGetSites} from './get-sites';
export {getSizeInBytes} from './get-size-in-bytes';
export {lambdaHeadFileImplementation} from './head-file';
export {getImageSequenceFrameKey} from './image-sequence';
export {inputPropsKey, resolvedPropsKey} from './input-props-keys';
export {inspectErrors} from './inspect-error';
export {isFlakyError} from './is-flaky-error';
export {isInsideLambda} from './is-in-lambda';
export {LAMBDA_VERSION_STRING} from './lambda-version-string';
export {
	generateRandomHashWithLifeCycleRule,
	getLifeCycleRules,
} from './lifecycle';
export {applyLifeCyleOperation} from './lifecycle-rules';
export {lambdaLsImplementation} from './list-objects';
export {makeBucketName} from './make-bucket-name';
export {
	getRenderProgressPayload,
	makeLambdaRenderMediaPayload,
	makeLambdaRenderStillPayload,
} from './make-lambda-payload';
export {makeS3ServeUrl} from './make-s3-url';
export {
	OVERHEAD_TIME_PER_LAMBDA,
	getMostExpensiveChunks,
} from './most-expensive-chunks';
export {pLimit} from './p-limit';
export {parseFunctionName} from './parse-function-name';
export {getProgress} from './progress';
export {randomHashImplementation} from './random-hash';
export {lambdaReadFileImplementation} from './read-file';
export {
	internalRenderMediaOnLambdaRaw,
	renderMediaOnLambdaOptionalToRequired,
} from './render-media-on-lambda';
export {internalRenderStillOnLambda} from './render-still-on-lambda';
export {
	getRendererFunctionTransport,
	parseS3RendererStatus,
	rendererTransportArtifactKey,
	rendererTransportAttemptPrefix,
	rendererTransportAudioKey,
	rendererTransportPrefix,
	rendererTransportStatusKey,
	rendererTransportVideoKey,
} from './renderer-transport';
export {runtimePreferenceOptions} from './runtime-preference';
export {deserializeArtifact, serializeArtifact} from './serialize-artifact';
export {
	COMMAND_NOT_FOUND,
	CONCAT_FOLDER_TOKEN,
	MAX_FUNCTIONS_PER_RENDER,
	MAX_NON_INLINE_PAYLOAD_SIZE_PER_FUNCTION,
	MAX_STILL_INLINE_PAYLOAD_SIZE,
	MINIMUM_FRAMES_PER_FUNCTION,
	REMOTION_CONCATENATED_TOKEN,
	RENDERER_PATH_TOKEN,
	artifactName,
	cancellationKey,
	customOutName,
	expiryDays,
	outName,
	outStillName,
	overallProgressKey,
	rendersPrefix,
	serverlessCodecs,
} from './shared-constants';
export {innerSpeculateFunctionName} from './speculate-function-name';
export {streamToString} from './stream-to-string';
export {
	binaryPayloadSinkForStreamer,
	formatMap,
	makeStreamPayload,
	messageTypeIdToMessageType,
} from './streaming/streaming';
export {truthy} from './truthy';
export {validateAwsRegion} from './validate-aws-region';
export {validateBucketName} from './validate-bucket-name';
export {parseBucketName} from './validate-bucketname';
export {validateDeleteAfter} from './validate-delete-after';
export {validateDiskSizeInMb} from './validate-disk-size-in-mb';
export {validateDownloadBehavior} from './validate-download-behavior';
export {validateFramesPerFunction} from './validate-frames-per-function';
export {validateMemorySize} from './validate-memory-size';
export {validateOutname} from './validate-outname';
export {validatePrivacy} from './validate-privacy';
export {validateServeUrl} from './validate-serveurl';
export {validateWebhook} from './validate-webhook';
export {writeCancellationSignal} from './write-cancellation-signal';
export {
	lambdaWriteFileIfNotExistsImplementation,
	lambdaWriteFileImplementation,
	supportsConditionalOutput,
} from './write-file';
