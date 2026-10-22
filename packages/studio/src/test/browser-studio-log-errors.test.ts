import {afterEach, expect, test} from 'bun:test';
import {logStudioErrorData} from '../error-overlay/remotion-overlay/log-studio-error';
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

test('does not send Studio errors to the server from Browser Studio', () => {
	const fetchCalls: string[] = [];
	globalThis.fetch = ((input) => {
		fetchCalls.push(String(input));
		return Promise.reject(new Error('Unexpected request'));
	}) as typeof fetch;
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			remotion_browserStudio: makeBrowserStudioOperations({}),
		},
	});

	logStudioErrorData({
		message: 'Browser Studio error',
		name: 'Error',
		stack: 'stack',
		symbolicatedStackFrames: null,
	});

	expect(fetchCalls).toEqual([]);
});
