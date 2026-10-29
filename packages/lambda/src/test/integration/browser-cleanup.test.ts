import {expect, test} from 'bun:test';
import type {LaunchedBrowser} from '../../functions/get-browser-instance';
import {fakeAws, useFakeAws} from '../mocks/fake-aws';

useFakeAws();

let browserClosed = false;

test('starts asynchronous cleanup when a simulated Lambda releases its browser', () => {
	const instance = {
		close: (_options: {silent: boolean}) =>
			new Promise<void>((resolve) => {
				setTimeout(() => {
					browserClosed = true;
					resolve();
				}, 100);
			}),
	} as LaunchedBrowser['instance'];

	fakeAws().forgetBrowserEventLoop({
		launchedBrowser: {instance, configurationString: 'cleanup-test'},
		logLevel: 'error',
	});
	expect(browserClosed).toBe(false);
});

// Separate tests exercise the teardown boundary that precedes CLI SIGINT tests.
test('finishes the previous browser cleanup before running the next test', () => {
	expect(browserClosed).toBe(true);
});
