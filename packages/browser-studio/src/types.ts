import type {HotMiddlewareMessage} from '@remotion/studio-shared';

export type VirtualProject = {
	rootDir: string;
	entryPoint: string;
	files: Record<string, string>;
	publicFiles?: Record<string, Uint8Array | string>;
};

export type VirtualFileSystem = {
	readFile: (path: string) => Promise<string> | string;
	writeFile: (path: string, contents: string) => Promise<void> | void;
	exists: (path: string) => Promise<boolean> | boolean;
	listFiles: () => Promise<string[]> | string[];
};

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
	iframeSrc?: string;
	dependencyResolver?: BrowserStudioDependencyResolver;
	onCompileStateChange?: (state: CompileState) => void;
	onProjectChange?: (project: VirtualProject) => void;
};

export type BrowserStudioWorkerCompileRequest =
	| {
			type: 'init';
			project: VirtualProject;
			dependencyResolutions: Record<string, BrowserStudioDependencyResolution>;
	  }
	| {
			type: 'update-project';
			project: VirtualProject;
	  };

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
			type: 'building';
	  }
	| {
			type: 'hmr-update';
			assets: BrowserStudioHmrAsset[];
			hmrEvent: HotMiddlewareMessage;
			warnings: string[];
	  }
	| {
			type: 'error';
			error: BrowserStudioError;
	  };
