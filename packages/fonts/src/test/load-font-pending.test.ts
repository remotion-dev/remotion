import {afterAll, beforeAll, expect, mock, test} from 'bun:test';
import {cancelRender as cancelRenderFromCore} from 'remotion';
import {NoReactInternals as registry} from 'remotion/no-react';
import type {loadFont as loadFontType} from '../load-font';

const originalCancelRender = cancelRenderFromCore;
const originalDocument = Object.getOwnPropertyDescriptor(
	globalThis,
	'document',
);
const originalFontFace = Object.getOwnPropertyDescriptor(
	globalThis,
	'FontFace',
);
const events: string[] = [];
const errors: unknown[] = [];
mock.module('remotion', () => ({
	delayRender: () => {
		events.push('delay');
		return 42;
	},
	continueRender: () => events.push('continue'),
	cancelRender: (error: unknown): never => {
		errors.push(error);
		return originalCancelRender(error);
	},
}));
let loadFont: typeof loadFontType;
beforeAll(async () => {
	({loadFont} = await import('../load-font'));
});

afterAll(() => {
	for (const [key, descriptor] of [
		['document', originalDocument],
		['FontFace', originalFontFace],
	] as const) {
		if (descriptor) Object.defineProperty(globalThis, key, descriptor);
		else Reflect.deleteProperty(globalThis, key);
	}

	mock.restore();
});

test('SDK metadata spans the actual cached fetch, native load, add and registration', async () => {
	events.length = 0;
	let releaseFetch!: (data: ArrayBuffer) => void;
	let releaseLoad!: () => void;
	const bytes = new ArrayBuffer(1);
	const fetchResult = new Promise<ArrayBuffer>((resolve) => {
		releaseFetch = resolve;
	});
	const nativeLoaded = new Promise<void>((resolve) => {
		releaseLoad = resolve;
	});
	const originalFetch = globalThis.fetch;
	const fetchMock = mock(() => fetchResult.then((data) => new Response(data)));
	globalThis.fetch = fetchMock as unknown as typeof fetch;
	const addedFaces: FontFace[] = [];
	const ownerDocument = {
		fonts: {
			add: (face: FontFace) => {
				addedFaces.push(face);
				events.push('add');
			},
		},
	} as unknown as Document;
	Object.defineProperty(globalThis, 'document', {
		configurable: true,
		value: ownerDocument,
	});
	class TestFontFace {
		constructor(
			public family: string,
			public data: ArrayBuffer,
		) {
			events.push('construct');
		}

		async load() {
			events.push('load');
			await nativeLoaded;
			return this;
		}
	}
	Object.defineProperty(globalThis, 'FontFace', {
		configurable: true,
		value: TestFontFace,
	});
	const url = 'https://font.test/pending-sdk-success.woff2';
	const first = loadFont({
		family: 'First pending SDK',
		url,
		weight: '700',
		unicodeRange: 'U+20-7E',
	});
	const second = loadFont({family: 'Second pending SDK', url, style: 'italic'});
	const pending = registry.getPendingFontFaces();
	try {
		expect(pending).toHaveLength(2);
		expect(pending[0].ownerDocument).toBe(ownerDocument);
		expect(pending[0].weight).toBe('700');
		expect(pending[0].unicodeRange).toBe('U+20-7E');
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(events).toEqual(['delay', 'delay']);
		releaseFetch(bytes);
		for (let i = 0; i < 10; i++) await Promise.resolve();
		expect(registry.getPendingFontFaces()).toHaveLength(2);
		expect(events.filter((event) => event === 'load')).toHaveLength(2);
		expect(events).not.toContain('add');
		releaseLoad();
		await Promise.all([first, second]);
		await Promise.all(pending.map((record) => record.completion));
		expect(registry.getPendingFontFaces()).toHaveLength(0);
		expect(
			registry.getRegisteredFontFaces().filter((face) => face.fontUrl === url),
		).toHaveLength(2);
		expect(events.slice(-4)).toEqual(['add', 'continue', 'add', 'continue']);
		expect(addedFaces).toHaveLength(2);
		expect(
			addedFaces.map((face) => registry.getFontFaceFamilyInput(face)),
		).toEqual(['First pending SDK', 'Second pending SDK']);
		addedFaces[0].family = 'Changed after load';
		expect(registry.getFontFaceFamilyInput(addedFaces[0])).toBeNull();
	} finally {
		releaseFetch(bytes);
		releaseLoad();
		await Promise.all([first, second]);
		globalThis.fetch = originalFetch;
	}
});

test('SDK failure keeps its public cancellation behavior and rejects pending completion', async () => {
	const error = new Error('Real fetch pipeline failed');
	const originalFetch = globalThis.fetch;
	globalThis.fetch = mock(() =>
		Promise.reject(error),
	) as unknown as typeof fetch;
	const result = loadFont({
		family: 'Failing pending SDK',
		url: 'https://font.test/pending-sdk-failure.woff2',
	});
	const record = registry.getPendingFontFaces()[0];
	try {
		await expect(result).rejects.toBe(error);
		await expect(record.completion).rejects.toBe(error);
		expect(errors.at(-1)).toBe(error);
		expect(registry.getPendingFontFaces()).toHaveLength(0);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('server-side failure preserves the public cancellation contract without document metadata', async () => {
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
	const originalFetch = globalThis.fetch;
	const error = new Error('Server fetch failed');
	Reflect.deleteProperty(globalThis, 'document');
	globalThis.fetch = mock(() =>
		Promise.reject(error),
	) as unknown as typeof fetch;
	try {
		await expect(
			loadFont({
				family: 'SSR pending SDK',
				url: 'https://font.test/pending-sdk-ssr.woff2',
			}),
		).rejects.toBe(error);
		expect(errors.at(-1)).toBe(error);
		expect(registry.getPendingFontFaces()).toHaveLength(0);
	} finally {
		globalThis.fetch = originalFetch;
		if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
	}
});

test('native FontFace load failure clears pending state without registering bytes', async () => {
	const originalFetch = globalThis.fetch;
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'FontFace');
	const error = new Error('Native font rejected bytes');
	globalThis.fetch = mock(() =>
		Promise.resolve(new Response(new ArrayBuffer(1))),
	) as unknown as typeof fetch;
	class RejectedFontFace {
		load() {
			return Promise.reject(error);
		}
	}
	Object.defineProperty(globalThis, 'FontFace', {
		configurable: true,
		value: RejectedFontFace,
	});
	const url = 'https://font.test/pending-sdk-native-failure.woff2';
	const result = loadFont({family: 'Native failure SDK', url});
	const record = registry.getPendingFontFaces()[0];
	try {
		await expect(result).rejects.toBe(error);
		await expect(record.completion).rejects.toBe(error);
		expect(errors.at(-1)).toBe(error);
		expect(registry.getPendingFontFaces()).toHaveLength(0);
		expect(
			registry.getRegisteredFontFaces().some((face) => face.fontUrl === url),
		).toBe(false);
	} finally {
		globalThis.fetch = originalFetch;
		if (descriptor) Object.defineProperty(globalThis, 'FontFace', descriptor);
	}
});
