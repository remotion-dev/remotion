export type {RuntimePreference} from './runtime-preference';
import {
	getCloudWatchLogsClient,
	getIamClient,
	getLambdaClient,
	getServiceQuotasClient,
	getStsClient,
} from './aws-clients';
import {awsImplementation} from './aws-provider';
import {
	getAwsPartitionMetadata,
	getAwsRegionMetadata,
} from './aws-region-metadata';
import {calculateBillingDuration} from './calculate-billing-duration';
import {calculateChunkTimes} from './calculate-chunk-times';
import {parseJsonOrThrowSource} from './call-lambda-streaming';
import {internalCancelRenderOnLambda} from './cancel-render-on-lambda';
import {cleanItems} from './clean-items';
import {
	compressInputProps,
	decompressInputProps,
	getNeedsToUpload,
	serializeOrThrow,
} from './compress-props';
import {
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	MAX_EPHEMERAL_STORAGE_IN_MB,
} from './constants';
import {convertToServeUrlImplementation} from './convert-to-serve-url';
import {internalDeleteRender} from './delete-render';
import {DOCS_URL} from './docs-url';
import {
	errorIsOutOfSpaceError,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
} from './error-category';
import {estimatePriceFromMetadata} from './estimate-price-from-bucket';
import {
	getCredentialsFromOutName,
	getExpectedOutName,
} from './expected-out-name';
import {findOutputFileInBucket} from './find-output-file-in-bucket';
import {formatCostsInfo} from './format-costs-info';
import {
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
	getLambdaFunctionUrl,
	getS3BucketUrl,
	getS3RenderUrl,
} from './get-aws-urls';
import {getEnvVariable} from './get-env-variable';
import {internalGetOrCreateBucket} from './get-or-create-bucket';
import {getOverallProgressFromStorage} from './get-overall-progress-from-storage';
import {getRemotionVersionFromIndexHtml} from './get-remotion-version-from-index-html';
import {getS3Client} from './get-s3-client';
import {internalGetSites} from './get-sites';
import {getSizeInBytes} from './get-size-in-bytes';
import {getImageSequenceFrameKey} from './image-sequence';
import {inputPropsKey, resolvedPropsKey} from './input-props-keys';
import {inspectErrors} from './inspect-error';
import {isFlakyError} from './is-flaky-error';
import {LAMBDA_VERSION_STRING} from './lambda-version-string';
import {
	generateRandomHashWithLifeCycleRule,
	getLifeCycleRules,
} from './lifecycle';
import {makeBucketName} from './make-bucket-name';
import {
	getRenderProgressPayload,
	makeLambdaRenderMediaPayload,
	makeLambdaRenderStillPayload,
} from './make-lambda-payload';
import {makeS3ServeUrl} from './make-s3-url';
import {
	getMostExpensiveChunks,
	OVERHEAD_TIME_PER_LAMBDA,
} from './most-expensive-chunks';
import {pLimit} from './p-limit';
import {parseFunctionName} from './parse-function-name';
import {getProgress} from './progress';
import {randomHashImplementation} from './random-hash';
import {
	internalRenderMediaOnLambdaRaw,
	renderMediaOnLambdaOptionalToRequired,
} from './render-media-on-lambda';
import {internalRenderStillOnLambda} from './render-still-on-lambda';
import {
	parseS3RendererStatus,
	rendererTransportArtifactKey,
	rendererTransportAttemptPrefix,
	rendererTransportAudioKey,
	rendererTransportPrefix,
	rendererTransportStatusKey,
	rendererTransportVideoKey,
} from './renderer-transport';
import {runtimePreferenceOptions} from './runtime-preference';
import {deserializeArtifact, serializeArtifact} from './serialize-artifact';
import {
	artifactName,
	cancellationKey,
	COMMAND_NOT_FOUND,
	CONCAT_FOLDER_TOKEN,
	customOutName,
	expiryDays,
	MAX_FUNCTIONS_PER_RENDER,
	MINIMUM_FRAMES_PER_FUNCTION,
	outName,
	outStillName,
	overallProgressKey,
	REMOTION_CONCATENATED_TOKEN,
	RENDERER_PATH_TOKEN,
	rendersPrefix,
	serverlessCodecs,
} from './shared-constants';
import {innerSpeculateFunctionName} from './speculate-function-name';
import {streamToString} from './stream-to-string';
import {
	binaryPayloadSinkForStreamer,
	formatMap,
	makeStreamPayload,
	messageTypeIdToMessageType,
} from './streaming/streaming';
import {truthy} from './truthy';
import {validateAwsRegion} from './validate-aws-region';
import {validateBucketName} from './validate-bucket-name';
import {parseBucketName} from './validate-bucketname';
import {validateDiskSizeInMb} from './validate-disk-size-in-mb';
import {validateDownloadBehavior} from './validate-download-behavior';
import {validateFramesPerFunction} from './validate-frames-per-function';
import {validateMemorySize} from './validate-memory-size';
import {validateOutname} from './validate-outname';
import {validatePrivacy} from './validate-privacy';
import {validateServeUrl} from './validate-serveurl';
import {validateWebhook} from './validate-webhook';
import {writeCancellationSignal} from './write-cancellation-signal';

