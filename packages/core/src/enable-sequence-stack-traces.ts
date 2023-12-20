import React from 'react';
import {getRemotionEnvironment} from './get-remotion-environment';
import {Sequence} from './Sequence';

export const enableSequenceStackTraces = () => {
	if (!getRemotionEnvironment().isStudio) {
		return;
	}

	const proxy = new Proxy(React.createElement, {
		apply(target, thisArg, argArray) {
			if (argArray[0] === Sequence) {
				console.log('trapped', new Error().stack);
			}

			return Reflect.apply(target, thisArg, argArray);
		},
	});

	React.createElement = proxy;
};
