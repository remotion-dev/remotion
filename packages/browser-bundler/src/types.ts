export type VirtualProject = {
	entryPoint: string;
	files: Record<string, string>;
};

export type VirtualFileSystem = {
	readFile: (path: string) => Promise<string> | string;
	writeFile: (path: string, contents: string) => Promise<void> | void;
	exists: (path: string) => Promise<boolean> | boolean;
	listFiles: () => Promise<string[]> | string[];
};

export type BrowserBundle = {
	code: string;
	warnings: string[];
};

export type BrowserBundlerProgress = {
	asset: 'rspack-wasm';
	loadedBytes: number;
	totalBytes: number | null;
};

export type BrowserBundlerOptions = {
	dependencyVersions?: Record<string, string>;
	onProgress?: (progress: BrowserBundlerProgress) => void;
	workerUrl?: string | URL;
};

export type BrowserBundler = {
	bundle: (options: {project: VirtualProject}) => Promise<BrowserBundle>;
	dispose: () => void;
};

export type BrowserBundlerWorkerRequest = {
	id: number;
	project: VirtualProject;
	dependencyVersions: Record<string, string>;
};

export type SerializedCompilerError = {
	message: string;
	stack: string | null;
	diagnostics: string[];
};

export type BrowserBundlerWorkerResponse =
	| {
			type: 'bundle';
			id: number;
			bundle: BrowserBundle;
	  }
	| {
			type: 'error';
			id: number;
			error: SerializedCompilerError;
	  }
	| ({type: 'progress'} & BrowserBundlerProgress);
