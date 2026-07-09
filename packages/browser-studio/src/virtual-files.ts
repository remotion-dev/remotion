export const browserStudioVirtualFilePaths = {
	setupEnvironment: '/__remotion_browser_studio__/setup-environment.ts',
	setupSequenceStackTraces:
		'/__remotion_browser_studio__/setup-sequence-stack-traces.ts',
	reactShim: '/__remotion_browser_studio__/react-shim.js',
};

declare const __BROWSER_STUDIO_SETUP_ENVIRONMENT__: string | undefined;

const getInjectedSetupEnvironment = () => {
	if (typeof __BROWSER_STUDIO_SETUP_ENVIRONMENT__ === 'undefined') {
		throw new Error('Browser Studio setup environment was not injected');
	}

	return __BROWSER_STUDIO_SETUP_ENVIRONMENT__;
};

const setupSequenceStackTraces = `import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const originalJsxs = JsxRuntime.jsxs;
const originalJsxDev = JsxRuntimeDev.jsxDEV;

const enableProxy = (api) => {
  return new Proxy(api, {
    apply(target, thisArg, argArray) {
      if (componentsToAddStacksTo.includes(argArray[0])) {
        const [first, props, ...rest] = argArray;
        const newProps = props?.stack
          ? props
          : {
              ...(props ?? {}),
              stack: new Error().stack,
            };

        return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
      }

      return Reflect.apply(target, thisArg, argArray);
    },
  });
};

React.createElement = enableProxy(originalCreateElement);
JsxRuntime.jsx = enableProxy(originalJsx);
JsxRuntime.jsxs = enableProxy(originalJsxs);
JsxRuntimeDev.jsxDEV = enableProxy(originalJsxDev);
`;

const reactShim = `import * as React from 'react';

if (typeof globalThis === 'undefined') {
  window.React = React;
} else {
  globalThis.React = React;
}
`;

export const getBrowserStudioVirtualFiles = (): Record<string, string> => ({
	[browserStudioVirtualFilePaths.setupEnvironment]:
		getInjectedSetupEnvironment(),
	[browserStudioVirtualFilePaths.setupSequenceStackTraces]:
		setupSequenceStackTraces,
	[browserStudioVirtualFilePaths.reactShim]: reactShim,
});