export {appRouterWebhook, NextWebhookArgs} from './app-router-webhook';
export {
	cancelRenderOnLambda,
	type CancelRenderOnLambdaInput,
} from './cancel-render-on-lambda';
export type {
	AwsBillingCurrency,
	AwsPartition,
	AwsRegionMetadata,
} from './aws-region-metadata';
export type {RenderProgress} from './constants';
export {deleteFunction, DeleteFunctionInput} from './delete-function';
export {deleteRender, type DeleteRenderInput} from './delete-render';
export {estimatePrice, EstimatePriceInput} from './estimate-price';
export {expressWebhook} from './express-webhook';
export {
	getAwsClient,
	type GetAwsClientInput,
	type GetAwsClientOutput,
} from './get-aws-client';
export {
	getCompositionsOnLambda,
	type GetCompositionsOnLambdaInput,
	type GetCompositionsOnLambdaOutput,
} from './get-compositions-on-lambda';
export {getFunctionVersion} from './get-function-version';
export {getFunctions, type GetFunctionsInput} from './get-functions';
export {getRenderProgress} from './get-render-progress';
export type {GetRenderProgressInput} from './get-render-progress';
export {getSites, type GetSitesInput, type GetSitesOutput} from './get-sites';
export {pagesRouterWebhook} from './pages-router-webhook';
export {presignUrl, type PresignUrlInput} from './presign-url';
export type {AwsRegion} from './regions';
export {
	renderMediaOnLambda,
	renderVideoOnLambda,
	type RenderMediaOnLambdaInput,
	type RenderMediaOnLambdaOutput,
} from './render-media-on-lambda';
export {
	renderStillOnLambda,
	type RenderStillOnLambdaInput,
	type RenderStillOnLambdaOutput,
} from './render-still-on-lambda';
export {
	speculateFunctionName,
	type SpeculateFunctionNameInput,
} from './speculate-function-name';
export type {RequestHandler} from './types';
export {validateWebhookSignature} from './validate-webhook-signature';
export {
	renderFramesOnLambda,
	type RenderFramesOnLambdaInput,
	type RenderFramesOnLambdaOutput,
} from './render-frames-on-lambda';

// Shared between the client and the Lambda function runtime.
export {OutputFileAccessDeniedError} from './find-output-file-in-bucket';
export {ServerlessRoutines} from './shared-constants';

