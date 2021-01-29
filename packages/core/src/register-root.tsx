import React from 'react';
import {TCompMetadata, TComposition} from './CompositionManager';
import {RemotionRoot} from './RemotionRoot';

let root: React.FC | null = null;
let shouldStaticallyReturnCompositions = true;
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

export const evaluateRootForCompositions = async (): Promise<
	TComposition[]
> => {
	shouldStaticallyReturnCompositions = true;
	const Root = getRoot();
	if (!Root) {
		throw new Error('There is no root');
	}
	const {renderToStaticMarkup} = await import('react-dom/server');
	const markup = (
		<RemotionRoot>
			<Root />
		</RemotionRoot>
	);
	renderToStaticMarkup(markup);
	return staticCompositions;
};

export const getShouldStaticallyReturnCompositions = () =>
	shouldStaticallyReturnCompositions;

export const addStaticComposition = <T,>(composition: TComposition<T>) => {
	staticCompositions = [...staticCompositions, composition];
};

export const removeStaticComposition = (id: string) => {
	staticCompositions = staticCompositions.filter((s) => {
		return s.id !== id;
	});
};

export const getCompositionName = () => {
	const param = new URLSearchParams(window.location.search).get('composition');
	if (param !== null) {
		return String(param);
	}
	throw new Error('No comp name specified in URL');
};

export const getIsEvaluation = () => {
	const param = new URLSearchParams(window.location.search).get('evaluation');
	return param !== null;
};

if (typeof window !== 'undefined') {
	window.getStaticCompositions = (): TCompMetadata[] =>
		staticCompositions.map((c) => {
			return {
				durationInFrames: c.durationInFrames,
				fps: c.fps,
				height: c.height,
				id: c.id,
				width: c.width,
			};
		});
}
