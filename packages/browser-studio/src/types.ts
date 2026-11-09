import type {BrowserCompilerProject as SourceProject} from '@remotion/browser-bundler/compiler';
import type {StudioElementPayload} from '@remotion/studio-protocol';
import type {HotMiddlewareMessage} from '@remotion/studio-shared';

export type VirtualProject = SourceProject & {
	publicFiles?: Record<string, VirtualProjectPublicFile>;
	publicFileStorage?: BrowserStudioProjectStorage;
};

export type BrowserStudioProjectStorage = {
	directoryName: string;
	type: 'opfs';
};

export type BrowserStudioStoredPublicFile = {
	key: string;
	lastModified: number;
	sizeInBytes: number;
	type: 'stored';
};

export type VirtualProjectPublicFile =
	| Uint8Array
	| string
	| BrowserStudioStoredPublicFile;

export type {VirtualFileSystem} from '@remotion/browser-bundler';

export type BrowserStudioDependencyResolution =
	| string
	| {
			url?: string;
			version?: string;
	  }
	| null;

export type BrowserStudioDependencyResolver = (dependency: {
	name: string;
	version: string | null;
}) => BrowserStudioDependencyResolution;

export type BrowserStudioError = {
	message: string;
	stack?: string;
	diagnostics?: string[];
};

export type CompileState =
	| {
			status: 'idle';
	  }
	| {
			status: 'compiling';
	  }
	| {
			status: 'compiled';
			warnings: string[];
	  }
	| {
			status: 'error';
			error: BrowserStudioError;
	  };

export type BrowserStudioProps = {
	project: VirtualProject;
	readOnly: boolean;
	initialElement: {
		payload: StudioElementPayload;
		sourceOrigin: string | null;
	} | null;
	iframeSrc?: string;
	showExperimentalNotice?: boolean;
	remotionPackageSource?: BrowserStudioRemotionPackageSource;
	dependencyResolver?: BrowserStudioDependencyResolver;
	onCompileStateChange?: (state: CompileState) => void;
	onProjectChange?: (project: VirtualProject) => void;
};

export type BrowserStudioRemotionPackageSource =
	| {
			readonly type: 'workspace';
			readonly baseUrl: string;
			readonly commit: string;
	  }
	| {
			readonly type: 'release';
			readonly baseUrl: string;
			readonly version: string;
	  };

export type BrowserStudioCompileInput = {
	project: VirtualProject;
	sourceMutationId: string | null;
};

type ProjectRequest = BrowserStudioCompileInput & {
	dependencyResolutions: Record<string, BrowserStudioDependencyResolution>;
};

export type BrowserStudioWorkerCompileRequest =
	| (ProjectRequest & {
			type: 'init';
			remotionPackageSource: BrowserStudioRemotionPackageSource | null;
			useVendorBundle: boolean;
	  })
	| (ProjectRequest & {type: 'update-project'})
	| {type: 'acknowledge-project'; sourceMutationId: string};

export type BrowserStudioHmrAsset = {
	content: string;
	name: string;
};

export type BrowserStudioWorkerCompileResponse =
	| {
			type: 'initial-compiled';
			bundle: string;
			warnings: string[];
	  }
	| {
			type: 'load-progress';
			asset: 'rspack-wasm';
			loadedBytes: number;
			totalBytes: number | null;
	  }
	| {
			type: 'building';
	  }
	| {
			type: 'hmr-update';
			assets: BrowserStudioHmrAsset[] | null;
			hmrEvent: HotMiddlewareMessage;
			warnings: string[];
	  }
	| {
			type: 'error';
			error: BrowserStudioError;
	  };
