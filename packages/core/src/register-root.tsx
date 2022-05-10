import React from 'react';

let root: React.FC | null = null;

export const registerRoot = (comp: React.FC) => {
	if (root) {
		throw new Error('registerRoot() was called more than once.');
	}

	root = comp;
};

export const getRoot = () => {
	return root;
};
