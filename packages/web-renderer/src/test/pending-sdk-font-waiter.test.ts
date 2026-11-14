import type {DelayRenderScope} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {afterEach, expect, vi, test} from 'vitest';
import {waitForReady} from '../wait-for-ready';

// Real waiter + shared DOM sample helper, controlled FontFaceSet bookkeeping.
// This is a pure lifecycle control, not native font selection/pixel evidence.
const fontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');
afterEach(() => {
	document.body.replaceChildren();
	if (fontsDescriptor)
		Object.defineProperty(document, 'fonts', fontsDescriptor);
	else Reflect.deleteProperty(document, 'fonts');
});
const scene = (family: string, text = 'A', weight = '700') => {
	const root = document.createElement('div');
	const span = document.createElement('span');
	span.style.cssText = `font-family:"${family}";font-size:20px;font-weight:${weight}`;
	span.textContent = text;
	root.append(span);
	document.body.append(root);
	const check = vi.spyOn({check: () => true}, 'check');
	Object.defineProperty(document, 'fonts', {
		configurable: true,
		value: {
			status: 'loaded',
			ready: Promise.resolve(),
			check,
			*[Symbol.iterator]() {
				yield {
					family,
					weight: '400',
					style: 'normal',
					stretch: 'normal',
					unicodeRange: 'U+0-10FFFF',
					status: 'loaded',
				};
			},
		},
	});
	return {root, span, check};
};

const pending = (family: string, unicodeRange: string | null = null) =>
	NoReactInternals.startPendingFontFace({
		ownerDocument: document,
		fontFamily: family,
		style: 'normal',
		weight: '700',
		stretch: null,
		unicodeRange,
	});
const wait = (
	root: HTMLElement,
	signal: AbortSignal | null = null,
	timeout = 30_000,
) =>
	waitForReady(
		{
			timeoutInMilliseconds: timeout,
			scope: {
				remotion_renderReady: true,
				remotion_delayRenderTimeouts: {},
				remotion_delayRenderHandles: [],
				remotion_attempt: 0,
				remotion_puppeteerTimeout: 30_000,
			} as DelayRenderScope,
			signal,
			apiName: 'renderFramesOnWeb',
			internalState: null,
			keepalive: null,
		},
		root,
	);

test('SDK pending query blocks while native status is loaded and loaded400 would pass native check', async () => {
	const {root, check} = scene('Needed SDK');
	const load = pending('Needed SDK');
	const before = root.outerHTML;
	let finished = false;
	const waiting = wait(root).then(() => {
		finished = true;
	});
	try {
		await Promise.resolve();
		expect(finished).toBe(false);
		expect(check).toHaveBeenCalledTimes(0);
		load.resolve(null);
		await waiting;
		expect(root.outerHTML).toBe(before);
	} finally {
		load.resolve(null);
		await waiting;
	}
});

test('unrelated family does not become a capture barrier', async () => {
	const {root} = scene('Used SDK');
	const load = pending('Unrelated SDK');
	try {
		await wait(root);
		expect(NoReactInternals.getPendingFontFaces()).toHaveLength(1);
	} finally {
		load.resolve(null);
	}
});

test('another real Document does not become a capture barrier', async () => {
	const {root} = scene('Same name across documents');
	const other = document.implementation.createHTMLDocument('Other owner');
	const load = NoReactInternals.startPendingFontFace({
		ownerDocument: other,
		fontFamily: 'Same name across documents',
		style: 'normal',
		weight: '700',
		stretch: null,
		unicodeRange: null,
	});
	try {
		await wait(root);
		expect(NoReactInternals.getPendingFontFaces()).toHaveLength(1);
	} finally {
		load.resolve(null);
	}
});

test('disjoint Unicode does not exclude a better descriptor before native face creation', async () => {
	const {root} = scene('Subset SDK', 'A');
	const load = pending('Subset SDK', 'U+42');
	let finished = false;
	const waiting = wait(root).then(() => {
		finished = true;
	});
	try {
		await Promise.resolve();
		expect(finished).toBe(false);
		load.resolve(null);
		await waiting;
	} finally {
		load.resolve(null);
		await waiting;
	}
});

test('inflight SDK failure rejects the real waiter with original error after metadata removal', async () => {
	const {root} = scene('Failing SDK');
	const load = pending('Failing SDK');
	const waiting = wait(root);
	const error = new Error('Original SDK failure');
	load.reject(error);
	await expect(waiting).rejects.toBe(error);
	expect(NoReactInternals.getPendingFontFaces()).toHaveLength(0);
});

test('actual AbortSignal detaches the waiter before late SDK rejection', async () => {
	const {root} = scene('Aborted SDK');
	const load = pending('Aborted SDK');
	const controller = new AbortController();
	const waiting = wait(root, controller.signal);
	controller.abort();
	await expect(waiting).rejects.toThrow('renderFramesOnWeb() was cancelled');
	expect(NoReactInternals.getPendingFontFaces()).toHaveLength(1);
	load.reject(new Error('Late SDK rejection'));
	await Promise.resolve();
	await Promise.resolve();
	expect(NoReactInternals.getPendingFontFaces()).toHaveLength(0);
});

test('concurrent captures share one SDK operation while cancellation remains local', async () => {
	const first = scene('Shared SDK');
	const second = scene('Shared SDK');
	const load = pending('Shared SDK');
	const controller = new AbortController();
	let secondFinished = false;
	const a = wait(first.root, controller.signal);
	const b = wait(second.root).then(() => {
		secondFinished = true;
	});
	try {
		controller.abort();
		await expect(a).rejects.toThrow('renderFramesOnWeb() was cancelled');
		await Promise.resolve();
		expect(secondFinished).toBe(false);
		expect(NoReactInternals.getPendingFontFaces()).toHaveLength(1);
		load.resolve(null);
		await b;
		expect(secondFinished).toBe(true);
	} finally {
		load.resolve(null);
		await b;
	}
});

test('a fresh actual query releases a now-unrelated pending family', async () => {
	const {root, span} = scene('Earlier SDK');
	const load = pending('Earlier SDK');
	const waiting = wait(root);
	span.style.fontFamily = 'monospace';
	try {
		await waiting;
		expect(NoReactInternals.getPendingFontFaces()).toHaveLength(1);
	} finally {
		load.resolve(null);
	}
});

test('SDK pending work retains the original elapsed budget', async () => {
	const {root} = scene('Deadline SDK');
	const load = pending('Deadline SDK');
	let now = 0;
	const clock = vi.spyOn(performance, 'now').mockImplementation(() => now);
	const waiting = wait(root, null, 100);
	try {
		now = 3101;
		await expect(waiting).rejects.toThrow(
			'Waiting for capture fonts to become ready',
		);
	} finally {
		clock.mockRestore();
		load.resolve(null);
	}
});
