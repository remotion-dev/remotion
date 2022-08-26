// Copied from: https://github.com/rveciana/svg-path-properties

import {construct} from './helpers/construct';

export const getLength = (p: string) => {
	const constructucted = construct(p);
	return constructucted.length;
};
