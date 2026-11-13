import {afterEach, beforeEach, expect, test} from 'bun:test';
import {createBackgroundKeepalive} from '../background-keepalive';
import {waitForReady} from '../wait-for-ready';

const descriptors = new Map(
	['Worker', 'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'].map(
		(key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)],
	),
);
const nativeSetTimeout = globalThis.setTimeout;
const fallbackTimers: (() => void)[] = [];
const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
beforeEach(() => {
	Object.defineProperty(globalThis, 'setTimeout', {
		configurable: true,
		value: ((handler: TimerHandler, delay: number, ...args: unknown[]) => {
			if (delay !== 1000) return nativeSetTimeout(handler, delay, ...args);
			if (typeof handler !== 'function')
				throw new Error('Expected actual fallback resolver');
			fallbackTimers.push(() => handler(...args));
			return 0 as unknown as ReturnType<typeof setTimeout>;
		}) as typeof setTimeout,
	});
	Object.defineProperty(globalThis, 'Worker', {
		configurable: true,
		value: undefined,
	});
	Object.defineProperty(globalThis, 'requestAnimationFrame', {
		configurable: true,
		value: (callback: FrameRequestCallback) => {
			const id = ++nextFrame;
			frames.set(id, callback);
			return id;
		},
	});
	Object.defineProperty(globalThis, 'cancelAnimationFrame', {
		configurable: true,
		value: (id: number) => frames.delete(id),
	});
});
afterEach(() => {
	for (const fire of fallbackTimers.splice(0)) fire();
	frames.clear();
	for (const [key, descriptor] of descriptors) {
		if (descriptor) Object.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}
});
const scope = () => ({
	remotion_renderReady: false,
	remotion_delayRenderTimeouts: {},
	remotion_delayRenderHandles: [],
	remotion_attempt: 0,
	remotion_puppeteerTimeout: 30_000,
});
const frame = () => {
	const [id, callback] = frames.entries().next().value!;
	frames.delete(id);
	callback(performance.now());
};

const collected = async (root: WeakRef<object>) => {
	// WeakRef keeps a target alive for its current job; collect in later turns.
	for (let round = 0; round < 4; round++) {
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		Bun.gc(true);
	}

	return root.deref() === undefined;
};

for (const outcome of ['ready', 'abort'] as const) {
	test(`releases capture after ${outcome} while a disposed fallback timer remains pending`, async () => {
		const keepalive = createBackgroundKeepalive({fps: 1, logLevel: 'error'});
		const original = keepalive.waitForTick;
		let tick: Promise<void> | null = null;
		let ticked = false;
		keepalive.waitForTick = () => {
			tick = original();
			tick.then(() => {
				ticked = true;
			});
			return tick;
		};

		const finish = async () => {
			// Minimum ownerDocument interface isolates scheduler retention from DOM caches.
			let root: object | null = {ownerDocument: {defaultView: null}};
			const captureWeak = new WeakRef(root);
			const current = scope();
			const controller = new AbortController();
			const waiting = waitForReady(
				{
					timeoutInMilliseconds: 30_000,
					scope: current,
					signal: controller.signal,
					apiName: 'renderFramesOnWeb',
					internalState: null,
					keepalive,
				},
				root as HTMLElement,
			);
			if (outcome === 'ready') {
				current.remotion_renderReady = true;
				frame();
				await waiting;
			} else {
				controller.abort();
				await expect(waiting).rejects.toThrow(
					'renderFramesOnWeb() was cancelled',
				);
			}

			keepalive[Symbol.dispose]();
			root = null;
			return captureWeak;
		};

		const weak = await finish();
		expect(tick).not.toBeNull();
		expect(fallbackTimers).toHaveLength(1);
		try {
			expect(await collected(weak)).toBe(true);
			expect(ticked).toBe(false);
		} finally {
			// Flush only this fixture's controlled fallback timer. GC turns and
			// watchdogs use native timers throughout.
			for (const fire of fallbackTimers.splice(0)) fire();
			await tick;
		}

		expect(ticked).toBe(true);
	});
}

test('ignores old-generation worker ticks and ticks after capture completion', async () => {
	const current = scope();
	let reads = 0;
	let ready = false;
	Object.defineProperty(current, 'remotion_renderReady', {
		get: () => {
			reads++;
			return ready;
		},
	});
	const ticks: (() => void)[] = [];
	const keepalive = {
		waitForTick: () => new Promise<void>((resolve) => ticks.push(resolve)),
		[Symbol.dispose]: () => {},
	};
	const waiting = waitForReady(
		{
			timeoutInMilliseconds: 30_000,
			scope: current,
			signal: null,
			apiName: 'renderFramesOnWeb',
			internalState: null,
			keepalive,
		},
		null,
	);
	frame();
	const afterNewGeneration = reads;
	ticks[0]();
	await Promise.resolve();
	expect(reads).toBe(afterNewGeneration);
	ready = true;
	frame();
	await waiting;
	const afterCompletion = reads;
	for (const resolve of ticks) resolve();
	await Promise.resolve();
	expect(reads).toBe(afterCompletion);
	expect(frames.size).toBe(0);
});
