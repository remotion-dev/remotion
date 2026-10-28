/**
 * Adapted from Fumadocs' Twoslash implementation at
 * https://github.com/fuma-nama/fumadocs/tree/af5928ef0573e52a627f01473f4fdad6b3a4730a/packages/twoslash/src
 *
 * MIT License
 * Copyright (c) 2023 Fuma
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type {
	ErrorLevel,
	NodeError as ProtocolNodeError,
	NodeTag,
	Position,
	Range,
	TwoslashNode as ProtocolTwoslashNode,
} from '@remotion/typescript-tools/twoslash';

// Reuse Shiki's protocol types so optional output fields remain upstream-owned.
export type {
	CompletionEntry,
	NodeHover,
} from '@remotion/typescript-tools/twoslash';

// Native compiler diagnostics always supply these fields.
export type NodeError = ProtocolNodeError & {
	level: ErrorLevel;
	code: number;
	filename: string;
};

export type TwoslashNode =
	| Exclude<ProtocolTwoslashNode, {type: 'error'}>
	| NodeError;

export type NodeWithoutPosition<T = TwoslashNode> = T extends unknown
	? Omit<T, keyof Position>
	: never;

export interface HandbookOptions {
	/** error codes expected in the code block */
	errors: number[];
	/** suppress all errors, or the given error codes */
	noErrors: boolean | number[];
	/** suppress errors in the cut regions */
	noErrorsCutted: boolean;
	/** don't check that errors are marked as expected */
	noErrorValidation: boolean;
	/** disable hover info of identifiers */
	noStaticSemanticInfo: boolean;
	/** keep the notations in the output code */
	keepNotations: boolean;
}

export const defaultHandbookOptions: HandbookOptions = {
	errors: [],
	noErrors: false,
	noErrorsCutted: false,
	noErrorValidation: false,
	noStaticSemanticInfo: false,
	keepNotations: false,
};

export interface VirtualFile {
	/** offset of the content in the code block */
	offset: number;
	filename: string;
	content: string;
	extension: string;
}

export class TwoslashError extends Error {
	constructor(
		public title: string,
		public description: string,
		public recommendation: string | null,
	) {
		super(
			`\n## ${title}\n\n${description}\n${recommendation ? `\n${recommendation}` : ''}`,
		);
	}
}

export interface Notations {
	compilerOptions: Record<string, unknown>;
	handbookOptions: HandbookOptions;
	tags: NodeWithoutPosition<NodeTag>[];
	removals: Range[];
	queries: number[];
	completions: number[];
	highlights: [start: number, end: number, text: string | undefined][];
}

const reFlag = /^\/\/\s?@(\w+)(?::\s?(.+))?$/gm;
const reMarker = /^\s*\/\/\s*\^(\?|\||\^+)( .*)?$/gm;
const reCut = /^\/\/\s?---cut(-before|-after|-start|-end)?---$/;
const reFilename = /^[\t\v\f ]*\/\/\s?@filename: (.+)$/gm;
/** compiler options taking a list, a single value is wrapped */
const listFlags = [
	'lib',
	'types',
	'typeRoots',
	'rootDirs',
	'moduleSuffixes',
	'customConditions',
];

function parseFlagValue(value: string | null): unknown {
	if (value === null || value === 'true') return true;
	if (value === 'false') return false;
	if (value.includes(',')) return value.split(',').map((v) => v.trim());
	const num = Number(value);
	return Number.isNaN(num) ? value : num;
}

/**
 * Parse `// @flag` and `// @flag: value` lines.
 *
 * Compiler flags are kept as raw values, they're validated by TypeScript when loading the config.
 */
export function findFlagNotations(
	code: string,
	customTags: string[],
	options: Pick<
		Notations,
		'compilerOptions' | 'handbookOptions' | 'tags' | 'removals'
	>,
) {
	for (const match of code.matchAll(reFlag)) {
		const [text, name, value] = match;
		const range: Range = [match.index, match.index + text.length + 1];
		if (name === 'filename') continue;

		if (customTags.includes(name)) {
			options.tags.push({
				type: 'tag',
				name,
				start: range[1],
				length: 0,
				text: value,
			});
		} else if (name === 'errors') {
			options.handbookOptions.errors = (value ?? '').split(' ').map(Number);
		} else if (name === 'noErrors') {
			const parsed = parseFlagValue(value ?? null);
			options.handbookOptions.noErrors =
				typeof parsed === 'boolean'
					? parsed
					: (value ?? '').split(' ').map(Number);
		} else if (name in defaultHandbookOptions) {
			Object.assign(options.handbookOptions, {
				[name]: parseFlagValue(value ?? null),
			});
		} else {
			const parsed = parseFlagValue(value ?? null);
			options.compilerOptions[name] =
				listFlags.includes(name) && !Array.isArray(parsed) ? [parsed] : parsed;
		}

		options.removals.push(range);
	}
}

/**
 * Find `// ---cut---` notations, the removed ranges are pushed to `removals`
 */
export function findCutNotations(code: string, removals: Range[]) {
	const cuts: Range[] = [];
	const cutStarts: number[] = [];
	let index = 0;
	for (const line of code.split('\n')) {
		const end = index + line.length + 1;
		const match = reCut.exec(line.trim());
		if (match) {
			const kind = match[1] ?? '';
			if (kind === '' || kind === '-before') {
				cuts.splice(0, cuts.length, [0, end]);
			} else if (kind === '-after') {
				cuts.push([index, code.length]);
				break;
			} else if (kind === '-start') {
				cutStarts.push(index);
			} else {
				const start = cutStarts.pop();
				if (start === undefined) {
					throw new TwoslashError(
						'Mismatched cut markers',
						'Found a cut-end without cut-start.',
						null,
					);
				}

				cuts.push([start, end]);
			}
		}

		index = end;
	}

	if (cutStarts.length > 0) {
		throw new TwoslashError(
			'Mismatched cut markers',
			'Found a cut-start without cut-end.',
			null,
		);
	}

	removals.push(...cuts);
}

