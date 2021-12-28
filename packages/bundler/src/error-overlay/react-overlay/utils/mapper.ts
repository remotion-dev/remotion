/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {StackFrame} from './stack-frame';
import {getSourceMap, SourceMap} from './get-source-map';
import {getLinesAround} from './get-lines-around';
import {settle} from './settle-promise';

/**
 * Enhances a set of <code>StackFrame</code>s with their original positions and code (when available).
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which contain (generated) code positions.
 * @param {number} [contextLines=3] The number of lines to provide before and after the line specified in the <code>StackFrame</code>.
 */
async function map(
	frames: StackFrame[],
	contextLines = 3
): Promise<StackFrame[]> {
	const cache: {[key: string]: {fileSource: string; map: SourceMap}} = {};
	const files: string[] = [];
	frames.forEach((frame) => {
		const {fileName} = frame;
		if (fileName === null || fileName === undefined) {
			return;
		}

		if (files.indexOf(fileName) !== -1) {
			return;
		}

		files.push(fileName);
	});
	await settle(
		files.map(async (fileName) => {
			const fetchUrl =
				fileName.indexOf('webpack-internal:') === 0
					? `/__get-internal-source?fileName=${encodeURIComponent(fileName)}`
					: fileName;

			const fileSource = await fetch(fetchUrl).then((r) => r.text());
			const _map = await getSourceMap(fileName, fileSource);
			cache[fileName] = {fileSource, map: _map};
		})
	);
	return frames.map((frame) => {
		const {functionName, fileName, lineNumber, columnNumber} = frame;
		const {map: _map, fileSource} = cache[fileName as string] || {};
		if (
			_map === null ||
			_map === undefined ||
			columnNumber === null ||
			columnNumber === undefined ||
			lineNumber === null ||
			lineNumber === undefined
		) {
			return frame;
		}

		const {source, line, column} = _map.getOriginalPosition(
			lineNumber,
			columnNumber
		);
		const originalSource =
			source === null || source === undefined ? [] : _map.getSource(source);
		return new StackFrame(
			functionName,
			fileName,
			lineNumber,
			columnNumber,
			getLinesAround(lineNumber, contextLines, fileSource),
			functionName,
			source,
			line,
			column,
			getLinesAround(line, contextLines, originalSource)
		);
	});
}

export {map};
export default map;
