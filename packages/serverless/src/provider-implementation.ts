import type {
	ChromiumOptions,
	EmittedArtifact,
	LogLevel,
} from '@remotion/renderer';
import type {Readable} from 'stream';
import type {
	CustomCredentials,
	DownloadBehavior,
	Privacy,
	ServerlessRoutines,
} from './constants';
import type {LaunchedBrowser} from './get-browser-instance';
import type {GetFolderFiles} from './get-files-in-folder';
import type {RenderMetadata} from './render-metadata';
import type {ServerlessReturnValues} from './return-values';
import type {OnMessage} from './streaming/streaming';
import type {
	CallFunctionOptions,
	CloudProvider,
	ReceivedArtifact,
} from './types';

export type BucketWithLocation<Provider extends CloudProvider> = {
	name: string;
	creationDate: number;
	region: Provider['region'];
};

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

type BucketObject = {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
};

type ListObjects<Provider extends CloudProvider> = (params: {
	bucketName: string;
	prefix: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	continuationToken?: string;
}) => Promise<BucketObject[]>;

type DeleteFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
	forcePathStyle: boolean;
}) => Promise<void>;

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

type HeadFileOutput = {
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
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

export type MakeArtifactWithDetails<Provider extends CloudProvider> = (params: {
	region: Provider['region'];
	renderBucketName: string;
	storageKey: string;
	artifact: EmittedArtifact;
}) => ReceivedArtifact<Provider>;

export type DebuggingTimer = (
	label: string,
	logLevel: LogLevel,
) => {
	end: () => void;
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

export type GetLoggingUrlForMethod<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
	functionName: string;
	method: ServerlessRoutines;
	rendererFunctionName: string | null;
	renderId: string;
}) => string;

export type GetOutputUrl<Provider extends CloudProvider> = (options: {
	renderMetadata: RenderMetadata<Provider>;
	bucketName: string;
	customCredentials: CustomCredentials<Provider> | null;
	currentRegion: Provider['region'];
}) => {url: string; key: string};

export type GetBrowserInstance = <Provider extends CloudProvider>({
	logLevel,
	indent,
	chromiumOptions,
	providerSpecifics,
	serverProviderSpecifics,
}: {
	logLevel: LogLevel;
	indent: boolean;
	chromiumOptions: ChromiumOptions;
	providerSpecifics: ProviderSpecifics<Provider>;
	serverProviderSpecifics: ServerProviderSpecifics;
}) => Promise<LaunchedBrowser>;

export type ForgetBrowserEventLoop = (logLevel: LogLevel) => void;

export type ServerProviderSpecifics = {
	getBrowserInstance: GetBrowserInstance;
	forgetBrowserEventLoop: ForgetBrowserEventLoop;
	timer: DebuggingTimer;
};

export type ProviderSpecifics<Provider extends CloudProvider> = {
	getChromiumPath: () => string | null;
	getCurrentRegionInFunction: () => Provider['region'];
	getBuckets: GetBuckets<Provider>;
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
	getFolderFiles: GetFolderFiles;
	makeArtifactWithDetails: MakeArtifactWithDetails<Provider>;
	validateDeleteAfter: (lifeCycleValue: unknown) => void;
	callFunctionAsync: CallFunctionAsync<Provider>;
	callFunctionStreaming: CallFunctionStreaming<Provider>;
	callFunctionSync: CallFunctionSync<Provider>;
	getCurrentFunctionName: () => string;
	estimatePrice: EstimatePrice<Provider>;
	getLoggingUrlForRendererFunction: GetLoggingUrlForRendererFunction<Provider>;
	getLoggingUrlForMethod: GetLoggingUrlForMethod<Provider>;
	getEphemeralStorageForPriceCalculation: () => number;
	getOutputUrl: GetOutputUrl<Provider>;
	isFlakyError: (err: Error) => boolean;
};
