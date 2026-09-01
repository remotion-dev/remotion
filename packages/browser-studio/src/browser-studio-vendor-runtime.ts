import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as ReactDomClient from 'react-dom/client';
import * as ReactRefreshRuntime from 'react-refresh/runtime';
import * as ReactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as ReactJsxRuntime from 'react/jsx-runtime';
import * as Remotion from 'remotion';
import * as RemotionNoReact from 'remotion/no-react';
import * as RemotionVersion from 'remotion/version';

let studioPromise: Promise<void> | null = null;
const makeMutableNamespace = <Namespace extends object>(
	namespace: Namespace,
): Namespace => ({
	...((namespace as {default?: object}).default ?? {}),
	...namespace,
});

// Studio is prebuilt separately from the project, but its update client must
// still drive the project's Rspack runtime. The project boot module installs
// this bridge before starting Studio.
globalThis.__webpack_module__ = {
	hot: {
		addStatusHandler: (callback) =>
			globalThis.remotion_browserStudioProjectHot.addStatusHandler(callback),
		apply: (options) =>
			globalThis.remotion_browserStudioProjectHot.apply(options),
		check: (autoApply) =>
			globalThis.remotion_browserStudioProjectHot.check(autoApply),
		status: () => globalThis.remotion_browserStudioProjectHot.status(),
	},
};
Object.defineProperty(globalThis, '__webpack_hash__', {
	configurable: true,
	get: () => globalThis.remotion_browserStudioProjectHot.getHash(),
});

globalThis.remotion_browserStudioVendor = {
	react: makeMutableNamespace(React),
	reactDom: makeMutableNamespace(ReactDom),
	reactDomClient: makeMutableNamespace(ReactDomClient),
	reactJsxDevRuntime: makeMutableNamespace(ReactJsxDevRuntime),
	reactJsxRuntime: makeMutableNamespace(ReactJsxRuntime),
	reactRefreshRuntime: makeMutableNamespace(ReactRefreshRuntime),
	remotion: makeMutableNamespace(Remotion),
	remotionNoReact: makeMutableNamespace(RemotionNoReact),
	remotionVersion: makeMutableNamespace(RemotionVersion),
	startStudio: () => {
		studioPromise ??= import('@remotion/studio/previewEntry').then(
			() => undefined,
		);
		return studioPromise;
	},
};

export const initializeBrowserStudioVendor = (projectBundleUrl: string) => {
	return import(projectBundleUrl);
};

declare global {
	// eslint-disable-next-line no-var
	var __webpack_hash__: string;
	// eslint-disable-next-line no-var
	var __webpack_module__: {
		hot: {
			addStatusHandler: (callback: (status: string) => void) => void;
			apply: (options?: unknown) => Promise<unknown[]>;
			check: (autoApply?: boolean) => Promise<null | unknown[]>;
			status: () => string;
		};
	};
	// eslint-disable-next-line no-var
	var remotion_browserStudioProjectHot: {
		addStatusHandler: (callback: (status: string) => void) => void;
		apply: (options?: unknown) => Promise<unknown[]>;
		check: (autoApply?: boolean) => Promise<null | unknown[]>;
		getHash: () => string;
		status: () => string;
	};
	// eslint-disable-next-line no-var
	var remotion_browserStudioVendor: {
		react: typeof React;
		reactDom: typeof ReactDom;
		reactDomClient: typeof ReactDomClient;
		reactJsxDevRuntime: typeof ReactJsxDevRuntime;
		reactJsxRuntime: typeof ReactJsxRuntime;
		reactRefreshRuntime: typeof ReactRefreshRuntime;
		remotion: typeof Remotion;
		remotionNoReact: typeof RemotionNoReact;
		remotionVersion: typeof RemotionVersion;
		startStudio: () => Promise<void>;
	};
}
