import type {Readable} from 'node:stream';
import type {StorageClass} from '@aws-sdk/client-s3';
import type {LogLevel} from '@remotion/renderer';
import type {DownloadBehavior} from 'remotion';
import type {AwsRegion} from './regions';
import type {RenderMetadata} from './render-metadata';
import type {ServerlessReturnValues} from './return-values';
import type {
	CustomCredentials,
	Privacy,
	RenderOutput,
	ServerlessRoutines,
} from './shared-constants';
import type {GetBinaryPayloadSink, OnMessage} from './streaming/streaming';
import type {CallFunctionOptions, RequestHandler} from './types';

export type ParseFunctionName = (functionName: string) => {
	version: string;
	memorySizeInMb: number;
	diskSizeInMb: number;
	timeoutInSeconds: number;
} | null;

export type DeleteFile = (params: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<void>;

export type BucketWithLocation = {
	name: string;
	creationDate: number;
	region: AwsRegion;
};

export type BucketExists = (params: {
	bucketName: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<boolean>;

export type ReadFile = (params: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<Readable>;

export type GetBuckets = (options: {
	region: AwsRegion;
	forceBucketName: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<BucketWithLocation[]>;

export type CreateBucket = (params: {
	region: AwsRegion;
	bucketName: string;
	forcePathStyle: boolean;
	skipPutAcl: boolean;
	requestHandler: RequestHandler | null;
	logLevel: LogLevel;
}) => Promise<void>;

export type ApplyLifeCycle = (params: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<void>;

export type ListObjects = (params: {
	bucketName: string;
	prefix: string;
	region: AwsRegion;
	expectedBucketOwner: string | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
	continuationToken?: string;
}) => Promise<BucketObject[]>;

export type BucketObject = {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
};

export type HeadFile = (params: HeadFileInput) => Promise<HeadFileOutput>;

export type RandomHash = () => string;

export type ConvertToServeUrl = (params: {
	urlOrId: string;
	region: AwsRegion;
	bucketName: string;
}) => string;

export type HeadFileOutput = {
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
	Metadata?: Record<string, string> | undefined;
};

export type DeleteFunctionInput = {
	region: AwsRegion;
	functionName: string;
};

export type DeleteFunction = (options: DeleteFunctionInput) => Promise<void>;

export type WriteFileInput = {
	bucketName: string;
	key: string;
	body: Readable | string | Uint8Array;
	region: AwsRegion;
	privacy: Privacy;
	expectedBucketOwner: string | null;
	downloadBehavior: DownloadBehavior | null;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	storageClass: StorageClass | null;
	requestHandler: RequestHandler | null;
	metadata?: Record<string, string> | null;
};

export type WriteFile = (params: WriteFileInput) => Promise<void>;

export type HeadFileInput = {
	bucketName: string;
	key: string;
	region: AwsRegion;
	customCredentials: CustomCredentials | null;
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
};

export type CallFunctionAsync = <T extends ServerlessRoutines>({
	functionName,
	payload,
	region,
	timeoutInTest,
	requestHandler,
}: CallFunctionOptions<T>) => Promise<void>;

export type CallFunctionStreaming = <T extends ServerlessRoutines>(
	options: CallFunctionOptions<T> & {
		receivedStreamingPayload: OnMessage;
		retriesRemaining: number;
		getBinaryPayloadSink: GetBinaryPayloadSink | null;
	},
) => Promise<void>;

export type CallFunctionSync = <T extends ServerlessRoutines>({
	functionName,
	payload,
	region,
	timeoutInTest,
}: CallFunctionOptions<T>) => Promise<ServerlessReturnValues[T]>;

export type GetOutputUrl = (options: {
	output: RenderOutput;
	renderMetadata: RenderMetadata;
	bucketName: string;
	customCredentials: CustomCredentials | null;
	currentRegion: AwsRegion;
}) => {url: string; key: string};

export type EstimatePriceInput = {
	region: AwsRegion;
	memorySizeInMb: number;
	diskSizeInMb: number;
	lambdasInvoked: number;
	durationInMilliseconds: number;
};

export type EstimatePrice = ({
	region,
	memorySizeInMb,
	diskSizeInMb,
	lambdasInvoked,
	...other
}: EstimatePriceInput) => number;

export type GetLoggingUrlForRendererFunction = (options: {
	region: AwsRegion;
	functionName: string;
	rendererFunctionName: string | null;
	renderId: string;
	chunk: null | number;
}) => string;

export type GetFunctionsInput = {
	region: AwsRegion;
	compatibleOnly: boolean;
	logLevel?: LogLevel;
};

export type GetLoggingUrlForMethod = (options: {
	region: AwsRegion;
	functionName: string;
	method: ServerlessRoutines;
	rendererFunctionName: string | null;
	renderId: string;
}) => string;

export type GetAccountId = (options: {region: AwsRegion}) => Promise<string>;

export type FunctionInfo = {
	functionName: string;
	timeoutInSeconds: number;
	memorySizeInMb: number;
	version: string | null;
	diskSizeInMb: number;
};

export type GetFunctions = (
	params: GetFunctionsInput,
) => Promise<FunctionInfo[]>;
