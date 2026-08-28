import {afterEach, expect, test} from 'bun:test';
import {getRoute, replaceUrl} from '../helpers/url-state';

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

test('uses query-string routing in Browser Studio', () => {
	const replaceStateCalls: unknown[][] = [];
	const parentWindow = {
		history: {
			replaceState: (...args: unknown[]) => replaceStateCalls.push(args),
		},
		location: {
			pathname: '/experimental_new',
			search: '?source=release',
		},
	};

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			parent: parentWindow,
			location: {
				pathname: 'blank',
				search: '?source=release',
			},
			remotion_browserStudio: {},
			remotion_isReadOnlyStudio: false,
		},
	});

	expect(getRoute()).toBe('');
	replaceUrl('/assets/other.mp4');
	expect(replaceStateCalls).toEqual([
		[{}, 'Studio', '/experimental_new?/assets/other.mp4&source=release'],
	]);
});
