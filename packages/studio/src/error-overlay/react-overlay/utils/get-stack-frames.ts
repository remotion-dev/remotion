/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {SymbolicatedStackFrame} from '@remotion/studio-shared';
import {parseError} from './parser';
import {unmap} from './unmapper';

export const getStackFrames = async (
	error: Error,
	contextSize: number,
): Promise<SymbolicatedStackFrame[] | null> => {
	const parsedFrames = await parseError(error, contextSize);
	const enhancedFrames = await unmap(parsedFrames, contextSize);
	if (
		enhancedFrames
			.map((f) => f.originalFileName)
			.filter((f_1) => f_1 !== null && f_1 !== undefined).length === 0
	) {
		return null;
	}

	return enhancedFrames;
};
