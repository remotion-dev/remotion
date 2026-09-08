import {afterEach, describe, expect, test} from 'bun:test';
import {appendVideoFragment, isIosSafari} from '../video/video-fragment.js';

const IPHONE_SAFARI =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
// iPadOS 13+ with the default "Request Desktop Website" setting: the
// user agent is indistinguishable from macOS Safari.
const IPADOS_DESKTOP_MODE_SAFARI =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15';
const MAC_SAFARI = IPADOS_DESKTOP_MODE_SAFARI;
const MAC_CHROME =
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const setNavigator = ({
	userAgent,
	platform,
	maxTouchPoints,
}: {
	userAgent: string;
	platform: string;
	maxTouchPoints: number;
}) => {
	Object.defineProperty(window.navigator, 'userAgent', {
		value: userAgent,
		configurable: true,
	});
	Object.defineProperty(window.navigator, 'platform', {
		value: platform,
		configurable: true,
	});
	Object.defineProperty(window.navigator, 'maxTouchPoints', {
		value: maxTouchPoints,
		configurable: true,
	});
};

describe('isIosSafari', () => {
	afterEach(() => {
		for (const key of ['userAgent', 'platform', 'maxTouchPoints']) {
			// Restore the happy-dom prototype getters.
			delete (window.navigator as unknown as Record<string, unknown>)[key];
		}
	});

	test('iPhone Safari is iOS Safari', () => {
		setNavigator({
			userAgent: IPHONE_SAFARI,
			platform: 'iPhone',
			maxTouchPoints: 5,
		});
		expect(isIosSafari()).toBe(true);
	});

	test('iPad Safari in desktop mode (Macintosh user agent) is iOS Safari', () => {
		setNavigator({
			userAgent: IPADOS_DESKTOP_MODE_SAFARI,
			platform: 'MacIntel',
			maxTouchPoints: 5,
		});
		expect(isIosSafari()).toBe(true);
	});

	test('Desktop Safari on a Mac is not iOS Safari', () => {
		setNavigator({
			userAgent: MAC_SAFARI,
			platform: 'MacIntel',
			maxTouchPoints: 0,
		});
		expect(isIosSafari()).toBe(false);
	});

	test('Chrome on a Mac is not iOS Safari', () => {
		setNavigator({
			userAgent: MAC_CHROME,
			platform: 'MacIntel',
			maxTouchPoints: 0,
		});
		expect(isIosSafari()).toBe(false);
	});

	test('does not append a media fragment to blob URLs on iPad in desktop mode', () => {
		setNavigator({
			userAgent: IPADOS_DESKTOP_MODE_SAFARI,
			platform: 'MacIntel',
			maxTouchPoints: 5,
		});
		const blob = 'blob:https://example.com/0f5a3c1e';
		expect(
			appendVideoFragment({
				actualSrc: blob,
				actualFrom: -30,
				duration: 60,
				fps: 30,
			}),
		).toBe(blob);
	});

	test('still appends a media fragment to blob URLs on desktop Safari', () => {
		setNavigator({
			userAgent: MAC_SAFARI,
			platform: 'MacIntel',
			maxTouchPoints: 0,
		});
		expect(
			appendVideoFragment({
				actualSrc: 'blob:https://example.com/0f5a3c1e',
				actualFrom: -30,
				duration: 60,
				fps: 30,
			}),
		).toBe('blob:https://example.com/0f5a3c1e#t=1,2');
	});
});
