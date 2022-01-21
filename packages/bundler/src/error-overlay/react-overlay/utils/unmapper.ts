/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/* eslint-disable eqeqeq */
/* eslint-disable no-eq-null */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Internals} from 'remotion';
import {getLinesAround} from './get-lines-around';
import {getSourceMap, SourceMap} from './get-source-map';
import {makeStackFrame, StackFrame} from './stack-frame';

const getFileContents = async (fileName: string) => {
	const res = await fetch(fileName as string);
	const fileContents = await res.text();

	return fileContents;
};

export const unmap = async (
	frames: StackFrame[],
	contextLines: number
): Promise<StackFrame[]> => {
	const uniqueFileNames = frames
		.map((f) => f.fileName)
		.filter(Internals.truthy);
	const maps = await Promise.all(
		uniqueFileNames.map(async (fileName) => {
			const fileContents = await getFileContents(fileName);
			return getSourceMap(fileName as string, fileContents as string);
		})
	);
	const mapValues: Record<string, SourceMap> = {};
	for (let i = 0; i < uniqueFileNames.length; i++) {
		mapValues[uniqueFileNames[i]] = maps[i];
	}

	return frames.map((frame) => {
		const map = mapValues[frame.fileName as string];
		const pos = map.getOriginalPosition(
			frame.lineNumber as number,
			frame.columnNumber as number
		);

		const {functionName, lineNumber, columnNumber, fileName} = frame;
		const scriptCode = getLinesAround(
			pos.line,
			contextLines,
			map.getSource(pos.source).split('\n')
		);

		return makeStackFrame({
			functionName,
			fileName,
			lineNumber,
			columnNumber,
			scriptCode,
			originalFunctionName: functionName,
			originalFileName: pos.source,
			originalLineNumber: pos.line,
			originalColumnNumber: pos.column,
			originalScriptCode: scriptCode,
		});
	});
};
