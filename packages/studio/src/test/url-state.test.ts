import {afterEach, expect, test} from 'bun:test';
import {replaceUrl} from '../helpers/url-state';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
		return;
	}

	Reflect.deleteProperty(globalThis, 'window');
});

test('replaces the current Studio URL', () => {
	const replaceStateCalls: unknown[][] = [];

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			history: {
				replaceState: (...args: unknown[]) => replaceStateCalls.push(args),
			},
			location: {pathname: '/'},
			remotion_isReadOnlyStudio: false,
		},
	});

	replaceUrl('/assets/renamed.mp4');

	expect(replaceStateCalls).toEqual([[{}, 'Studio', '/assets/renamed.mp4']]);
});
