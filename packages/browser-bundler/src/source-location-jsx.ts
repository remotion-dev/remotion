import type * as React from 'react';
import type * as JSXDevRuntime from 'react/jsx-dev-runtime';
import type * as JSXRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

type ModuleRecord = Record<string, unknown> & {default?: unknown};

// Shared module namespaces are frozen and may expose the CommonJS export as
// `default`. Copy them so both `import React` and `import * as React` see
// the wrapped factories without mutating the host's React.
const withOverrides = (
	module: ModuleRecord,
	overrides: Record<string, unknown>,
): ModuleRecord => {
	const wrapped: ModuleRecord = {...module, ...overrides};
	if (module.default !== null && typeof module.default === 'object') {
		wrapped.default = {...(module.default as ModuleRecord), ...overrides};
	}

	return wrapped;
};

export const addSourceLocationsToJsxModules = ({
	react,
	jsxRuntime,
	jsxDevRuntime,
}: {
	react: typeof React;
	jsxRuntime: typeof JSXRuntime;
	jsxDevRuntime: typeof JSXDevRuntime;
}) => {
	return {
		react: withOverrides(react as unknown as ModuleRecord, {
			createElement: Internals.createElementSourceProxy(
				react.createElement,
				null,
				(fileName) => fileName,
			),
		}),
		jsxRuntime: withOverrides(jsxRuntime as unknown as ModuleRecord, {
			jsx: Internals.createElementSourceProxy(
				jsxRuntime.jsx,
				null,
				(fileName) => fileName,
			),
			jsxs: Internals.createElementSourceProxy(
				jsxRuntime.jsxs,
				null,
				(fileName) => fileName,
			),
		}),
		jsxDevRuntime: withOverrides(jsxDevRuntime as unknown as ModuleRecord, {
			jsxDEV: Internals.createElementSourceProxy(
				jsxDevRuntime.jsxDEV,
				4,
				(fileName) => fileName,
			),
		}),
	};
};
