import {afterEach, expect, test, vi} from 'vitest';
import '../symbol-dispose';
import {createBackgroundKeepalive} from '../background-keepalive';
import {waitForReady} from '../wait-for-ready';

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const setupWorkerFailure = () => {
	vi.useFakeTimers();
	const terminate = vi.fn();
	const revoke = vi.spyOn(URL, 'revokeObjectURL');
	let worker!: {
		onerror: (error: Event) => void;
		onmessage: () => void;
	};
	vi.stubGlobal(
		'Worker',
		class {
			onerror = () => {};
			onmessage = () => {};
			terminate = terminate;
			postMessage = vi.fn();
			constructor() {
				worker = this;
			}
		},
	);
	const keepalive = createBackgroundKeepalive({fps: 25, logLevel: 'error'});
	return {keepalive, terminate, revoke, getWorker: () => worker};
};

test('continues ticking with timers after the worker fails', async () => {
	const {keepalive, terminate, revoke, getWorker} = setupWorkerFailure();
	try {
		let completed = 0;
		keepalive.waitForTick().then(() => completed++);
		keepalive.waitForTick().then(() => completed++);
		getWorker().onmessage();
		await Promise.resolve();
		expect(completed).toBe(2);
		keepalive.waitForTick().then(() => completed++);
		getWorker().onerror(new Event('error'));
		await Promise.resolve();
		expect(completed).toBe(3);
		keepalive.waitForTick().then(() => completed++);
		await vi.advanceTimersByTimeAsync(39);
		expect(completed).toBe(3);
		await vi.advanceTimersByTimeAsync(1);
		expect(completed).toBe(4);
		keepalive.waitForTick().then(() => completed++);
		await vi.advanceTimersByTimeAsync(40);
		expect(completed).toBe(5);
	} finally {
		keepalive[Symbol.dispose]();
	}

	expect(terminate).toHaveBeenCalledTimes(1);
	expect(revoke).toHaveBeenCalledTimes(1);
});

test.for(['ready', 'abort'] as const)(
	'observes %s after worker failure when RAF never fires',
	async (outcome) => {
		const {keepalive, getWorker} = setupWorkerFailure();
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn(() => 1),
		);
		const scope = {
			remotion_renderReady: false,
			remotion_delayRenderHandles: [],
			remotion_delayRenderTimeouts: {},
			remotion_puppeteerTimeout: 30000,
			remotion_attempt: 1,
		};
		const controller = new AbortController();
		let result: 'pending' | 'ready' | string = 'pending';
		try {
			const waiting = waitForReady(
				{
					timeoutInMilliseconds: 30000,
					scope,
					signal: controller.signal,
					apiName: 'renderMediaOnWeb',
					internalState: null,
					keepalive,
				},
				null,
			).then(
				() => {
					result = 'ready';
				},
				(error: Error) => {
					result = error.message;
				},
			);
			getWorker().onerror(new Event('error'));
			await vi.advanceTimersByTimeAsync(0);
			if (outcome === 'ready') scope.remotion_renderReady = true;
			else controller.abort();
			await vi.advanceTimersByTimeAsync(40);
			expect(result).toBe(
				outcome === 'ready' ? 'ready' : 'renderMediaOnWeb() was cancelled',
			);
			await waiting;
		} finally {
			keepalive[Symbol.dispose]();
		}
	},
);

test('a real worker tick settles multiple waits and disposes cleanly', async () => {
	using keepalive = createBackgroundKeepalive({fps: 25, logLevel: 'error'});
	await Promise.all([keepalive.waitForTick(), keepalive.waitForTick()]);
	await keepalive.waitForTick();
});

test.for(['url', 'constructor', 'start'] as const)(
	'uses timer ticks and releases owned resources when worker %s fails',
	async (phase) => {
		vi.useFakeTimers();
		const failure = new DOMException(
			'Worker startup was blocked',
			'SecurityError',
		);
		const createUrl = vi.spyOn(URL, 'createObjectURL');
		const revoke = vi.spyOn(URL, 'revokeObjectURL');
		const terminate = vi.fn();
		if (phase === 'url')
			createUrl.mockImplementation(() => {
				throw failure;
			});
		vi.stubGlobal(
			'Worker',
			class {
				onerror = () => {};
				onmessage = () => {};
				terminate = terminate;
				constructor() {
					if (phase === 'constructor') throw failure;
				}

				postMessage() {
					throw failure;
				}
			},
		);
		const keepalive = createBackgroundKeepalive({fps: 25, logLevel: 'error'});
		try {
			let ticks = 0;
			const first = Promise.all([
				keepalive.waitForTick().then(() => ticks++),
				keepalive.waitForTick().then(() => ticks++),
			]);
			await vi.advanceTimersByTimeAsync(39);
			expect(ticks).toBe(0);
			await vi.advanceTimersByTimeAsync(1);
			await first;
			expect(ticks).toBe(2);
			const next = keepalive.waitForTick().then(() => ticks++);
			await vi.advanceTimersByTimeAsync(40);
			await next;
			expect(ticks).toBe(3);

			vi.stubGlobal(
				'requestAnimationFrame',
				vi.fn(() => 1),
			);
			const scope = {
				remotion_renderReady: false,
				remotion_delayRenderHandles: [],
				remotion_delayRenderTimeouts: {},
				remotion_puppeteerTimeout: 30000,
				remotion_attempt: 1,
			};
			let ready = false;
			const waiting = waitForReady(
				{
					timeoutInMilliseconds: 30000,
					scope,
					signal: null,
					apiName: 'renderMediaOnWeb',
					internalState: null,
					keepalive,
				},
				null,
			).then(() => {
				ready = true;
			});
			await vi.advanceTimersByTimeAsync(40);
			expect(ready).toBe(false);
			scope.remotion_renderReady = true;
			await vi.advanceTimersByTimeAsync(40);
			expect(ready).toBe(true);
			await waiting;
		} finally {
			keepalive[Symbol.dispose]();
			keepalive[Symbol.dispose]();
		}

		expect(terminate).toHaveBeenCalledTimes(phase === 'start' ? 1 : 0);
		expect(revoke).toHaveBeenCalledTimes(phase === 'url' ? 0 : 1);
		if (phase !== 'url')
			expect(revoke).toHaveBeenCalledWith(createUrl.mock.results[0].value);
	},
);
