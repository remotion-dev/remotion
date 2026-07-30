import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();
const sequenceComponent = Internals.getSequenceComponent();
const internalStackProp = Internals.REMOTION_INTERNAL_STACK_PROP;

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const originalJsxs = JsxRuntime.jsxs;
const originalJsxDev = JsxRuntimeDev.jsxDEV;
const originalSourcePrefix = 'browser-studio-original://';

const getStack = (source: unknown): string | undefined => {
	if (!source || typeof source !== 'object') {
		return new Error().stack;
	}

	const {
		fileName,
		lineNumber,
		columnNumber,
	}: {
		fileName?: unknown;
		lineNumber?: unknown;
		columnNumber?: unknown;
	} = source;

	if (
		typeof fileName !== 'string' ||
		typeof lineNumber !== 'number' ||
		typeof columnNumber !== 'number'
	) {
		return new Error().stack;
	}

	const normalizedFileName = fileName.replaceAll('\\', '/');
	const normalizedRoot = window.remotion_cwd
		.replaceAll('\\', '/')
		.replace(/\/$/, '');
	const caseInsensitive = window.remotion_fileSystemPlatform === 'win32';
	const comparableFileName = caseInsensitive
		? normalizedFileName.toLowerCase()
		: normalizedFileName;
	const comparableRoot = caseInsensitive
		? normalizedRoot.toLowerCase()
		: normalizedRoot;
	const sourceFileName = comparableFileName.startsWith(`${comparableRoot}/`)
		? `./${normalizedFileName.slice(normalizedRoot.length + 1)}`
		: normalizedFileName;

	return `Error\n    at originalSource (${originalSourcePrefix}${encodeURIComponent(sourceFileName)}:${lineNumber}:${columnNumber})`;
};

const enableProxy = <
	T extends
		| typeof React.createElement
		| typeof JsxRuntime.jsx
		| typeof JsxRuntimeDev.jsxDEV,
>(
	api: T,
	isCreateElement: boolean,
	sourceArgumentIndex: number | null,
): T => {
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
				const newProps = props?.[internalStackProp]
					? {...props}
					: {
							...(props ?? {}),
							[internalStackProp]: getStack(source),
						};
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
JsxRuntime.jsx = enableProxy(originalJsx, false, null);
JsxRuntime.jsxs = enableProxy(originalJsxs, false, null);
JsxRuntimeDev.jsxDEV = enableProxy(originalJsxDev, false, 4);
