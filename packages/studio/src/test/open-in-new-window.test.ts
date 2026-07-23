import {afterEach, expect, test} from 'bun:test';
import {getOpenInNewWindowMenuItem} from '../components/open-in-new-window';

const originalWindowDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	'window',
);

afterEach(() => {
	if (originalWindowDescriptor) {
		Object.defineProperty(globalThis, 'window', originalWindowDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, 'window');
	}
});

test('opens a Studio route in a centered popup', () => {
	const openCalls: unknown[][] = [];

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			location: {pathname: '/'},
			open: (...args: unknown[]) => openCalls.push(args),
			outerHeight: 1000,
			outerWidth: 1400,
			remotion_isReadOnlyStudio: false,
			screen: {
				availHeight: 1080,
				availLeft: 50,
				availTop: 25,
				availWidth: 1920,
			},
			screenX: 400,
			screenY: 100,
		},
	});

	const item = getOpenInNewWindowMenuItem('/assets/folder/image.png');
	item.onClick(item.id, null);

	expect(item.label).toBe('Open in new window');
	expect(openCalls).toEqual([
		[
			'/assets/folder/image.png',
			'_blank',
			'popup,width=1200,height=800,left=500,top=200',
		],
	]);
});
