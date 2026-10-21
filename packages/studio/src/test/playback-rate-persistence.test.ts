import {afterEach, beforeEach, expect, test} from 'bun:test';
import {loadPlaybackRate, persistPlaybackRate} from '../state/playbackrate';

const storage = new Map<string, string>();

// Bun runs all test files in one process, so restore the globals afterwards
// instead of leaving them deleted for the files that run next.
const stubbedGlobals = ['window', 'localStorage'] as const;
let originalDescriptors: (PropertyDescriptor | undefined)[] = [];

beforeEach(() => {
	originalDescriptors = stubbedGlobals.map((name) =>
		Object.getOwnPropertyDescriptor(globalThis, name),
	);
	storage.clear();
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: globalThis,
	});
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => {
				storage.set(key, value);
			},
		},
	});
});

afterEach(() => {
	stubbedGlobals.forEach((name, i) => {
		const descriptor = originalDescriptors[i];
		if (descriptor) {
			Object.defineProperty(globalThis, name, descriptor);
		} else {
			Reflect.deleteProperty(globalThis, name);
		}
	});
});

test('restores a persisted playback rate in the browser', () => {
	persistPlaybackRate(0.5);
	expect(loadPlaybackRate()).toBe(0.5);
});

test('restores a persisted negative playback rate', () => {
	persistPlaybackRate(-2);
	expect(loadPlaybackRate()).toBe(-2);
});

test('falls back to 1 when no playback rate was persisted', () => {
	const readKeys: string[] = [];
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: (key: string) => {
				readKeys.push(key);
				return null;
			},
		},
	});
	expect(loadPlaybackRate()).toBe(1);
	expect(readKeys).toEqual(['remotion.playbackrate']);
});

test('falls back to 1 when the persisted value is not a supported playback rate', () => {
	for (const invalid of ['abc', '', '0', 'Infinity', '3']) {
		storage.set('remotion.playbackrate', invalid);
		expect(loadPlaybackRate()).toBe(1);
	}
});

test('falls back to 1 without reading storage when there is no window', () => {
	Reflect.deleteProperty(globalThis, 'window');
	Object.defineProperty(globalThis, 'localStorage', {
		configurable: true,
		value: {
			getItem: () => {
				throw new Error('localStorage should not be read');
			},
		},
	});
	expect(loadPlaybackRate()).toBe(1);
});
