import {expect, test} from 'bun:test';
import type {HeadlessBrowser} from '../browser/Browser';
import {handleBrowserCrash} from '../replace-browser';

const makeBrowser = (connected: boolean) => {
	return {
		close: () => Promise.resolve(),
		isConnected: () => connected,
	} as unknown as HeadlessBrowser;
};

test('A connected browser that was passed in is kept', () => {
	const replacer = handleBrowserCrash(makeBrowser(true), 'error', false, true);

	expect(replacer.canKeepBrowser()).toBe(true);
});

test('A browser that was passed in and died is not kept', () => {
	const replacer = handleBrowserCrash(makeBrowser(false), 'error', false, true);

	expect(replacer.canKeepBrowser()).toBe(false);
});

test('A browser that Remotion launched is not kept', () => {
	const replacer = handleBrowserCrash(makeBrowser(true), 'error', false, false);

	expect(replacer.canKeepBrowser()).toBe(false);
});

test('The replacement of a browser that was passed in is not kept', async () => {
	const replacer = handleBrowserCrash(makeBrowser(false), 'error', false, true);

	await replacer.replaceBrowser(
		() => Promise.resolve(makeBrowser(true)),
		() => Promise.resolve(),
	);

	expect(replacer.canKeepBrowser()).toBe(false);
});
