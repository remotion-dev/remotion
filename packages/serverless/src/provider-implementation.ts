import type {bundle} from '@remotion/bundler';
import type {
	ChromiumOptions,
	EmittedArtifact,
	LogLevel,
} from '@remotion/renderer';
import type {Readable} from 'stream';
import type {
	CustomCredentials,
	DeleteAfter,
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
	insideFunctionSpecifics,
}: {
	logLevel: LogLevel;
	indent: boolean;
	chromiumOptions: ChromiumOptions;
	providerSpecifics: ProviderSpecifics<Provider>;
	insideFunctionSpecifics: InsideFunctionSpecifics;
}) => Promise<LaunchedBrowser>;

export type ForgetBrowserEventLoop = (logLevel: LogLevel) => void;

export type GenerateRenderId = (options: {
	deleteAfter: DeleteAfter | null;
	randomHashFn: () => string;
}) => string;

export type GetAccountId<Provider extends CloudProvider> = (options: {
	region: Provider['region'];
}) => Promise<string>;

export type DeleteFunctionInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	functionName: string;
};

export type DeleteFunction<Provider extends CloudProvider> = (
	options: DeleteFunctionInput<Provider>,
) => Promise<void>;

export type GetFunctionsInput<Provider extends CloudProvider> = {
	region: Provider['region'];
	compatibleOnly: boolean;
	logLevel?: LogLevel;
};

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

export type ReadDir = ({
	dir,
	etags,
	originalDir,
	onProgress,
}: {
	dir: string;
	etags: {
		[key: string]: () => Promise<string>;
	};
	originalDir: string;
	onProgress: (bytes: number) => void;
}) => {
	[key: string]: () => Promise<string>;
};

export type UploadDirProgress = {
	totalFiles: number;
	filesUploaded: number;
	totalSize: number;
	sizeUploaded: number;
};

export type UploadDir<Provider extends CloudProvider> = (options: {
	bucket: string;
	region: Provider['region'];
	localDir: string;
	keyPrefix: string;
	onProgress: (progress: UploadDirProgress) => void;
	privacy: Privacy;
	toUpload: string[];
	forcePathStyle: boolean;
}) => Promise<void>;

type CreateFunctionOptions<Provider extends CloudProvider> = {
	region: Provider['region'];
	logLevel: LogLevel;
	ephemerealStorageInMb: number;
	timeoutInSeconds: number;
	memorySizeInMb: number;
	functionName: string;
	zipFile: string;
} & Provider['creationFunctionOptions'];

export type CreateFunction<Provider extends CloudProvider> = (
	options: CreateFunctionOptions<Provider>,
) => Promise<{FunctionName: string}>;

export type InsideFunctionSpecifics = {
	getBrowserInstance: GetBrowserInstance;
	forgetBrowserEventLoop: ForgetBrowserEventLoop;
	timer: DebuggingTimer;
	generateRandomId: GenerateRenderId;
	deleteTmpDir: () => Promise<void>;
	getCurrentFunctionName: () => string;
	getCurrentMemorySizeInMb: () => number;
};

export type FullClientSpecifics<Provider extends CloudProvider> = {
	id: '__remotion_full_client_specifics';
	bundleSite: typeof bundle;
	readDirectory: ReadDir;
	uploadDir: UploadDir<Provider>;
	createFunction: CreateFunction<Provider>;
	checkCredentials: () => void;
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
};
