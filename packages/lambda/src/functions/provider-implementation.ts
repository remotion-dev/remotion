import type {BundlerInternals} from '@remotion/bundler';
import type {
	DeleteAfter,
	FunctionErrorInfo,
	Privacy,
	ProviderSpecifics,
	ReceivedArtifact,
	WebhookPayload,
	AwsRegion,
	RequestHandler,
} from '@remotion/lambda-client';
import type {RuntimePreference} from '@remotion/lambda-client';
import type {
	ChromiumOptions,
	EmittedArtifact,
	LogLevel,
	X264Preset,
} from '@remotion/renderer';
import type {LaunchedBrowser} from './get-browser-instance';

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

export type GetBrowserInstance = ({
	logLevel,
	indent,
	chromiumOptions,
	providerSpecifics,
	insideFunctionSpecifics,
}: {
	logLevel: LogLevel;
	indent: boolean;
	chromiumOptions: ChromiumOptions;
	providerSpecifics: ProviderSpecifics;
	insideFunctionSpecifics: InsideFunctionSpecifics;
}) => Promise<LaunchedBrowser>;

export type ForgetBrowserEventLoop = (options: {
	logLevel: LogLevel;
	launchedBrowser: LaunchedBrowser;
}) => void;

export type CloseBrowserInstance = (options: {
	launchedBrowser: LaunchedBrowser;
}) => Promise<void>;

export type GenerateRenderId = (options: {
	deleteAfter: DeleteAfter | null;
	randomHashFn: () => string;
}) => string;

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

export type InsideFunctionSpecifics = {
	defaultX264Preset: X264Preset | null;
	getBrowserInstance: GetBrowserInstance;
	forgetBrowserEventLoop: ForgetBrowserEventLoop;
	closeBrowserInstance: CloseBrowserInstance;
	timer: DebuggingTimer;
	generateRandomId: GenerateRenderId;
	deleteTmpDir: () => Promise<void>;
	getCurrentFunctionName: () => string;
	getCurrentMemorySizeInMb: () => number;
	invokeWebhook: InvokeWebhook;
	getCurrentRegionInFunction: () => AwsRegion;
	makeArtifactWithDetails: MakeArtifactWithDetails;
	normalizeChromiumOptions:
		| ((options: {
				chromiumOptions: ChromiumOptions;
				logLevel: LogLevel;
		  }) => ChromiumOptions)
		| null;
	getTmpDirState: ((error: string) => FunctionErrorInfo['tmpDir']) | null;
	startRendererDiagnostics: ((requestId: string) => () => void) | null;
};

export type FullClientSpecifics = {
	id: '__remotion_full_client_specifics';
	bundleSite: typeof BundlerInternals.internalBundle;
	readDirectory: ReadDir;
	uploadDir: UploadDir;
	createFunction: CreateFunction;
};
