// Copied from: https://github.com/rveciana/svg-path-properties

import {construct} from './helpers/construct';

/*
 * @description Gets the length of an SVG path.
 * @see [Documentation](https://www.remotion.dev/docs/paths/get-length)
 */
export const getLength = (path: string) => {
	const constructucted = construct(path);
	return constructucted.totalLength;
};