export type {Await} from './await';
export type {OutputFileMetadata} from './find-output-file-in-bucket';
export type {BillingCurrency} from './format-costs-info';
export type {FileNameAndSize, GetFolderFiles} from './get-files-in-folder';
export type {
	GetOrCreateBucketInput,
	GetOrCreateBucketOutput,
} from './get-or-create-bucket';
export type {
	ImageSequenceFormat,
	ImageSequenceManifest,
	ImageSequenceOutput,
	ImageSequenceOutputPrefix,
	RendererOutput,
	ServerlessRenderOutput,
} from './image-sequence';
export type {ExpensiveChunk} from './most-expensive-chunks';
export type {OverallRenderProgress} from './overall-render-progress';
export type {
	BucketWithLocation,
	CallFunctionAsync,
	CallFunctionStreaming,
	CallFunctionSync,
	DeleteFunction,
	EstimatePrice,
	FunctionInfo,
	GetAccountId,
	GetFunctions,
	GetLoggingUrlForMethod,
	GetLoggingUrlForRendererFunction,
	GetOutputUrl,
	ParseFunctionName,
	ProviderSpecifics,
	WriteFileInput,
} from './provider-implementation';
export type {RenderMetadata} from './render-metadata';
export type {CleanupInfo, GenericRenderProgress} from './render-progress';
export type {
	RendererFunctionTransport,
	S3RendererArtifactMetadata,
	S3RendererStatus,
} from './renderer-transport';
export type {OrError, ServerlessReturnValues} from './return-values';
export type {SerializedArtifact} from './serialize-artifact';
export type {
	AfterRenderCost,
	CustomCredentials,
	CustomCredentialsWithoutSensitiveData,
	DeleteAfter,
	OutNameInput,
	OutNameInputWithoutCredentials,
	OutNameOutput,
	PostRenderData,
	Privacy,
	RenderOutput,
	SeparateAudioOutput,
	SerializedInputProps,
	ServerlessCodec,
	ServerlessPayload,
	ServerlessPayloads,
	ServerlessStartPayload,
	ServerlessStatusPayload,
	WebhookOption,
} from './shared-constants';
export type {
	BinaryMessageType,
	GetBinaryPayloadSink,
	MessageTypeId,
	OnMessage,
	OnStream,
	StreamingMessage,
	StreamingPayload,
} from './streaming/streaming';
export type {
	CallFunctionOptions,
	ChunkRetry,
	CostsInfo,
	ObjectChunkTimingData,
	ParsedTiming,
	ReceivedArtifact,
	RenderStillFunctionResponsePayload,
} from './types';
export type {
	WebhookErrorPayload,
	WebhookPayload,
	WebhookSuccessPayload,
	WebhookTimeoutPayload,
} from './webhook-types';
export type {
	EnhancedErrorInfo,
	FunctionErrorInfo,
} from './write-error-to-storage';

