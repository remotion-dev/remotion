/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {ScriptLine} from '@remotion/studio-shared';

/**
 *
 * @param {number} line The line number to provide context around.
 * @param {number} count The number of lines you'd like for context.
 * @param {string[] | string} lines The source code.
 */
export function getLinesAround(
	line: number,
	count: number,
	lines: string[],
): ScriptLine[] {
	const result: ScriptLine[] = [];
	for (
		let index = Math.max(0, line - 1 - count);
		index <= Math.min(lines.length - 1, line - 1 + count);
		++index
	) {
		result.push({
			lineNumber: index + 1,
			content: lines[index],
			highlight: index === line - 1,
		});
	}

	return result;
}
