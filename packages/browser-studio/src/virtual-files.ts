import {getBrowserReactRefreshVirtualFiles} from '@remotion/browser-bundler/compiler';
import {
	REACT_REFRESH_FINISHED_EVENT,
	REACT_REFRESH_STARTED_EVENT,
} from '@remotion/studio-shared';

export const browserStudioVirtualFilePaths = {
	browserRequireShim: '/__remotion_browser_studio__/browser-require-shim.js',
	reactRefreshEntry: '/__remotion_browser_studio__/react-refresh-entry.js',
	reactRefreshRuntime: '/__remotion_browser_studio__/reactRefresh.js',
	reactRefreshUtils: '/__remotion_browser_studio__/refreshUtils.js',
	setupEnvironment: '/__remotion_browser_studio__/setup-environment.ts',
	setupSequenceStackTraces:
		'/__remotion_browser_studio__/setup-sequence-stack-traces.ts',
	studioPreviewEntry: '/__remotion_browser_studio__/studio-preview-entry.js',
	studioBootstrap: '/__remotion_browser_studio__/studio-bootstrap.js',
	jsxRuntime: '/__remotion_browser_studio__/jsx-runtime.ts',
	jsxDevRuntime: '/__remotion_browser_studio__/jsx-dev-runtime.ts',
	jsxImportSource: '/__remotion_browser_studio__',
	reactShim: '/__remotion_browser_studio__/react-shim.js',
};

declare const __BROWSER_STUDIO_SETUP_ENVIRONMENT__: string | undefined;

const getInjectedSetupEnvironment = () => {
	if (typeof __BROWSER_STUDIO_SETUP_ENVIRONMENT__ === 'undefined') {
		throw new Error('Browser Studio setup environment was not injected');
	}

	return __BROWSER_STUDIO_SETUP_ENVIRONMENT__;
};

const notifyOnRefresh = `const RemotionRefreshRuntime = require('react-refresh/runtime');
RemotionRefreshRuntime.__remotionReactRefreshWrapped ??= null;

if (RemotionRefreshRuntime.__remotionReactRefreshWrapped === null) {
  const originalPerformReactRefresh = RemotionRefreshRuntime.performReactRefresh;
  RemotionRefreshRuntime.__remotionReactRefreshWrapped = true;
  RemotionRefreshRuntime.performReactRefresh = () => {
    window.dispatchEvent(new Event(${JSON.stringify(REACT_REFRESH_STARTED_EVENT)}));
    const result = originalPerformReactRefresh();
    if (result !== null) {
      window.dispatchEvent(new Event(${JSON.stringify(REACT_REFRESH_FINISHED_EVENT)}));
    }

    return result;
  };
}

window.remotion_performReactRefresh = () => RemotionRefreshRuntime.performReactRefresh();
`;

const setupSequenceStackTraces = `import React from 'react';
import * as RefreshRuntime from 'react-refresh/runtime';
import {Internals} from 'remotion';

Internals.setComponentIdentityResolver((component) => {
  return RefreshRuntime.getFamilyByType(component) ?? component;
});

export const enableProxy = (api, sourceArgumentIndex) =>
  Internals.createElementSourceProxy(api, sourceArgumentIndex, (fileName) => fileName);

React.createElement = enableProxy(React.createElement, null);
`;

const jsxRuntime = `import {
  Fragment,
  jsx as originalJsx,
  jsxs as originalJsxs,
} from 'react/jsx-runtime';
import {enableProxy} from './setup-sequence-stack-traces';

export {Fragment};
export const jsx = enableProxy(originalJsx, null);
export const jsxs = enableProxy(originalJsxs, null);
`;

const jsxDevRuntime = `import {
  Fragment,
  jsxDEV as originalJsxDev,
} from 'react/jsx-dev-runtime';
import {enableProxy} from './setup-sequence-stack-traces';

export {Fragment};
export const jsxDEV = enableProxy(originalJsxDev, 4);
`;

const reactShim = `import * as React from 'react';

if (typeof globalThis === 'undefined') {
  window.React = React;
} else {
  globalThis.React = React;
}
`;

const browserRequireShim = `import * as Remotion from 'remotion';
import * as RemotionNoReact from 'remotion/no-react';

const modules = {
  remotion: Remotion,
  'remotion/no-react': RemotionNoReact,
};

globalThis.require = (id) => {
  const module = modules[id];
  if (!module) {
    throw new Error('Unsupported Browser Studio require: ' + id);
  }

  return module;
};
`;

const studioBootstrap = `if (!globalThis.remotion_browserStudioVendor) {
  throw new Error('Browser Studio vendor bundle was not loaded');
}

globalThis.remotion_browserStudioProjectHot = {
  addStatusHandler: (callback) => module.hot.addStatusHandler(callback),
  apply: (options) => module.hot.apply(options),
  check: (autoApply) => module.hot.check(autoApply),
  getHash: () => __webpack_hash__,
  status: () => module.hot.status(),
};

globalThis.remotion_browserStudioVendor.initializeStudioPreview();
`;

const studioPreviewEntry = `
void globalThis.remotion_browserStudioVendor.startStudio();
`;

export const getBrowserStudioVirtualFiles = (): Record<string, string> => {
	const reactRefreshFiles = getBrowserReactRefreshVirtualFiles({
		entry: browserStudioVirtualFilePaths.reactRefreshEntry,
		runtime: browserStudioVirtualFilePaths.reactRefreshRuntime,
		utils: browserStudioVirtualFilePaths.reactRefreshUtils,
	});

	return {
		...reactRefreshFiles,
		[browserStudioVirtualFilePaths.browserRequireShim]: browserRequireShim,
		[browserStudioVirtualFilePaths.reactRefreshEntry]: `${reactRefreshFiles[browserStudioVirtualFilePaths.reactRefreshEntry]}\n${notifyOnRefresh}`,
		[browserStudioVirtualFilePaths.setupEnvironment]:
			getInjectedSetupEnvironment(),
		[browserStudioVirtualFilePaths.setupSequenceStackTraces]:
			setupSequenceStackTraces,
		[browserStudioVirtualFilePaths.studioPreviewEntry]: studioPreviewEntry,
		[browserStudioVirtualFilePaths.studioBootstrap]: studioBootstrap,
		[browserStudioVirtualFilePaths.jsxRuntime]: jsxRuntime,
		[browserStudioVirtualFilePaths.jsxDevRuntime]: jsxDevRuntime,
		[browserStudioVirtualFilePaths.reactShim]: reactShim,
	};
};
