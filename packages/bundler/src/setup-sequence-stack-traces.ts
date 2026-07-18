import React from 'react';
import JsxRuntimeDev from 'react/jsx-dev-runtime';
import JsxRuntime from 'react/jsx-runtime';
import {Internals} from 'remotion';

const componentsToAddStacksTo = Internals.getComponentsToAddStacksTo();
const sequenceComponent = Internals.getSequenceComponent();

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
	isCreateElement: boolean,
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
				const newProps = props?.stack
					? {...props}
					: {...(props ?? {}), stack: new Error().stack};
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

React.createElement = enableProxy(originalCreateElement, true);
JsxRuntime.jsx = enableProxy(originalJsx, false);
JsxRuntime.jsxs = enableProxy(originalJsxs, false);
JsxRuntimeDev.jsxDEV = enableProxy(originalJsxDev, false);
