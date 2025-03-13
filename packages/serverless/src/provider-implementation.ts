import type {bundle} from '@remotion/bundler';
import type {
	ChromiumOptions,
	EmittedArtifact,
	LogLevel,
} from '@remotion/renderer';
import type {
	CloudProvider,
	DeleteAfter,
	GetFolderFiles,
	Privacy,
	ProviderSpecifics,
	ReceivedArtifact,
	WebhookPayload,
} from '@remotion/serverless-client';
import type {LaunchedBrowser} from './get-browser-instance';

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
	insideFunctionSpecifics: InsideFunctionSpecifics<Provider>;
}) => Promise<LaunchedBrowser>;

export type ForgetBrowserEventLoop = (options: {
	logLevel: LogLevel;
	launchedBrowser: LaunchedBrowser;
}) => void;

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

export type InvokeWebhookOptions = {
	payload: WebhookPayload;
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

export type InsideFunctionSpecifics<Provider extends CloudProvider> = {
	getBrowserInstance: GetBrowserInstance;
	forgetBrowserEventLoop: ForgetBrowserEventLoop;
	timer: DebuggingTimer;
	generateRandomId: GenerateRenderId;
	deleteTmpDir: () => Promise<void>;
	getCurrentFunctionName: () => string;
	getCurrentMemorySizeInMb: () => number;
	invokeWebhook: InvokeWebhook;
	getCurrentRegionInFunction: () => Provider['region'];
	makeArtifactWithDetails: MakeArtifactWithDetails<Provider>;
	getFolderFiles: GetFolderFiles;
};

export type FullClientSpecifics<Provider extends CloudProvider> = {
	id: '__remotion_full_client_specifics';
	bundleSite: typeof bundle;
	readDirectory: ReadDir;
	uploadDir: UploadDir<Provider>;
	createFunction: CreateFunction<Provider>;
};
