import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();
const sequenceComponent = Internals.getSequenceComponent();
const internalStackProp = Internals.REMOTION_INTERNAL_STACK_PROP;
const studioOriginalSourcePrefix = 'studio-original://';

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const originalJsxs = JsxRuntime.jsxs;
const originalJsxDev = JsxRuntimeDev.jsxDEV;

const getSourceFileName = (fileName: string) => {
	if (typeof window === 'undefined' || !window.remotion_cwd) {
		return fileName;
	}

	const normalizedFileName = fileName.replaceAll('\\', '/');
	const normalizedRoot = window.remotion_cwd
		.replaceAll('\\', '/')
		.replace(/\/+$/, '');
	const shouldCompareCaseInsensitive =
		/^[a-z]:\//i.test(normalizedFileName) || /^[a-z]:\//i.test(normalizedRoot);
	const comparableFileName = shouldCompareCaseInsensitive
		? normalizedFileName.toLowerCase()
		: normalizedFileName;
	const comparableRoot = shouldCompareCaseInsensitive
		? normalizedRoot.toLowerCase()
		: normalizedRoot;

	if (!comparableFileName.startsWith(`${comparableRoot}/`)) {
		return normalizedFileName;
	}

	return `./${normalizedFileName.slice(normalizedRoot.length + 1)}`;
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
			const component = argArray[0];
			if (componentsToAddStacksTo.includes(component)) {
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
						? `Error\n    at remotionOriginalSource (${studioOriginalSourcePrefix}${encodeURIComponent(getSourceFileName(source.fileName))}:${source.lineNumber}:${source.columnNumber})`
						: new Error().stack;
				const newProps = props?.[internalStackProp]
					? {...props}
					: {
							...(props ?? {}),
							[internalStackProp]: stack,
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

// Renderer pages set this value before the bundle loads. Avoid proxying every
// JSX call while rendering; production stack traces are only needed by Studio.
const shouldEnableStackTraces =
	process.env.NODE_ENV !== 'production' ||
	(typeof window !== 'undefined' &&
		typeof window.remotion_puppeteerTimeout === 'undefined');

if (shouldEnableStackTraces) {
	React.createElement = enableProxy(originalCreateElement, true, null);
	JsxRuntime.jsx = enableProxy(originalJsx, false, null);
	JsxRuntime.jsxs = enableProxy(originalJsxs, false, null);
	if (originalJsxDev) {
		JsxRuntimeDev.jsxDEV = enableProxy(originalJsxDev, false, 4);
	}
}