/**
 * Find `^?`, `^|` and `^^^` markers, they point to the position of the previous line
 */
export function findQueryMarkers(
	code: string,
	pc: PositionConverter,
	notations: Pick<
		Notations,
		'removals' | 'queries' | 'completions' | 'highlights'
	>,
) {
	const queriedLines = new Set<number>();
	for (const match of code.matchAll(reMarker)) {
		const [text, kind, message] = match;
		notations.removals.push([match.index, match.index + text.length + 1]);
		const markerIndex = match.index + text.indexOf('^');
		const pos = pc.indexToPos(markerIndex);
		let targetLine = pos.line - 1;
		while (queriedLines.has(targetLine) && targetLine >= 0) targetLine--;
		const target = pc.posToIndex(targetLine, pos.character);

		if (kind === '?') notations.queries.push(target);
		else if (kind === '|') notations.completions.push(target);
		else
			notations.highlights.push([
				target,
				target + kind.length + 1,
				message?.trim(),
			]);
		queriedLines.add(pos.line);
	}
}

/**
 * Split the code block into virtual files by `// @filename:` notations
 */
export function splitFiles(
	code: string,
	defaultFilename: string,
): VirtualFile[] {
	const files: VirtualFile[] = [];
	let filename = defaultFilename;
	let index = 0;
	let hasFilename = false;

	function push(end: number) {
		if (end === index) return;
		files.push({
			offset: index,
			filename,
			content: code.slice(index, end),
			extension: filename.slice(filename.lastIndexOf('.') + 1),
		});
	}

	for (const match of code.matchAll(reFilename)) {
		// Compiler flags and comments before the first filename apply to the whole
		// snippet. They must not create an implicit index.tsx that a later explicit
		// index.tsx would overwrite while retaining the implicit file's offsets.
		const preludeIsTrivia =
			/^(?:\s|\/\/[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/)*$/.test(
				code.slice(0, match.index),
			);
		if (hasFilename || !preludeIsTrivia) push(match.index);
		hasFilename = true;
		filename = match[1].trimEnd();
		index = match.index;
	}

	push(code.length);
	return files;
}

export interface PositionConverter {
	indexToPos: (index: number) => Position;
	posToIndex: (line: number, character: number) => number;
}

export function createPositionConverter(code: string): PositionConverter {
	const lines = code.split(/(?<=\n)/);
	return {
		indexToPos(index) {
			let character = index;
			let line = 0;
			for (const text of lines) {
				if (character < text.length) break;
				character -= text.length;
				line++;
			}

			return {line, character};
		},
		posToIndex(line, character) {
			let index = character;
			for (let i = 0; i < line; i++) index += lines[i].length;
			return index;
		},
	};
}

export function isInRange(
	index: number,
	range: Range,
	inclusive: boolean,
): boolean {
	return inclusive
		? range[0] <= index && index <= range[1]
		: range[0] < index && index < range[1];
}

export function isInRanges(
	index: number,
	ranges: Range[],
	inclusive: boolean,
): boolean {
	return ranges.some((range) => isInRange(index, range, inclusive));
}

/**
 * Remove ranges from the code, and shift the positions of nodes accordingly. Nodes in removed ranges are dropped.
 */
export function removeCodeRanges(
	code: string,
	removals: Range[],
	nodes: NodeWithoutPosition[],
): {code: string; nodes: NodeWithoutPosition[]} {
	const ranges = removals.toSorted((a, b) => a[0] - b[0]);
	const merged: Range[] = [];
	for (const range of ranges) {
		const last = merged.at(-1);
		if (last && last[1] >= range[0]) last[1] = Math.max(last[1], range[1]);
		else merged.push([range[0], range[1]]);
	}

	for (const [start, end] of merged.toReversed()) {
		code = code.slice(0, start) + code.slice(end);
		for (const node of nodes) {
			if (node.start + node.length <= start) continue;
			if (node.start < end) node.start = -1;
			else node.start -= end - start;
		}
	}

	return {code, nodes: nodes.filter((node) => node.start >= 0)};
}

export function resolveNodePositions(
	nodes: NodeWithoutPosition[],
	pc: PositionConverter,
): TwoslashNode[] {
	const resolved = nodes.toSorted(
		(a, b) => a.start - b.start || a.type.localeCompare(b.type),
	);
	return resolved.map(
		(node) => ({...node, ...pc.indexToPos(node.start)}) as TwoslashNode,
	);
}

export function validateCodeForErrors(
	errors: NodeWithoutPosition<NodeError>[],
	handbookOptions: HandbookOptions,
) {
	const unexpected = errors.filter(
		(e) => !handbookOptions.errors.includes(e.code),
	);
	if (unexpected.length === 0) return;

	const codes = Array.from(new Set(unexpected.map((e) => e.code))).join(' ');
	const expected = Array.from(new Set(errors.map((e) => e.code))).join(' ');
	throw new TwoslashError(
		'Errors were thrown in the sample, but not included in an error tag',
		`These errors were not marked as being expected: ${codes}. ${
			handbookOptions.errors.length > 0
				? `The existing annotation specified ${handbookOptions.errors.join(' ')}`
				: `Expected: // @errors: ${expected}`
		}`,
		`Compiler Errors:\n\n${unexpected.map((e) => `[${e.code}] ${e.filename}:${e.start} - ${e.text}`).join('\n')}`,
	);
}
