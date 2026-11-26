import {expect, spyOn, test} from 'bun:test';
import type {LaunchedBrowser} from '../../functions/get-browser-instance';
import * as routine from '../../functions/inner-routine';
import {fakeAws, fakeAwsDefaults, useFakeAws} from '../mocks/fake-aws';

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

test('finishes the previous browser cleanup before running the next test', () => {
	expect(browserClosed).toBe(true);
});

let handlerFinished = false;
let lateBrowserClosed = false;
let lateClose: Promise<void> | null = null;
let finishHandler: () => void;
const handlerDone = new Promise<void>((resolve) => {
	finishHandler = resolve;
});

test('starts streaming before the simulated handler finishes its cleanup', async () => {
	const handler = spyOn(routine, 'innerHandler').mockImplementationOnce(
		async () => {
			await new Promise<void>((resolve) => setTimeout(resolve, 0));
			fakeAwsDefaults.forgetBrowserEventLoop({
				launchedBrowser: {
					configurationString: 'late-cleanup-test',
					instance: {
						close: (_options: {silent: boolean}) => {
							lateClose = new Promise<void>((resolve) => {
								setTimeout(() => {
									lateBrowserClosed = true;
									resolve();
								}, 0);
							});
							return lateClose;
						},
					} as LaunchedBrowser['instance'],
				},
				logLevel: 'error',
			});
			handlerFinished = true;
			finishHandler();
		},
	);
	try {
		const result = await fakeAws().invokeWithResponseStream({
			region: 'eu-central-1',
			functionName: 'late-cleanup-test',
			payload: {},
			timeoutInMilliseconds: 1000,
			requestHandler: null,
			abortSignal: new AbortController().signal,
		});
		expect(result.EventStream).toBeDefined();
		expect(handlerFinished).toBe(false);
		expect(lateBrowserClosed).toBe(false);
	} finally {
		handler.mockRestore();
	}
});

test('finishes late handler and browser cleanup before the next test', async () => {
	try {
		expect(handlerFinished).toBe(true);
		expect(lateBrowserClosed).toBe(true);
	} finally {
		await handlerDone;
		await lateClose;
	}
});
