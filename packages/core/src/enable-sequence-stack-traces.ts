import React from 'react';
import {getRemotionEnvironment} from './get-remotion-environment';

export const enableSequenceStackTraces = (component: unknown) => {
	if (!getRemotionEnvironment().isStudio) {
		return;
	}

	const proxy = new Proxy(React.createElement, {
		apply(target, thisArg, argArray) {
			if (argArray[0] === component) {
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
