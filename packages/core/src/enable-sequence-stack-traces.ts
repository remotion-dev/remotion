import React from 'react';
import {getRemotionEnvironment} from './get-remotion-environment';

const originalCreateElement = React.createElement;
const componentsToAddStacksTo: unknown[] = [];

// Gets called when a new component is added,
// also when the Studio is mounted
export const enableSequenceStackTraces = () => {
	if (!getRemotionEnvironment().isStudio) {
		return;
	}

	const proxy = new Proxy(originalCreateElement, {
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

	React.createElement = proxy;
};

export const addSequenceStackTraces = (component: unknown) => {
	componentsToAddStacksTo.push(component);
	enableSequenceStackTraces();
};
