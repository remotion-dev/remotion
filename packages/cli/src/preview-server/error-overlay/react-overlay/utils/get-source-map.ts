/*
	Source code adapted from https://github.com/facebook/create-react-app/tree/main/packages/react-error-overlay and refactored in Typescript. This file is MIT-licensed.
*/

/* eslint-disable no-eq-null */
/* eslint-disable eqeqeq */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {RawSourceMap} from 'source-map';
import {SourceMapConsumer} from 'source-map';

export const getOriginalPosition = (
	source_map: SourceMapConsumer,
	line: number,
	column: number
): {source: string | null; line: number | null; column: number | null} => {
	const result = source_map.originalPositionFor({
		line,
		column,
	});
	return {line: result.line, column: result.column, source: result.source};
};

function extractSourceMapUrl(fileContents: string): string | null {
	const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
	let match = null;
	for (;;) {
		const next = regex.exec(fileContents);
		if (next == null) {
			break;
		}

		match = next;
	}

	if (!match?.[1]) {
		return null;
	}

	return match[1].toString();
}

// TODO: Can import this from BrowserSafeApis.getSourceMapRemotely
export async function getSourceMap(
	fileUri: string,
	fileContents: string
): Promise<SourceMapConsumer | null> {
	const sm = extractSourceMapUrl(fileContents);
	if (sm === null) {
		return null;
	}

	if (sm.indexOf('data:') === 0) {
		const base64 = /^data:application\/json;([\w=:"-]+;)*base64,/;
		const match2 = sm.match(base64);
		if (!match2) {
			throw new Error(
				'Sorry, non-base64 inline source-map encoding is not supported.'
			);
		}

		const converted = window.atob(sm.substring(match2[0].length));
		return new SourceMapConsumer(JSON.parse(converted) as RawSourceMap);
	}

	const index = fileUri.lastIndexOf('/');
	const url = fileUri.substring(0, index + 1) + sm;
	const obj = await fetch(url).then((res) => res.json());
	return new SourceMapConsumer(obj);
}