export const LambdaClientInternals: {
	generateRandomHashWithLifeCycleRule: typeof generateRandomHashWithLifeCycleRule;
	getLambdaClient: typeof getLambdaClient;
	getS3Client: typeof getS3Client;
	getS3RenderUrl: typeof getS3RenderUrl;
	getIamClient: typeof getIamClient;
	getStsClient: typeof getStsClient;
	getCloudWatchLogsClient: typeof getCloudWatchLogsClient;
	getServiceQuotasClient: typeof getServiceQuotasClient;
	parseJsonOrThrowSource: typeof parseJsonOrThrowSource;
	getCloudwatchMethodUrl: typeof getCloudwatchMethodUrl;
	getCloudwatchRendererUrl: typeof getCloudwatchRendererUrl;
	getLambdaFunctionUrl: typeof getLambdaFunctionUrl;
	getS3BucketUrl: typeof getS3BucketUrl;
	MAX_EPHEMERAL_STORAGE_IN_MB: typeof MAX_EPHEMERAL_STORAGE_IN_MB;
	parseFunctionName: typeof parseFunctionName;
	isFlakyError: typeof isFlakyError;
	convertToServeUrlImplementation: typeof convertToServeUrlImplementation;
	randomHashImplementation: typeof randomHashImplementation;
	parseBucketName: typeof parseBucketName;
	makeLambdaRenderMediaPayload: typeof makeLambdaRenderMediaPayload;
	renderMediaOnLambdaOptionalToRequired: typeof renderMediaOnLambdaOptionalToRequired;
	internalDeleteRender: typeof internalDeleteRender;
	internalCancelRenderOnLambda: typeof internalCancelRenderOnLambda;
	internalGetSites: typeof internalGetSites;
	getLifeCycleRules: typeof getLifeCycleRules;
	awsImplementation: typeof awsImplementation;
	runtimePreferenceOptions: typeof runtimePreferenceOptions;
	validateAwsRegion: typeof validateAwsRegion;
	validateDiskSizeInMb: typeof validateDiskSizeInMb;
	validateMemorySize: typeof validateMemorySize;
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD: typeof DEFAULT_CLOUDWATCH_RETENTION_PERIOD;
	DEFAULT_EPHEMERAL_STORAGE_IN_MB: typeof DEFAULT_EPHEMERAL_STORAGE_IN_MB;
	LAMBDA_VERSION_STRING: typeof LAMBDA_VERSION_STRING;
	pLimit: typeof pLimit;
	makeS3ServeUrl: typeof makeS3ServeUrl;
	validateServeUrl: typeof validateServeUrl;
	getEnvVariable: typeof getEnvVariable;
	internalRenderMediaOnLambdaRaw: typeof internalRenderMediaOnLambdaRaw;
	internalRenderStillOnLambda: typeof internalRenderStillOnLambda;
	cleanItems: typeof cleanItems;
	makeLambdaRenderStillPayload: typeof makeLambdaRenderStillPayload;
	getRenderProgressPayload: typeof getRenderProgressPayload;
	innerSpeculateFunctionName: typeof innerSpeculateFunctionName;
	getAwsPartitionMetadata: typeof getAwsPartitionMetadata;
	getAwsRegionMetadata: typeof getAwsRegionMetadata;
	artifactName: typeof artifactName;
	binaryPayloadSinkForStreamer: typeof binaryPayloadSinkForStreamer;
	calculateBillingDuration: typeof calculateBillingDuration;
	calculateChunkTimes: typeof calculateChunkTimes;
	cancellationKey: typeof cancellationKey;
	COMMAND_NOT_FOUND: typeof COMMAND_NOT_FOUND;
	compressInputProps: typeof compressInputProps;
	CONCAT_FOLDER_TOKEN: typeof CONCAT_FOLDER_TOKEN;
	customOutName: typeof customOutName;
	decompressInputProps: typeof decompressInputProps;
	deserializeArtifact: typeof deserializeArtifact;
	DOCS_URL: typeof DOCS_URL;
	errorIsOutOfSpaceError: typeof errorIsOutOfSpaceError;
	estimatePriceFromMetadata: typeof estimatePriceFromMetadata;
	expiryDays: typeof expiryDays;
	findOutputFileInBucket: typeof findOutputFileInBucket;
	formatCostsInfo: typeof formatCostsInfo;
	formatMap: typeof formatMap;
	getCredentialsFromOutName: typeof getCredentialsFromOutName;
	getExpectedOutName: typeof getExpectedOutName;
	getImageSequenceFrameKey: typeof getImageSequenceFrameKey;
	getMostExpensiveChunks: typeof getMostExpensiveChunks;
	getNeedsToUpload: typeof getNeedsToUpload;
	getOverallProgressFromStorage: typeof getOverallProgressFromStorage;
	getProgress: typeof getProgress;
	getRemotionVersionFromIndexHtml: typeof getRemotionVersionFromIndexHtml;
	getSizeInBytes: typeof getSizeInBytes;
	inputPropsKey: typeof inputPropsKey;
	inspectErrors: typeof inspectErrors;
	internalGetOrCreateBucket: typeof internalGetOrCreateBucket;
	isBrowserCrashedError: typeof isBrowserCrashedError;
	isErrInsufficientResourcesErr: typeof isErrInsufficientResourcesErr;
	makeBucketName: typeof makeBucketName;
	makeStreamPayload: typeof makeStreamPayload;
	MAX_FUNCTIONS_PER_RENDER: typeof MAX_FUNCTIONS_PER_RENDER;
	messageTypeIdToMessageType: typeof messageTypeIdToMessageType;
	MINIMUM_FRAMES_PER_FUNCTION: typeof MINIMUM_FRAMES_PER_FUNCTION;
	outName: typeof outName;
	outStillName: typeof outStillName;
	overallProgressKey: typeof overallProgressKey;
	OVERHEAD_TIME_PER_LAMBDA: typeof OVERHEAD_TIME_PER_LAMBDA;
	parseS3RendererStatus: typeof parseS3RendererStatus;
	REMOTION_CONCATENATED_TOKEN: typeof REMOTION_CONCATENATED_TOKEN;
	RENDERER_PATH_TOKEN: typeof RENDERER_PATH_TOKEN;
	rendererTransportArtifactKey: typeof rendererTransportArtifactKey;
	rendererTransportAttemptPrefix: typeof rendererTransportAttemptPrefix;
	rendererTransportAudioKey: typeof rendererTransportAudioKey;
	rendererTransportPrefix: typeof rendererTransportPrefix;
	rendererTransportStatusKey: typeof rendererTransportStatusKey;
	rendererTransportVideoKey: typeof rendererTransportVideoKey;
	rendersPrefix: typeof rendersPrefix;
	resolvedPropsKey: typeof resolvedPropsKey;
	serializeArtifact: typeof serializeArtifact;
	serializeOrThrow: typeof serializeOrThrow;
	serverlessCodecs: typeof serverlessCodecs;
	streamToString: typeof streamToString;
	truthy: typeof truthy;
	validateBucketName: typeof validateBucketName;
	validateDownloadBehavior: typeof validateDownloadBehavior;
	validateFramesPerFunction: typeof validateFramesPerFunction;
	validateOutname: typeof validateOutname;
	validatePrivacy: typeof validatePrivacy;
	validateWebhook: typeof validateWebhook;
	writeCancellationSignal: typeof writeCancellationSignal;
} = {
	generateRandomHashWithLifeCycleRule,
	getLambdaClient,
	getS3Client,
	getS3RenderUrl,
	getIamClient,
	getStsClient,
	getCloudWatchLogsClient,
	getServiceQuotasClient,
	parseJsonOrThrowSource,
	getCloudwatchMethodUrl,
	getCloudwatchRendererUrl,
	getLambdaFunctionUrl,
	getS3BucketUrl,
	MAX_EPHEMERAL_STORAGE_IN_MB,
	parseFunctionName,
	isFlakyError,
	convertToServeUrlImplementation,
	randomHashImplementation,
	parseBucketName,
	makeLambdaRenderMediaPayload,
	renderMediaOnLambdaOptionalToRequired,
	internalDeleteRender,
	internalCancelRenderOnLambda,
	internalGetSites,
	getLifeCycleRules,
	awsImplementation,
	runtimePreferenceOptions,
	validateAwsRegion,
	validateDiskSizeInMb,
	validateMemorySize,
	DEFAULT_CLOUDWATCH_RETENTION_PERIOD,
	DEFAULT_EPHEMERAL_STORAGE_IN_MB,
	LAMBDA_VERSION_STRING,
	pLimit,
	makeS3ServeUrl,
	validateServeUrl,
	getEnvVariable,
	internalRenderMediaOnLambdaRaw,
	internalRenderStillOnLambda,
	cleanItems,
	makeLambdaRenderStillPayload,
	getRenderProgressPayload,
	innerSpeculateFunctionName,
	getAwsPartitionMetadata,
	getAwsRegionMetadata,
	artifactName,
	binaryPayloadSinkForStreamer,
	calculateBillingDuration,
	calculateChunkTimes,
	cancellationKey,
	COMMAND_NOT_FOUND,
	compressInputProps,
	CONCAT_FOLDER_TOKEN,
	customOutName,
	decompressInputProps,
	deserializeArtifact,
	DOCS_URL,
	errorIsOutOfSpaceError,
	estimatePriceFromMetadata,
	expiryDays,
	findOutputFileInBucket,
	formatCostsInfo,
	formatMap,
	getCredentialsFromOutName,
	getExpectedOutName,
	getImageSequenceFrameKey,
	getMostExpensiveChunks,
	getNeedsToUpload,
	getOverallProgressFromStorage,
	getProgress,
	getRemotionVersionFromIndexHtml,
	getSizeInBytes,
	inputPropsKey,
	inspectErrors,
	internalGetOrCreateBucket,
	isBrowserCrashedError,
	isErrInsufficientResourcesErr,
	makeBucketName,
	makeStreamPayload,
	MAX_FUNCTIONS_PER_RENDER,
	messageTypeIdToMessageType,
	MINIMUM_FRAMES_PER_FUNCTION,
	outName,
	outStillName,
	overallProgressKey,
	OVERHEAD_TIME_PER_LAMBDA,
	parseS3RendererStatus,
	REMOTION_CONCATENATED_TOKEN,
	RENDERER_PATH_TOKEN,
	rendererTransportArtifactKey,
	rendererTransportAttemptPrefix,
	rendererTransportAudioKey,
	rendererTransportPrefix,
	rendererTransportStatusKey,
	rendererTransportVideoKey,
	rendersPrefix,
	resolvedPropsKey,
	serializeArtifact,
	serializeOrThrow,
	serverlessCodecs,
	streamToString,
	truthy,
	validateBucketName,
	validateDownloadBehavior,
	validateFramesPerFunction,
	validateOutname,
	validatePrivacy,
	validateWebhook,
	writeCancellationSignal,
};
