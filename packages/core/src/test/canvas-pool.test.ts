import {afterEach, beforeEach, expect, test} from 'bun:test';
import {CanvasPool} from '../effects/canvas-pool.js';
import type {
	Backend,
	EffectDefinitionAndStack,
} from '../effects/effect-types.js';
import {
	cleanupEffectChainState,
	createEffectChainState,
	runEffectChain,
} from '../effects/run-effect-chain.js';

type CanvasRecord = {
	canvas: HTMLCanvasElement;
	contextLost: boolean;
	loseContextCalls: number;
};

const originalDocument = globalThis.document;
let canvases: CanvasRecord[] = [];

beforeEach(() => {
	canvases = [];
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: {
			createElement: (tag: string) => {
				expect(tag).toBe('canvas');
				const record = {
					canvas: null,
					contextLost: false,
					loseContextCalls: 0,
				} as unknown as CanvasRecord;
				const webGlContext = {
					UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
					getExtension: (name: string) =>
						name === 'WEBGL_lose_context'
							? {
									loseContext: () => {
										record.loseContextCalls++;
									},
								}
							: null,
					isContextLost: () => record.contextLost,
					pixelStorei: () => undefined,
				};
				const twoDContext = {
					clearRect: () => undefined,
					drawImage: () => undefined,
				};
				record.canvas = {
					width: 0,
					height: 0,
					addEventListener: () => undefined,
					getContext: (type: string) =>
						type === 'webgl2' ? webGlContext : twoDContext,
				} as unknown as HTMLCanvasElement;
				canvases.push(record);
				return record.canvas;
			},
		},
	});
});

afterEach(() => {
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: originalDocument,
	});
});

const makeEffect = (
	type: string,
	backend: Backend,
): EffectDefinitionAndStack<unknown> => ({
	definition: {
		type,
		label: type,
		documentationLink: null,
		backend,
		calculateKey: () => type,
		setup: () => null,
		apply: () => undefined,
		cleanup: () => undefined,
		schema: {},
		validateParams: () => undefined,
	},
	params: {},
	effectKey: type,
	memoized: true,
});

const makeOutput = (): HTMLCanvasElement =>
	({
		getContext: () => ({
			clearRect: () => undefined,
			drawImage: () => undefined,
		}),
	}) as unknown as HTMLCanvasElement;

test('allocates effect canvases by slot', () => {
	const pool = new CanvasPool(1920, 1080);
	const first = pool.getCanvas('webgl2', 0);

	expect(first).toBe(pool.getCanvas('webgl2', 0));
	expect(canvases).toHaveLength(1);

	pool.getCanvas('webgl2', 1);
	expect(canvases).toHaveLength(2);
});

test('allocates one canvas for one effect and two for ping-ponging', async () => {
	const oneEffectState = createEffectChainState(1920, 1080);
	await runEffectChain({
		state: oneEffectState,
		source: {} as CanvasImageSource,
		effects: [makeEffect('first', 'webgl2')],
		output: makeOutput(),
		width: 1920,
		height: 1080,
	});
	expect(canvases).toHaveLength(1);
	cleanupEffectChainState(oneEffectState);

	canvases = [];
	const twoEffectState = createEffectChainState(1920, 1080);
	await runEffectChain({
		state: twoEffectState,
		source: {} as CanvasImageSource,
		effects: [makeEffect('first', 'webgl2'), makeEffect('second', 'webgl2')],
		output: makeOutput(),
		width: 1920,
		height: 1080,
	});
	expect(canvases).toHaveLength(2);
	cleanupEffectChainState(twoEffectState);
});

test('detects context loss before the browser event fires', () => {
	const pool = new CanvasPool(1920, 1080);
	const canvas = pool.getCanvas('webgl2', 0);
	canvases[0].contextLost = true;

	expect(() => pool.assertContextNotLost(canvas)).toThrow(
		'WebGL context was lost',
	);
});

test('releases allocated contexts during chain cleanup', () => {
	const state = createEffectChainState(1920, 1080);
	state.pool.getCanvas('webgl2', 0);
	state.pool.getCanvas('webgl2', 1);

	cleanupEffectChainState(state);

	for (const {canvas, loseContextCalls} of canvases) {
		expect(loseContextCalls).toBe(1);
		expect(canvas.width).toBe(0);
		expect(canvas.height).toBe(0);
	}

	expect(() => state.pool.getCanvas('webgl2', 0)).toThrow(
		'disposed effect pool',
	);
});

test('releases contexts when effect cleanup throws', () => {
	const state = createEffectChainState(1920, 1080);
	const effect = makeEffect('throws-on-cleanup', 'webgl2');
	state.pool.getCanvas('webgl2', 0);
	state.cleanupRegistry.push({
		definition: {
			...effect.definition,
			cleanup: () => {
				throw new Error('cleanup failed');
			},
		},
		state: null,
	});

	expect(() => cleanupEffectChainState(state)).toThrow('cleanup failed');
	expect(canvases[0].loseContextCalls).toBe(1);
});
