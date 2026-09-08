import {afterEach, expect, test} from 'bun:test';
import {restartStudio} from '../api/restart-studio';
import {shutDownStudio} from '../api/shut-down-studio';
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

test.each([
	['restartStudio', restartStudio],
	['shutDownStudio', shutDownStudio],
] as const)(
	'%s rejects unsupported environments before making a request',
	(name, action) => {
		const fetchCalls: string[] = [];
		globalThis.fetch = ((input) => {
			fetchCalls.push(String(input));
			return Promise.reject(new Error('Unexpected request'));
		}) as typeof fetch;
		const studioWindow = {
			remotion_browserStudio: null as ReturnType<
				typeof makeBrowserStudioOperations
			> | null,
			remotion_isPlayer: false,
			remotion_isReadOnlyStudio: false,
			remotion_isStudio: false,
		};
		Object.defineProperty(globalThis, 'window', {
			configurable: true,
			value: studioWindow,
		});
		expect(() => action()).toThrow(`${name}() is only available in the Studio`);
		studioWindow.remotion_isStudio = true;
		studioWindow.remotion_browserStudio = makeBrowserStudioOperations({});
		expect(() => action()).toThrow(
			`${name}() is not supported in Browser Studio`,
		);
		studioWindow.remotion_browserStudio = null;
		studioWindow.remotion_isReadOnlyStudio = true;
		expect(() => action()).toThrow(
			`${name}() is not available in read-only Studio`,
		);
		expect(fetchCalls).toEqual([]);
	},
);
