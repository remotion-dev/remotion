import type React from 'react';
import type JsxRuntimeDev from 'react/jsx-dev-runtime';
import type JsxRuntime from 'react/jsx-runtime';
import {
	getComponentsToAddStacksTo,
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
				const stack =
					existingStack ||
					(source &&
					typeof source.fileName === 'string' &&
					typeof source.lineNumber === 'number' &&
					typeof source.columnNumber === 'number'
						? makeOriginalSourceStack({
								fileName: getSourceFileName(source.fileName),
								lineNumber: source.lineNumber,
								columnNumber: source.columnNumber,
							})
						: new Error().stack);
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
