import type {Readable} from 'node:stream';
import type {LogLevel} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion';
import type {
	CustomCredentials,
	Privacy,
	RenderOutput,
	ServerlessRoutines,
} from './constants';
import type {BillingCurrency} from './format-costs-info';
import type {RenderMetadata} from './render-metadata';
import type {RendererFunctionTransport} from './renderer-transport';
import type {ServerlessReturnValues} from './return-values';
import type {GetBinaryPayloadSink, OnMessage} from './streaming/streaming';
import type {CallFunctionOptions, CloudProvider} from './types';

export type ParseFunctionName = (functionName: string) => {
	version: string;
	memorySizeInMb: number;
	diskSizeInMb: number;
	timeoutInSeconds: number;
} | null;

type DeleteFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => Promise<void>;

export type BucketWithLocation<Provider extends CloudProvider> = {
	name: string;
	creationDate: number;
	region: Provider['region'];
};

type BucketExists<Provider extends CloudProvider> = (params: {
	bucketName: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => Promise<boolean>;

type ReadFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => Promise<Readable>;

type GetBuckets<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
	forceBucketName: string | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => Promise<BucketWithLocation<Provider>[]>;

type CreateBucket<Provider extends CloudProvider> = (params: {
	region: Provider['region'];
	bucketName: string;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
	requestHandler: Provider['requestHandler'] | null;
	logLevel: LogLevel;
}) => Promise<void>;

type ApplyLifeCycle<Provider extends CloudProvider> = (params: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
}) => Promise<void>;

type ListObjects<Provider extends CloudProvider> = (params: {
	bucketName: string;
	prefix: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
	continuationToken?: string;
}) => Promise<BucketObject[]>;

type BucketObject = {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
};

type HeadFile<Provider extends CloudProvider> = (
	params: HeadFileInput<Provider>,
) => Promise<HeadFileOutput>;

type RandomHash = () => string;

type ConvertToServeUrl<Provider extends CloudProvider> = (params: {
	urlOrId: string;
	region: Provider['region'];
	bucketName: string;
}) => string;

type HeadFileOutput = {
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
	Metadata?: Record<string, string> | undefined;
};

export type DeleteFunctionInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	functionName: string;
};

export type DeleteFunction<Provider extends CloudProvider> = (
	options: DeleteFunctionInput<Provider>,
) => Promise<void>;

export type WriteFileInput<Provider extends CloudProvider> = {
	bucketName: string;
	key: string;
	body: Readable | string | Uint8Array;
	region: Provider['region'];
	privacy: Privacy;
	expectedBucketOwner: string | null;
	downloadBehavior: DownloadBehavior | null;
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
	storageClass: Provider['storageClass'] | null;
	requestHandler: Provider['requestHandler'] | null;
	metadata?: Record<string, string> | null;
};

type WriteFile<Provider extends CloudProvider> = (
	params: WriteFileInput<Provider>,
) => Promise<void>;

type HeadFileInput<Provider extends CloudProvider> = {
	bucketName: string;
	key: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
	requestHandler: Provider['requestHandler'] | null;
};

export type CallFunctionAsync<Provider extends CloudProvider> = <
	T extends ServerlessRoutines,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
	requestHandler,
}: CallFunctionOptions<T, Provider>) => Promise<void>;

export type CallFunctionStreaming<Provider extends CloudProvider> = <
	T extends ServerlessRoutines,
>(
	options: CallFunctionOptions<T, Provider> & {
		receivedStreamingPayload: OnMessage<Provider>;
		retriesRemaining: number;
		getBinaryPayloadSink: GetBinaryPayloadSink | null;
	},
) => Promise<void>;

export type CallFunctionSync<Provider extends CloudProvider> = <
	T extends ServerlessRoutines,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
}: CallFunctionOptions<T, Provider>) => Promise<
	ServerlessReturnValues<Provider>[T]
>;

export type GetOutputUrl<Provider extends CloudProvider> = (options: {
	output: RenderOutput;
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
}) => {url: string; key: string};

export type EstimatePriceInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	memorySizeInMb: number;
	diskSizeInMb: number;
	functionsInvoked: number;
	durationInMilliseconds: number;
};

export type EstimatePrice<Provider extends CloudProvider> = (
	input: EstimatePriceInput<Provider>,
) => number;

export type GetLoggingUrlForRendererFunction<Provider extends CloudProvider> =
	(options: {
		region: Provider['region'];
		functionName: string;
		rendererFunctionName: string | null;
		renderId: string;
		chunk: null | number;
	}) => string;

export type GetFunctionsInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	compatibleOnly: boolean;
	logLevel?: LogLevel;
};

