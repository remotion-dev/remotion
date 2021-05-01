import React from 'react';
import {TCompMetadata, TComposition} from './CompositionManager';

let root: React.FC | null = null;

// Ok to have components with various prop types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let staticCompositions: TComposition<any>[] = [];

export const registerRoot = (comp: React.FC) => {
	if (root) {
		throw new Error('registerRoot() was called more than once.');
	}

	root = comp;
};

export const getRoot = () => {
	return root;
};

export const addStaticComposition = <T, >(composition: TComposition<T>) => {
	staticCompositions = [...staticCompositions, composition];
};

export const removeStaticComposition = (id: string) => {
	staticCompositions = staticCompositions.filter(s => {
		return s.id !== id;
	});
};

// Is a plain index.html file with neither ?evalution nor ?composition URL.
// Useful for just setting localStorage values.
export const isPlainIndex = () => {
	return !getIsEvaluation() && getCompositionName() === null;
};

export const getCompositionName = () => {
	const param = new URLSearchParams(window.location.search).get('composition');
	if (param !== null) {
		return String(param);
	}

	return null;
};

export const getIsEvaluation = () => {
	const param = new URLSearchParams(window.location.search).get('evaluation');
	return param !== null;
};

if (typeof window !== 'undefined') {
	window.getStaticCompositions = (): TCompMetadata[] =>
		staticCompositions.map(c => {
			return {
				durationInFrames: c.durationInFrames,
				fps: c.fps,
				height: c.height,
				id: c.id,
				width: c.width,
			};
		});
}
