import type React from 'react';

let Root: React.FC | null = null;

let listeners: ((comp: React.FC) => void)[] = [];

export const registerRoot = (comp: React.FC) => {
	if (Root) {
		throw new Error('registerRoot() was called more than once.');
	}

	Root = comp;
	listeners.forEach((l) => {
		l(comp);
	});
};

export const getRoot = () => {
	return Root;
};

export const waitForRoot = (fn: (comp: React.FC) => void): (() => void) => {
	if (Root) {
		fn(Root);
		return () => undefined;
	}

	listeners.push(fn);

	return () => {
		listeners = listeners.filter((l) => l !== fn);
	};
};