export type GetLoggingUrlForMethod<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
	functionName: string;
	method: ServerlessRoutines;
	rendererFunctionName: string | null;
	renderId: string;
}) => string;

export type GetAccountId<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
}) => Promise<string>;

export type FunctionInfo = {
	functionName: string;
	timeoutInSeconds: number;
	memorySizeInMb: number;
	version: string | null;
	diskSizeInMb: number;
};

export type GetFunctions<Provider extends CloudProvider> = (
	params: GetFunctionsInput<Provider>,
) => Promise<FunctionInfo[]>;

// User-facing names that show up in error messages and logs.
// They differ per adapter, e.g. `renderMediaOnLambda()` vs. a future
// `renderMediaOnCloudRun()`, so the generic code must not hardcode them.
export type ProviderNames = {
	// The npm package users install to call the functions, e.g. '@remotion/lambda'.
	clientPackage: string;
	// The name of the object storage product, e.g. 'S3'.
	storageProduct: string;
	// API function names without parentheses, e.g. 'renderMediaOnLambda'.
	renderMediaApi: string;
	renderStillApi: string;
	renderFramesApi: string;
	getCompositionsApi: string;
	getRenderProgressApi: string;
	// The option that controls how many frames a single function renders,
	// e.g. 'framesPerLambda'.
	framesPerFunctionOption: string;
};

// Documentation pages that generic error messages link to.
// Each adapter maps these to the pages of its own docs section.
export type ProviderDocsPage =
	| 'deploy-function'
	| 'debug'
	| 'disk-size'
	| 'multiple-buckets'
	| 'bucket-security'
	| 'upgrading'
	| 'too-many-functions';

export type GetBucketListingUrl<Provider extends CloudProvider> = (options: {
	bucketName: string;
	region: Provider['region'];
}) => string | null;

export type ProviderSpecifics<Provider extends CloudProvider> = {
	names: ProviderNames;
	getDocsUrl: (page: ProviderDocsPage) => string;
	// Explain provider-specific errors (e.g. concurrency limits) found in an
	// error stack. Return null to fall back to the generic explanations.
	getErrorExplanation: (stack: string) => string | null;
	// The URL that lists the bucket contents if the bucket is publicly listable.
	// Used to warn about misconfigured buckets. Return null to skip the check.
	getBucketListingUrl: GetBucketListingUrl<Provider>;
	getChromiumPath: () => string | null;
	getBuckets: GetBuckets<Provider>;
	getBucketPrefix: () => string;
	createBucket: CreateBucket<Provider>;
	applyLifeCycle: ApplyLifeCycle<Provider>;
	listObjects: ListObjects<Provider>;
	deleteFile: DeleteFile<Provider>;
	bucketExists: BucketExists<Provider>;
	randomHash: RandomHash;
	readFile: ReadFile<Provider>;
	writeFile: WriteFile<Provider>;
	// Whether this destination supports atomic create-only output uploads.
	supportsConditionalOutput: (params: {
		customCredentials: CustomCredentials<Provider> | null;
	}) => boolean;
	writeFileIfNotExists: WriteFile<Provider> | null;
	// Normalize permission failures to OutputFileAccessDeniedError and missing files
	// to an error named NotFound. Other errors must propagate unchanged.
	headFile: HeadFile<Provider>;
	convertToServeUrl: ConvertToServeUrl<Provider>;
	printLoggingHelper: boolean;
	validateDeleteAfter: (lifeCycleValue: unknown) => void;
	callFunctionAsync: CallFunctionAsync<Provider>;
	callFunctionStreaming: CallFunctionStreaming<Provider>;
	callFunctionSync: CallFunctionSync<Provider>;
	estimatePrice: EstimatePrice<Provider>;
	getLoggingUrlForRendererFunction: GetLoggingUrlForRendererFunction<Provider>;
	getLoggingUrlForMethod: GetLoggingUrlForMethod<Provider>;
	getEphemeralStorageForPriceCalculation: () => number;
	getBillingCurrency: (region: Provider['region']) => BillingCurrency;
	getRendererFunctionTransport: (
		region: Provider['region'],
	) => RendererFunctionTransport;
	getOutputUrl: GetOutputUrl<Provider>;
	isFlakyError: (err: Error) => boolean;
	getMaxStillInlinePayloadSize: () => number;
	getMaxNonInlinePayloadSizePerFunction: () => number;
	getAccountId: GetAccountId<Provider>;
	deleteFunction: DeleteFunction<Provider>;
	getFunctions: GetFunctions<Provider>;
	parseFunctionName: ParseFunctionName;
	checkCredentials: () => void;
};
