export {
	createBrowserCompiler,
	type BrowserCompiler,
	type BrowserCompilerProject,
	type BrowserCompilerResult,
} from './create-browser-compiler';
export {createBrowserDependencyPlugin} from './dependency-resolution';
export {makeBrowserHttpClient} from './http-client';
export {
	getVirtualProjectChanges,
	getVirtualProjectFiles,
	normalizeVirtualPath,
} from './virtual-project';
