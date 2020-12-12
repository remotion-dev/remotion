import React from 'react';
import {TComposition} from './CompositionManager';
import {RemotionRoot} from './RemotionRoot';

let root: React.FC | null = null;
let shouldStaticallyReturnCompositions = false;
const staticCompositions: TComposition[] = [];

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

export const addStaticComposition = (composition: TComposition) => {
	staticCompositions.push(composition);
};

export const getCompositionName = () => {
	const param = new URLSearchParams(window.location.search).get('composition');
	if (param !== null) {
		return String(param);
	}
	throw new Error('No comp name specified in URL');
};
