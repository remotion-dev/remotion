import type {
	AwsRegion,
	Privacy,
	ReceivedArtifact,
	RequestHandler,
	RuntimePreference,
	WebhookPayload,
} from '@remotion/lambda-client';
import type {EmittedArtifact, LogLevel} from '@remotion/renderer';

export type MakeArtifactWithDetails = (params: {
	region: AwsRegion;
	renderBucketName: string;
	storageKey: string;
	artifact: EmittedArtifact;
}) => ReceivedArtifact;

export type DebuggingTimer = (
	label: string,
	logLevel: LogLevel,
) => {
	end: () => void;
};

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

export type UploadDir = (options: {
	bucket: string;
	region: AwsRegion;
	localDir: string;
	keyPrefix: string;
	onProgress: (progress: UploadDirProgress) => void;
	privacy: Privacy;
	toUpload: string[];
	forcePathStyle: boolean;
	requestHandler: RequestHandler | null;
}) => Promise<void>;

type CreateFunctionOptions = {
	region: AwsRegion;
	logLevel: LogLevel;
	ephemerealStorageInMb: number;
	timeoutInSeconds: number;
	memorySizeInMb: number;
	functionName: string;
	zipFile: string;
	requestHandler: RequestHandler | null;
	createCloudWatchLogGroup: boolean;
	accountId: string;
	alreadyCreated: boolean;
	retentionInDays: number;
	customRoleArn: string;
	customLayerArns: string[] | null;
	enableLambdaInsights: boolean;
	vpcSubnetIds: string;
	vpcSecurityGroupIds: string;
	runtimePreference: RuntimePreference;
};

export type CreateFunction = (
	options: CreateFunctionOptions,
) => Promise<{FunctionName: string}>;

export type InvokeWebhookOptions = {
	payload: WebhookPayload<string | null>;
	url: string;
	secret: string | null;
};

export type InvokeWebhookParams = {
	options: InvokeWebhookOptions;
	logLevel: LogLevel;
	retries?: number;
	errors?: number;
};

export type InvokeWebhook = (params: InvokeWebhookParams) => Promise<void>;
