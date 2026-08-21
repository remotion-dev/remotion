import {afterEach, expect, test} from 'bun:test';
import {restartStudio} from '../api/restart-studio';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

const originalFetch = globalThis.fetch;
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	globalThis.fetch = originalFetch;
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('rejects restarting Browser Studio without making a server request', () => {
	const fetchCalls: string[] = [];
	globalThis.fetch = ((input) => {
		fetchCalls.push(String(input));
		return Promise.reject(new Error('Unexpected request'));
	}) as typeof fetch;
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({}),
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: false,
			remotion_isStudio: true,
		},
	});

	expect(() => restartStudio()).toThrow(
		'restartStudio() is not supported in Browser Studio',
	);
	expect(fetchCalls).toEqual([]);
});
