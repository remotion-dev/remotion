import type {LogLevel} from '@remotion/renderer';
import type {Readable} from 'node:stream';
import type {
	CustomCredentials,
	DownloadBehavior,
	Privacy,
	ServerlessRoutines,
} from './constants';
import type {RenderMetadata} from './render-metadata';
import type {ServerlessReturnValues} from './return-values';
import type {OnMessage} from './streaming/streaming';
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
}) => Promise<boolean>;

type ReadFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
}) => Promise<Readable>;

type GetBuckets<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
	forceBucketName: string | null;
	forcePathStyle: boolean;
}) => Promise<BucketWithLocation<Provider>[]>;

type CreateBucket<Provider extends CloudProvider> = (params: {
	region: Provider['region'];
	bucketName: string;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
}) => Promise<void>;

type ApplyLifeCycle<Provider extends CloudProvider> = (params: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
}) => Promise<void>;

type ListObjects<Provider extends CloudProvider> = (params: {
	bucketName: string;
	prefix: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
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
};

export type CallFunctionAsync<Provider extends CloudProvider> = <
	T extends ServerlessRoutines,
>({
	functionName,
	payload,
	region,
	timeoutInTest,
}: CallFunctionOptions<T, Provider>) => Promise<void>;

export type CallFunctionStreaming<Provider extends CloudProvider> = <
	T extends ServerlessRoutines,
>(
	options: CallFunctionOptions<T, Provider> & {
		receivedStreamingPayload: OnMessage<Provider>;
		retriesRemaining: number;
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
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
}) => {url: string; key: string};

export type EstimatePriceInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	memorySizeInMb: number;
	diskSizeInMb: number;
	lambdasInvoked: number;
	durationInMilliseconds: number;
};

export type EstimatePrice<Provider extends CloudProvider> = ({
	region,
	memorySizeInMb,
	diskSizeInMb,
	lambdasInvoked,
	...other
}: EstimatePriceInput<Provider>) => number;

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

export type ProviderSpecifics<Provider extends CloudProvider> = {
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
	getOutputUrl: GetOutputUrl<Provider>;
	isFlakyError: (err: Error) => boolean;
	serverStorageProductName: () => string;
	getMaxStillInlinePayloadSize: () => number;
	getMaxNonInlinePayloadSizePerFunction: () => number;
	getAccountId: GetAccountId<Provider>;
	deleteFunction: DeleteFunction<Provider>;
	getFunctions: GetFunctions<Provider>;
	parseFunctionName: ParseFunctionName;
	checkCredentials: () => void;
};
