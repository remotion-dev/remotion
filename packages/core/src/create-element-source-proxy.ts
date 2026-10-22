import type React from 'react';
import type JsxRuntimeDev from 'react/jsx-dev-runtime';
import type JsxRuntime from 'react/jsx-runtime';
import {
	getComponentsToAddStacksTo,
	getSequenceComponent,
	getStackForControls,
	makeOriginalSourceStack,
	REMOTION_INTERNAL_STACK_PROP,
} from './enable-sequence-stack-traces.js';

const componentsToAddStacksTo = getComponentsToAddStacksTo();
const internalStackProp = REMOTION_INTERNAL_STACK_PROP;

export const createElementSourceProxy = <
	T extends
		| typeof React.createElement
		| typeof JsxRuntime.jsx
		| typeof JsxRuntimeDev.jsxDEV,
>(
	api: T,
	sourceArgumentIndex: number | null,
	getSourceFileName: (fileName: string) => string,
): T => {
	return new Proxy(api, {
		apply(target, thisArg, argArray) {
			const component = argArray[0];
			if (componentsToAddStacksTo.includes(component)) {
				const [first, props, ...rest] = argArray;
				const source =
					sourceArgumentIndex === null ? null : argArray[sourceArgumentIndex];
				const existingStack = props?.[internalStackProp];
				// Internal wrappers already captured the authored location in their controls.
				const controlsStack =
					!existingStack &&
					component === getSequenceComponent() &&
					props?.controls
						? getStackForControls(props.controls)
						: null;
				let stack = existingStack || controlsStack;
				if (!stack) {
					if (
						source &&
						typeof source.fileName === 'string' &&
						typeof source.lineNumber === 'number' &&
						typeof source.columnNumber === 'number'
					) {
						stack = makeOriginalSourceStack({
							fileName: getSourceFileName(source.fileName),
							lineNumber: source.lineNumber,
							// JSX development locations are one-based, like stack traces.
							// Resolved source locations and AST lookups use zero-based columns.
							columnNumber: source.columnNumber - 1,
						});
					} else {
						// Avoid collecting the full Studio error stack just to discard it.
						// Restore the limit before formatting, which can invoke user code.
						const {stackTraceLimit} = Error;
						const canLimitStack =
							typeof stackTraceLimit === 'number' &&
							stackTraceLimit > 2 &&
							Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit')
								?.writable;
						let capturedError: Error;
						try {
							if (canLimitStack) {
								Error.stackTraceLimit = 2;
							}

							capturedError = new Error();
						} finally {
							if (canLimitStack) {
								Error.stackTraceLimit = stackTraceLimit;
							}
						}

						const capturedStack = capturedError.stack;
						// Keep the proxy and JSX call site, including its generated URL for
						// Fast Refresh. Later React scheduler frames vary between renders.
						// V8 adds an Error header; Firefox and Safari start with a frame.
						if (capturedStack) {
							const firstFrameEnd = capturedStack.indexOf(
								'\n',
								capturedStack.startsWith('Error\n') ? 6 : 0,
							);
							const callerEnd =
								firstFrameEnd === -1
									? -1
									: capturedStack.indexOf('\n', firstFrameEnd + 1);
							stack =
								callerEnd === -1
									? capturedStack
									: capturedStack.slice(0, callerEnd);
						} else {
							stack = capturedStack;
						}
					}
				}

				const newProps = existingStack
					? {...props}
					: {
							...(props ?? {}),
							[internalStackProp]: stack,
						};

				return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
			}

			return Reflect.apply(target, thisArg, argArray);
		},
	});
};
