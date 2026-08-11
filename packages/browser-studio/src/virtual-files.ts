export const browserStudioVirtualFilePaths = {
	browserRequireShim: '/__remotion_browser_studio__/browser-require-shim.js',
	reactRefreshEntry: '/__remotion_browser_studio__/react-refresh-entry.js',
	reactRefreshRuntime: '/__remotion_browser_studio__/reactRefresh.js',
	reactRefreshUtils: '/__remotion_browser_studio__/refreshUtils.js',
	setupEnvironment: '/__remotion_browser_studio__/setup-environment.ts',
	setupSequenceStackTraces:
		'/__remotion_browser_studio__/setup-sequence-stack-traces.ts',
	jsxRuntime: '/__remotion_browser_studio__/jsx-runtime.ts',
	jsxDevRuntime: '/__remotion_browser_studio__/jsx-dev-runtime.ts',
	jsxImportSource: '/__remotion_browser_studio__',
	reactShim: '/__remotion_browser_studio__/react-shim.js',
};

declare const __BROWSER_STUDIO_SETUP_ENVIRONMENT__: string | undefined;
declare const __BROWSER_STUDIO_REACT_REFRESH_FILES__:
	| {
			entry: string;
			runtime: string;
			utils: string;
	  }
	| undefined;

const getInjectedSetupEnvironment = () => {
	if (typeof __BROWSER_STUDIO_SETUP_ENVIRONMENT__ === 'undefined') {
		throw new Error('Browser Studio setup environment was not injected');
	}

	return __BROWSER_STUDIO_SETUP_ENVIRONMENT__;
};

const getInjectedReactRefreshFiles = () => {
	if (typeof __BROWSER_STUDIO_REACT_REFRESH_FILES__ === 'undefined') {
		throw new Error('Browser Studio React Refresh files were not injected');
	}

	return __BROWSER_STUDIO_REACT_REFRESH_FILES__;
};

const setupSequenceStackTraces = `import React from 'react';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();
const sequenceComponent = Internals.getSequenceComponent();
const internalStackProp = Internals.REMOTION_INTERNAL_STACK_PROP;
const browserStudioOriginalSourcePrefix = 'browser-studio-original://';

const originalCreateElement = React.createElement;

export const enableProxy = (api, isCreateElement, sourceArgumentIndex) => {
  return new Proxy(api, {
    apply(target, thisArg, argArray) {
      if (componentsToAddStacksTo.includes(argArray[0])) {
        const [first, props, ...rest] = argArray;
        const children = isCreateElement
          ? rest.length === 0
            ? props?.children
            : rest
          : props?.children;
        const source =
          sourceArgumentIndex === null ? null : argArray[sourceArgumentIndex];
        const stack =
          source &&
          typeof source.fileName === 'string' &&
          typeof source.lineNumber === 'number' &&
          typeof source.columnNumber === 'number'
            ? 'Error\\n    at browserStudioOriginal (' +
              browserStudioOriginalSourcePrefix +
              encodeURIComponent(source.fileName) +
              ':' +
              source.lineNumber +
              ':' +
              source.columnNumber +
              ')'
            : new Error().stack;
        const newProps = props?.[internalStackProp]
          ? {...props}
          : {...(props ?? {}), [internalStackProp]: stack};
        if (first === sequenceComponent) {
          newProps._remotionInternalSingleChildComponent =
            Internals.getSingleChildComponent(children);
        }

        return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
      }

      return Reflect.apply(target, thisArg, argArray);
    },
  });
};

React.createElement = enableProxy(originalCreateElement, true, null);
`;

const jsxRuntime = `import {
  Fragment,
  jsx as originalJsx,
  jsxs as originalJsxs,
} from 'react/jsx-runtime';
import {enableProxy} from './setup-sequence-stack-traces';

export {Fragment};
export const jsx = enableProxy(originalJsx, false, null);
export const jsxs = enableProxy(originalJsxs, false, null);
`;

const jsxDevRuntime = `import {
  Fragment,
  jsxDEV as originalJsxDev,
} from 'react/jsx-dev-runtime';
import {enableProxy} from './setup-sequence-stack-traces';

export {Fragment};
export const jsxDEV = enableProxy(originalJsxDev, false, 4);
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

export const getBrowserStudioVirtualFiles = (): Record<string, string> => {
	const reactRefreshFiles = getInjectedReactRefreshFiles();

	return {
		[browserStudioVirtualFilePaths.browserRequireShim]: browserRequireShim,
		[browserStudioVirtualFilePaths.reactRefreshEntry]: reactRefreshFiles.entry,
		[browserStudioVirtualFilePaths.reactRefreshRuntime]:
			reactRefreshFiles.runtime,
		[browserStudioVirtualFilePaths.reactRefreshUtils]: reactRefreshFiles.utils,
		[browserStudioVirtualFilePaths.setupEnvironment]:
			getInjectedSetupEnvironment(),
		[browserStudioVirtualFilePaths.setupSequenceStackTraces]:
			setupSequenceStackTraces,
		[browserStudioVirtualFilePaths.jsxRuntime]: jsxRuntime,
		[browserStudioVirtualFilePaths.jsxDevRuntime]: jsxDevRuntime,
		[browserStudioVirtualFilePaths.reactShim]: reactShim,
	};
};
