import {mock} from 'bun:test';
import {EventEmitter} from 'node:events';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';
import type {Page} from '../../browser/BrowserPage';

const main = async () => {
	const mode = process.argv[2];
	const stack =
		'Error: fatal renderer state\n    at consumer (http://localhost/source.js:1:1)';
	const state: {
		remotion_renderReady: boolean;
		remotion_cancelledError: string | undefined;
	} = {
		remotion_renderReady: mode !== 'disposed',
		remotion_cancelledError:
			mode === 'cancelled' ? stack : mode === 'empty' ? '' : undefined,
	};
	let transportReads = 0;
	let terminated = 0;
	mock.module(resolve(__dirname, '../../puppeteer-evaluate.ts'), () => ({
		puppeteerEvaluateWithCatch: ({
			pageFunction,
		}: {
			pageFunction: () => unknown;
		}) =>
			Promise.resolve().then(() => {
				transportReads++;
				return {
					value: runInNewContext(`(${pageFunction.toString()})()`, {
						window: state,
					}),
				};
			}),
		puppeteerEvaluateWithCatchAndTimeout: () =>
			Promise.reject(new Error('Unexpected timeout transport')),
	}));
	const {waitForReady} = await import('../../seek-to-frame');
	const {PageEmittedEvents} = await import('../../browser/BrowserPage');
	const pageEvents = new EventEmitter();
	const browserEvents = new EventEmitter();
	const handles: object[] = [];
	let rejectTask: ((error: Error) => void) | null = null;
	const world = {
		waitForFunction: ({pageFunction}: {pageFunction: string}) => {
			const token = runInNewContext(pageFunction, {window: state});
			const handle = {toString: () => token};
			handles.push(handle);
			const promise = token
				? Promise.resolve(handle)
				: new Promise<object>((_, reject) => {
						rejectTask = reject;
					});
			return {
				promise,
				terminate: () => {
					terminated++;
					(rejectTask as ((error: Error) => void) | null)?.(
						new Error('cleanup'),
					);
				},
			};
		},
	};
	const page = Object.assign(pageEvents, {
		browser: browserEvents,
		mainFrame: () => ({_mainWorld: world}),
	}) as unknown as Page;
	const waiting = waitForReady({
		page,
		timeoutInMilliseconds: 30000,
		frame: null,
		indent: false,
		logLevel: 'error',
	});
	if (mode === 'disposed') pageEvents.emit(PageEmittedEvents.Disposed);
	let failure: unknown = null;
	let result: unknown = null;
	try {
		result = await waiting;
	} catch (error) {
		failure = error;
	}

	if (mode === 'cancelled' || mode === 'empty') {
		if (
			!(failure instanceof Error) ||
			failure.name !== 'CancelledError' ||
			failure.stack !== (mode === 'empty' ? '' : stack) ||
			transportReads !== 1
		)
			throw new Error(
				'Renderer accepted a ready token over its stored cancellation',
			);
	} else if (mode === 'disposed') {
		if (
			!(failure instanceof Error) ||
			failure.message !== 'Target closed (page disposed)'
		)
			throw new Error('Disposed policy changed');
	} else {
		if (failure || result !== handles[0])
			throw new Error('Ordinary ready capture did not resolve');
		state.remotion_cancelledError = stack;
		if ((await waiting) !== result)
			throw new Error('A completed capture was retroactively cancelled');
	}

	if (
		pageEvents.eventNames().length ||
		browserEvents.eventNames().length ||
		terminated !== 1
	)
		throw new Error('Waiter listeners or task were not released');
	process.stdout.write(
		JSON.stringify({
			mode,
			transportReads,
			terminated,
			storedStackRejected: mode === 'cancelled' || mode === 'empty',
		}) + '\n',
	);
	mock.restore();
};

main().catch((error: unknown) => {
	process.stderr.write(String(error) + '\n');
	process.exitCode = 1;
});
