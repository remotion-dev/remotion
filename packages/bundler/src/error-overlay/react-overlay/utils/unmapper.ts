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

import {getLinesAround} from './get-lines-around';
import {getSourceMap} from './get-source-map';
import {pathNormalize} from './path';
import {StackFrame} from './stack-frame';

function count(search: string, string: string): number {
	// Count starts at -1 because a do-while loop always runs at least once
	let _count = -1;
	let index = -1;
	do {
		// First call or the while case evaluated true, meaning we have to make
		// count 0 or we found a character
		++_count;
		// Find the index of our search string, starting after the previous index
		index = string.indexOf(search, index + 1);
	} while (index !== -1);

	return _count;
}

/**
 * Turns a set of mapped <code>StackFrame</code>s back into their generated code position and enhances them with code.
 * @param {string} fileUri The URI of the <code>bundle.js</code> file.
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which are already mapped and missing their generated positions.
 * @param {number} [fileContents=3] The number of lines to provide before and after the line specified in the <code>StackFrame</code>.
 */
async function unmap(
	_fileUri: string | {uri: string; contents: string},
	frames: StackFrame[],
	contextLines: number
): Promise<StackFrame[]> {
	let fileContents = typeof _fileUri === 'object' ? _fileUri.contents : null;
	const fileUri = typeof _fileUri === 'object' ? _fileUri.uri : _fileUri;
	if (fileContents == null) {
		fileContents = await fetch(fileUri).then((res) => res.text());
	}

	const map = await getSourceMap(fileUri, fileContents as string);
	return frames.map((frame) => {
		const {functionName, lineNumber, columnNumber, _originalLineNumber} = frame;
		if (_originalLineNumber != null) {
			return frame;
		}

		let {fileName} = frame;
		if (fileName) {
			// The web version of this module only provides POSIX support, so Windows
			// paths like C:\foo\\baz\..\\bar\ cannot be normalized.
			// A simple solution to this is to replace all `\` with `/`, then
			// normalize afterwards.
			fileName = pathNormalize(fileName.replace(/[\\]+/g, '/'));
		}

		if (fileName == null) {
			return frame;
		}

		const fN: string = fileName;
		const source = map
			.getSources()
			// Prepare path for normalization; see comment above for reasoning.
			.map((s) => s.replace(/[\\]+/g, '/'))
			.filter((p) => {
				p = pathNormalize(p);
				const i = p.lastIndexOf(fN);
				return i !== -1 && i === p.length - fN.length;
			})
			.map((p) => ({
				token: p,
				seps: count('/', pathNormalize(p)),
				penalties: count('node_modules', p) + count('~', p),
			}))
			.sort((a, b) => {
				const s = Math.sign(a.seps - b.seps);
				if (s !== 0) {
					return s;
				}

				return Math.sign(a.penalties - b.penalties);
			});
		if (source.length < 1 || lineNumber == null) {
			return new StackFrame(
				null,
				null,
				null,
				null,
				null,
				functionName,
				fN,
				lineNumber,
				columnNumber,
				null
			);
		}

		const sourceT = source[0].token;
		const {line, column} = map.getGeneratedPosition(
			sourceT,
			lineNumber,
			columnNumber as number
		);
		const originalSource = map.getSource(sourceT);
		return new StackFrame(
			functionName,
			fileUri,
			line,
			column || null,
			getLinesAround(line, contextLines, fileContents || []),
			functionName,
			fN,
			lineNumber,
			columnNumber,
			getLinesAround(lineNumber, contextLines, originalSource)
		);
	});
}

export {unmap};
