/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {StackFrame} from './stack-frame';
import {parse} from './parser';
import {map} from './mapper';
import {unmap} from './unmapper';

type UnmappedError = Error & {
	__unmap_source?: string | undefined;
};

const getEnhancedFrames = (
	error: UnmappedError,
	parsedFrames: StackFrame[],
	contextSize: number
) => {
	if (error.__unmap_source) {
		return unmap(error.__unmap_source, parsedFrames, contextSize);
	}

	return map(parsedFrames, contextSize);
};

async function getStackFrames(
	error: UnmappedError,
	contextSize = 3
): Promise<StackFrame[] | null> {
	const parsedFrames = parse(error);

	const enhancedFrames = await getEnhancedFrames(
		error,
		parsedFrames,
		contextSize
	);
	if (
		enhancedFrames
			.map((f) => f._originalFileName)
			.filter(
				(f_1) =>
					f_1 !== null &&
					f_1 !== undefined &&
					f_1.indexOf('node_modules') === -1
			).length === 0
	) {
		return null;
	}

	return enhancedFrames.filter(
		({functionName}) =>
			functionName === null ||
			functionName === undefined ||
			functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
	);
}

export default getStackFrames;
export {getStackFrames};
