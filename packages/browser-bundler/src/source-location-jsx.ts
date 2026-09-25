import type * as React from 'react';
import type * as JSXDevRuntime from 'react/jsx-dev-runtime';
import type * as JSXRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

type JsxFactory =
	| typeof React.createElement
	| typeof JSXRuntime.jsx
	| typeof JSXDevRuntime.jsxDEV;

type JsxSource = {
	fileName?: unknown;
	lineNumber?: unknown;
	columnNumber?: unknown;
};

// Mirrors the Studio bundler: Remotion components receive the source
// location of their JSX element so mounted sequences can be traced back to
// their source node. The development JSX transform passes the location as
// the fifth argument of jsxDEV(); other factories fall back to a stack trace.
const withSourceLocation = <T extends JsxFactory>(
	factory: T,
	{
		isCreateElement,
		sourceArgumentIndex,
	}: {
		isCreateElement: boolean;
		sourceArgumentIndex: number | null;
	},
): T => {
	const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();
	const sequenceComponent = Internals.getSequenceComponent();
	const internalStackProp = Internals.REMOTION_INTERNAL_STACK_PROP;

	return new Proxy(factory, {
		apply(target, thisArg, argArray) {
			const [component, props, ...rest] = argArray as [
				unknown,
				Record<string, unknown> | null | undefined,
				...unknown[],
			];
			if (!componentsToAddStacksTo.includes(component)) {
				return Reflect.apply(target, thisArg, argArray);
			}

			const source =
				sourceArgumentIndex === null
					? null
					: (argArray[sourceArgumentIndex] as JsxSource | null | undefined);
			const stack =
				source &&
				typeof source.fileName === 'string' &&
				typeof source.lineNumber === 'number' &&
				typeof source.columnNumber === 'number'
					? Internals.makeOriginalSourceStack({
							fileName: source.fileName,
							lineNumber: source.lineNumber,
							columnNumber: source.columnNumber,
						})
					: new Error().stack;
			const newProps: Record<string, unknown> = props?.[internalStackProp]
				? {...props}
				: {...(props ?? {}), [internalStackProp]: stack};
			if (component === sequenceComponent) {
				const children = isCreateElement
					? rest.length === 0
						? newProps.children
						: rest
					: newProps.children;
				newProps._remotionInternalSingleChildComponent =
					Internals.getSingleChildComponent(children as React.ReactNode);
			}

			return Reflect.apply(target, thisArg, [component, newProps, ...rest]);
		},
	});
};

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
			createElement: withSourceLocation(react.createElement, {
				isCreateElement: true,
				sourceArgumentIndex: null,
			}),
		}),
		jsxRuntime: withOverrides(jsxRuntime as unknown as ModuleRecord, {
			jsx: withSourceLocation(jsxRuntime.jsx, {
				isCreateElement: false,
				sourceArgumentIndex: null,
			}),
			jsxs: withSourceLocation(jsxRuntime.jsxs, {
				isCreateElement: false,
				sourceArgumentIndex: null,
			}),
		}),
		jsxDevRuntime: withOverrides(jsxDevRuntime as unknown as ModuleRecord, {
			jsxDEV: withSourceLocation(jsxDevRuntime.jsxDEV, {
				isCreateElement: false,
				sourceArgumentIndex: 4,
			}),
		}),
	};
};
