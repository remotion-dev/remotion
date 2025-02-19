/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
	SomeStackFrame,
	StackFrame,
	SymbolicatedStackFrame,
} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import type {SourceMapConsumer} from 'source-map';
import {getLinesAround} from './get-lines-around';
import {getOriginalPosition, getSourceMap} from './get-source-map';

export const getFileContents = async (fileName: string) => {
	const res = await fetch(fileName as string);
	const fileContents = await res.text();

	return fileContents;
};

export const unmap = async (
	frames: SomeStackFrame[],
	contextLines: number,
): Promise<SymbolicatedStackFrame[]> => {
	const transpiled = frames
		.filter((s) => s.type === 'transpiled')
		.map((s) => s.frame) as StackFrame[];
	const uniqueFileNames = [
		...new Set(transpiled.map((f) => f.fileName).filter(Internals.truthy)),
	];
	const maps = await Promise.all(
		uniqueFileNames.map(async (fileName) => {
			const fileContents = await getFileContents(fileName);
			return getSourceMap(fileName as string, fileContents as string);
		}),
	);
	const mapValues: Record<string, SourceMapConsumer | null> = {};
	for (let i = 0; i < uniqueFileNames.length; i++) {
		mapValues[uniqueFileNames[i]] = maps[i];
	}

	return frames
		.map((frame): SymbolicatedStackFrame | null => {
			if (frame.type === 'symbolicated') {
				return frame.frame;
			}

			const map = mapValues[frame.frame.fileName as string];
			if (!map) {
				return null;
			}

			const pos = getOriginalPosition(
				map,
				frame.frame.lineNumber as number,
				frame.frame.columnNumber as number,
			);
			const {functionName} = frame.frame;
			let hasSource: string | null = null;
			hasSource = pos.source ? map.sourceContentFor(pos.source, false) : null;

			const scriptCode =
				hasSource && pos.line
					? getLinesAround(pos.line, contextLines, hasSource.split('\n'))
					: null;

			return {
				originalColumnNumber: pos.column,
				originalFileName: pos.source,
				originalFunctionName: functionName,
				originalLineNumber: pos.line,
				originalScriptCode: scriptCode,
			};
		})
		.filter(Internals.truthy);
};
