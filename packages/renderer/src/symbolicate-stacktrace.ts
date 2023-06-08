import {readFileSync} from 'fs';
import path from 'path';
import type {
	BasicSourceMapConsumer,
	IndexedSourceMapConsumer,
	RawSourceMap,
} from 'source-map';
import {SourceMapConsumer} from 'source-map';
import {readFile} from './assets/read-file';
import type {UnsymbolicatedStackFrame} from './parse-browser-error-stack';
import {truthy} from './truthy';

function extractSourceMapUrl(fileContents: string): string | null {
	const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm;
	let match = null;
	for (;;) {
		const next = regex.exec(fileContents);
		if (next === null || next === undefined) {
			break;
		}

		match = next;
	}

	if (!match?.[1]) {
		return null;
	}

	return match[1].toString();
}

const getSourceMap = async (
	filePath: string,
	fileContents: string,
	type: 'local' | 'remote'
) => {
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

	if (type === 'local') {
		// Find adjacent file: bundle.js -> bundle.js.map
		const newFilePath = path.join(path.dirname(filePath), sm);
		return new SourceMapConsumer(readFileSync(newFilePath, 'utf8'));
	}

	const index = filePath.lastIndexOf('/');
	const url = filePath.substring(0, index + 1) + sm;

	const obj = await fetchUrl(url);
	return new SourceMapConsumer(obj);
};

const fetchUrl = async (url: string) => {
	const res = await readFile(url);

	return new Promise<string>((resolve, reject) => {
		let downloaded = '';
		res.on('data', (d) => {
			downloaded += d;
		});
		res.on('end', () => {
			resolve(downloaded);
		});
		res.on('error', (err) => reject(err));
	});
};

type ScriptLine = {
	lineNumber: number;
	content: string;
	highlight: boolean;
};

export type SymbolicatedStackFrame = {
	originalFunctionName: string | null;
	originalFileName: string | null;
	originalLineNumber: number | null;
	originalColumnNumber: number | null;
	originalScriptCode: ScriptLine[] | null;
};

function getLinesAround(
	line: number,
	count: number,
	lines: string[]
): ScriptLine[] {
	const result: ScriptLine[] = [];
	for (
		let index = Math.max(0, line - 1 - count) + 1;
		index <= Math.min(lines.length - 1, line - 1 + count);
		++index
	) {
		result.push({
			lineNumber: index + 1,
			content: lines[index],
			highlight: index + 1 === line,
		});
	}

	return result;
}

const getOriginalPosition = (
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

export const symbolicateStackTraceFromRemoteFrames = async (
	frames: UnsymbolicatedStackFrame[]
): Promise<SymbolicatedStackFrame[]> => {
	const uniqueFileNames = [
		...new Set(
			frames
				.map((f) => f.fileName)
				.filter((f) => f.startsWith('http://') || f.startsWith('https://'))
				.filter(truthy)
		),
	];
	const maps = await Promise.all(
		uniqueFileNames.map((fileName) => {
			return getSourceMapFromRemoteFile(fileName);
		})
	);

	const mapValues: Record<string, SourceMapConsumer | null> = {};
	for (let i = 0; i < uniqueFileNames.length; i++) {
		mapValues[uniqueFileNames[i]] = maps[i];
	}

	return symbolicateFromSources(frames, mapValues);
};

export const symbolicateFromSources = (
	frames: UnsymbolicatedStackFrame[],
	mapValues: Record<string, SourceMapConsumer | null>
) => {
	return frames
		.map((frame): SymbolicatedStackFrame | null => {
			const map = mapValues[frame.fileName];
			if (!map) {
				return null;
			}

			return symbolicateStackFrame(frame, map);
		})
		.filter(truthy);
};

export const symbolicateStackFrame = (
	frame: UnsymbolicatedStackFrame,
	map: SourceMapConsumer
) => {
	const pos = getOriginalPosition(map, frame.lineNumber, frame.columnNumber);

	const hasSource = pos.source ? map.sourceContentFor(pos.source, false) : null;

	const scriptCode =
		hasSource && pos.line
			? getLinesAround(pos.line, 3, hasSource.split('\n'))
			: null;

	return {
		originalColumnNumber: pos.column,
		originalFileName: pos.source,
		originalFunctionName: frame.functionName,
		originalLineNumber: pos.line,
		originalScriptCode: scriptCode,
	};
};

export const getSourceMapFromRemoteFile = async (fileName: string) => {
	const fileContents = await fetchUrl(fileName);
	return getSourceMap(fileName, fileContents, 'remote');
};

export const getSourceMapFromLocalFile = (fileName: string) => {
	const fileContents = readFileSync(fileName, 'utf8');
	return getSourceMap(fileName, fileContents, 'local');
};

export type AnySourceMapConsumer =
	| BasicSourceMapConsumer
	| IndexedSourceMapConsumer;
