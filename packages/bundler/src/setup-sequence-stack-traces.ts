import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const originalJsxs = JsxRuntime.jsxs;
const originalJsxDev = JsxRuntimeDev.jsxDEV;

const enableProxy = <
	T extends
		| typeof React.createElement
		| typeof JsxRuntime.jsx
		| typeof JsxRuntimeDev.jsxDEV,
>(
	api: T,
): T => {
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
