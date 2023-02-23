// Copied from: https://github.com/rveciana/svg-path-properties

import {construct} from './helpers/construct';

/**
 * @description Gets the length of an SVG path. 
 * @param {string} path A valid SVG path
 * @see [Documentation](https://remotion.dev/docs/paths/get-length)
 */
export const getLength = (path: string) => {
	const constructucted = construct(path);
	return constructucted.length;
};
