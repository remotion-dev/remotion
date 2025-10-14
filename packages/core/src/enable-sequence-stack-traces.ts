import React from 'react';
import JsxRuntime from 'react/jsx-runtime';
import {getRemotionEnvironment} from './get-remotion-environment';

const originalCreateElement = React.createElement;
const originalJsx = JsxRuntime.jsx;
const componentsToAddStacksTo: unknown[] = [];

const enableProxy = <
	T extends typeof React.createElement | typeof JsxRuntime.jsx,
>(
	api: T,
): T => {
	return new Proxy(api, {
		apply(target, thisArg, argArray) {
			if (componentsToAddStacksTo.includes(argArray[0])) {
				const [first, props, ...rest] = argArray;
				const newProps = {
					...(props ?? {}),
					stack: new Error().stack,
				};

				return Reflect.apply(target, thisArg, [first, newProps, ...rest]);
			}

			return Reflect.apply(target, thisArg, argArray);
		},
	});
};

// Gets called when a new component is added,
// also when the Studio is mounted
export const enableSequenceStackTraces = () => {
	if (!getRemotionEnvironment().isStudio) {
		return;
	}

	React.createElement = enableProxy(originalCreateElement);
	JsxRuntime.jsx = enableProxy(originalJsx);
};

export const addSequenceStackTraces = (component: unknown) => {
	componentsToAddStacksTo.push(component);
	enableSequenceStackTraces();
};
