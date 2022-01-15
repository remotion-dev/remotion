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
import {unmap} from './unmapper';
import {getLocationFromBuildError} from '../effects/map-error-to-react-stack';
import {resolveFileSource} from '../effects/resolve-file-source';

type UnmappedError = Error & {
	__unmap_source?: string | undefined;
};

const getEnhancedFrames = async (
	error: UnmappedError,
	parsedFrames: StackFrame[],
	contextSize: number
): Promise<{
	frames: StackFrame[];
	type: 'exception' | 'syntax';
}> => {
	if (error.__unmap_source) {
		return {
			frames: await unmap(error.__unmap_source, parsedFrames, contextSize),
			type: 'exception',
		};
	}

	const location = getLocationFromBuildError(error);
	if (location === null) {
		return {frames: [], type: 'exception'};
	}

	const frames = await resolveFileSource(location, contextSize);

	return {frames: [frames], type: 'syntax'};
};

async function getStackFrames(
	error: UnmappedError,
	contextSize = 3
): Promise<{frames: StackFrame[] | null; type: 'exception' | 'syntax'}> {
	const parsedFrames = parse(error);
	const {frames: enhancedFrames, type} = await getEnhancedFrames(
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
		return {type, frames: null};
	}

	return {
		type,
		frames: enhancedFrames.filter(
			({functionName}) =>
				functionName === null ||
				functionName === undefined ||
				functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
		),
	};
}

export default getStackFrames;
export {getStackFrames};
