import type {InteractivitySchema} from 'remotion';
import {Internals} from 'remotion';
import {applyLut, cleanupLut, setupLut, type LutState} from './lut-runtime.js';
import {parseCubeLut, type ParsedCubeLut} from './parse-cube-lut.js';

const {createEffect} = Internals;

const DEFAULT_LUT_CONTENT = `TITLE "Identity"
LUT_3D_SIZE 2

0 0 0
1 0 0
0 1 0
1 1 0
0 0 1
1 0 1
0 1 1
1 1 1`;

export const lutSchema = {
	content: {
		type: 'text-content',
		default: DEFAULT_LUT_CONTENT,
		description: 'Cube LUT content',
		keyframable: false,
	},
} as const satisfies InteractivitySchema;

export type LutParams = {
	/** The inline contents of a 3D `.cube` LUT file. */
	readonly content: string;
};

type CachedLut = {
	readonly parsed: ParsedCubeLut;
	readonly effectKey: string;
};

const MAX_CACHED_LUTS = 4;
const parsedLuts = new Map<string, CachedLut>();

const getCachedLut = (content: string): CachedLut => {
	const cached = parsedLuts.get(content);
	if (cached) {
		parsedLuts.delete(content);
		parsedLuts.set(content, cached);
		return cached;
	}

	let firstHash = 2166136261;
	let secondHash = 5381;

	for (let i = 0; i < content.length; i++) {
		const character = content.charCodeAt(i);
		firstHash ^= character;
		firstHash = Math.imul(firstHash, 16777619);
		secondHash = Math.imul(secondHash, 33) ^ character;
	}

	const created = {
		parsed: parseCubeLut(content),
		effectKey: `lut-${content.length}-${firstHash >>> 0}-${secondHash >>> 0}`,
	};
	parsedLuts.set(content, created);

	if (parsedLuts.size > MAX_CACHED_LUTS) {
		const oldestContent = parsedLuts.keys().next().value;
		if (oldestContent !== undefined) {
			parsedLuts.delete(oldestContent);
		}
	}

	return created;
};

const validateLutParams = (params: LutParams): void => {
	if (params === null || typeof params !== 'object') {
		throw new TypeError(
			`LUT effect requires a parameters object, but got ${JSON.stringify(params)}`,
		);
	}

	if (
		typeof params.content !== 'string' ||
		params.content.trim().length === 0
	) {
		throw new TypeError(
			`"content" must be a non-empty string, but got ${JSON.stringify(params.content)}`,
		);
	}

	getCachedLut(params.content);
};

export const lut = createEffect<LutParams, LutState>({
	type: 'remotion/lut',
	label: 'lut()',
	documentationLink: 'https://www.remotion.dev/docs/effects/lut',
	backend: 'webgl2',
	calculateKey: (params) => getCachedLut(params.content).effectKey,
	setup: setupLut,
	apply: ({source, width, height, params, state, flipSourceY}) => {
		applyLut({
			state,
			source,
			width,
			height,
			content: params.content,
			parsed: getCachedLut(params.content).parsed,
			flipSourceY,
		});
	},
	cleanup: cleanupLut,
	schema: lutSchema,
	validateParams: validateLutParams,
});
