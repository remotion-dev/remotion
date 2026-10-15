import {expect, mock, test} from 'bun:test';
import {CanvasPool} from '../effects/canvas-pool.js';
import {groupByBackend} from '../effects/effect-internals.js';
import type {
	Backend,
	EffectDefinition,
	EffectDefinitionAndStack,
	EffectDescriptor,
} from '../effects/effect-types.js';
import {
	cleanupEffectChainState,
	createEffectChainState,
	runEffectChain,
} from '../effects/run-effect-chain.js';

const makeDef = (
	type: string,
	backend: Backend,
): EffectDefinition<unknown, unknown> => ({
	type,
	label: type,
	documentationLink: null,
	backend,
	calculateKey: () => type,
	setup: () => null,
	apply: () => undefined,
	cleanup: () => undefined,
	schema: {},
	validateParams: () => {},
});

const makeDesc = (
	type: string,
	backend: Backend,
): EffectDescriptor<unknown> => ({
	definition: makeDef(type, backend),
	params: {},
	effectKey: type,
	memoized: false,
});

const memoizeEffects = (
	effects: EffectDescriptor<unknown>[],
): EffectDefinitionAndStack<unknown>[] => {
	return effects.map((e) => ({
		...e,
		memoized: true,
	}));
};

// PR #11436: a size change or unmount can cancel an asynchronous source resize.
test('closes a resized effect source after its chain is cancelled', async () => {
	const originalBitmap = globalThis.createImageBitmap;
	let finishResize!: (bitmap: ImageBitmap) => void;
	const close = mock(() => undefined);
	globalThis.createImageBitmap = mock(
		() =>
			new Promise<ImageBitmap>((resolve) => {
				finishResize = resolve;
			}),
	) as typeof createImageBitmap;
	const state = createEffectChainState(2, 2);
	try {
		const rendering = runEffectChain({
			state,
			source: document.createElement('canvas'),
			output: document.createElement('canvas'),
			width: 4,
			height: 4,
			effects: memoizeEffects([makeDesc('cancelled', '2d')]),
		});
		cleanupEffectChainState(state);
		finishResize({close} as unknown as ImageBitmap);
		expect(await rendering).toBe(false);
		expect(close).toHaveBeenCalledTimes(1);
	} finally {
		globalThis.createImageBitmap = originalBitmap;
		cleanupEffectChainState(state);
	}
});

test('groupByBackend collapses adjacent same-backend effects', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', '2d'),
		makeDesc('c', 'webgl2'),
		makeDesc('d', 'webgl2'),
		makeDesc('e', '2d'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(3);
	expect(runs[0].backend).toBe('2d');
	expect(runs[0].effects.map((e) => e.definition.type)).toEqual(['a', 'b']);
	expect(runs[1].backend).toBe('webgl2');
	expect(runs[1].effects.map((e) => e.definition.type)).toEqual(['c', 'd']);
	expect(runs[2].backend).toBe('2d');
	expect(runs[2].effects.map((e) => e.definition.type)).toEqual(['e']);
});

test('groupByBackend returns single run for uniform backend', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', '2d'),
		makeDesc('c', '2d'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(1);
	expect(runs[0].backend).toBe('2d');
	expect(runs[0].effects).toHaveLength(3);
});

test('groupByBackend returns empty for empty input', () => {
	expect(groupByBackend([])).toEqual([]);
});

test('groupByBackend returns one run per backend transition', () => {
	const effects = [
		makeDesc('a', '2d'),
		makeDesc('b', 'webgl2'),
		makeDesc('c', '2d'),
		makeDesc('d', 'webgl2'),
	];

	const runs = groupByBackend(memoizeEffects(effects));
	expect(runs).toHaveLength(4);
	expect(runs.map((r) => r.backend)).toEqual(['2d', 'webgl2', '2d', 'webgl2']);
});

test.each(['2d', 'webgl2'] as const)(
	'runEffectChain allocates only needed %s targets and releases them',
	async (backend) => {
		const source = document.createElement('canvas');
		const output = document.createElement('canvas');
		const contents = new WeakMap<object, string>([[source, 'raw']]);
		const allocated: HTMLCanvasElement[] = [];
		const loseContext = mock(() => undefined);
		const original = Object.getOwnPropertyDescriptor(
			HTMLCanvasElement.prototype,
			'getContext',
		);
		const getContext = mock(function (this: HTMLCanvasElement, kind: string) {
			if (this !== output) allocated.push(this);
			return (kind === 'webgl2'
				? {
						UNPACK_PREMULTIPLY_ALPHA_WEBGL: 0x9241,
						pixelStorei: () => undefined,
						getExtension: () => ({loseContext}),
					}
				: {
						clearRect: () => contents.delete(this),
						drawImage: (image: object) =>
							contents.set(this, contents.get(image)!),
					}) as unknown as ReturnType<HTMLCanvasElement['getContext']>;
		});
		Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
			configurable: true,
			value: getContext,
		});
		const state = createEffectChainState(4, 4);
		const definition: EffectDefinition<unknown, unknown> = {
			...makeDef('append', backend),
			apply: ({source: input, target, params}) => {
				contents.set(target, contents.get(input as object)! + params);
			},
		};
		const render = (texts: string[]) =>
			runEffectChain({
				state,
				source,
				output,
				width: 4,
				height: 4,
				effects: texts.map((text) => ({
					definition,
					params: text,
					effectKey: text,
					memoized: true as const,
				})),
			});
		try {
			await render(['A']);
			expect(contents.get(output)).toBe('rawA');
			expect(allocated).toHaveLength(1);
			await render(['A', 'B', 'C']);
			expect(contents.get(output)).toBe('rawABC');
			expect(allocated).toHaveLength(2);
			await render(['D']);
			expect(contents.get(output)).toBe('rawD');
			expect(allocated).toHaveLength(2);
		} finally {
			cleanupEffectChainState(state);
			if (original) {
				Object.defineProperty(
					HTMLCanvasElement.prototype,
					'getContext',
					original,
				);
			} else {
				Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
			}
		}

		for (const canvas of allocated) {
			expect([canvas.width, canvas.height]).toEqual([0, 0]);
		}

		expect(loseContext).toHaveBeenCalledTimes(backend === 'webgl2' ? 2 : 0);
	},
);

test('CanvasPool preserves getPair and releases a lone second slot', () => {
	const original = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'getContext',
	);
	const getContext = mock(() => ({}));
	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		configurable: true,
		value: getContext,
	});
	const pool = new CanvasPool(4, 4, () => undefined);
	const partial = new CanvasPool(4, 4, () => undefined);
	try {
		const second = pool.getCanvas('2d', 1);
		expect(getContext).toHaveBeenCalledTimes(1);
		const pair = pool.getPair('2d');
		expect(pair[1]).toBe(second);
		expect(pair[0]).toBe(pool.getCanvas('2d', 0));
		expect(pool.getPair('2d')).toBe(pair);
		expect(getContext).toHaveBeenCalledTimes(2);
		const lone = partial.getCanvas('2d', 1);
		partial.dispose();
		expect([lone.width, lone.height]).toEqual([0, 0]);
		expect(() => partial.getCanvas('2d', 0)).toThrow('cleaned up');
	} finally {
		pool.dispose();
		partial.dispose();
		if (original) {
			Object.defineProperty(
				HTMLCanvasElement.prototype,
				'getContext',
				original,
			);
		} else {
			Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
		}
	}
});
