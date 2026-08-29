import {expect, test} from 'bun:test';
import {handleCtrlC, registerCtrlCHandler} from '../cleanup-before-quit';

const waitForTask = () => new Promise((resolve) => setTimeout(resolve, 0));

test('Ctrl+C waits for a command-specific async handler', async () => {
	let releaseHandler: () => void = () => undefined;
	const waitUntilReleased = new Promise<void>((resolve) => {
		releaseHandler = resolve;
	});
	const exits: number[] = [];
	let handlerCalls = 0;
	const unregisterHandler = registerCtrlCHandler(async () => {
		handlerCalls++;
		await waitUntilReleased;
		return 130;
	});
	const unregisterListener = handleCtrlC({
		indent: false,
		logLevel: 'error',
		exit: (exitCode) => exits.push(exitCode),
	});

	try {
		process.emit('SIGINT', 'SIGINT');
		await waitForTask();
		expect(handlerCalls).toBe(1);
		expect(exits).toEqual([]);

		releaseHandler();
		await waitForTask();
		expect(exits).toEqual([130]);
	} finally {
		unregisterHandler();
		unregisterListener();
	}
});

test('a second Ctrl+C exits immediately', async () => {
	let releaseHandler: () => void = () => undefined;
	const waitUntilReleased = new Promise<void>((resolve) => {
		releaseHandler = resolve;
	});
	const exits: number[] = [];
	const unregisterHandler = registerCtrlCHandler(async () => {
		await waitUntilReleased;
		return 130;
	});
	const unregisterListener = handleCtrlC({
		indent: false,
		logLevel: 'error',
		exit: (exitCode) => exits.push(exitCode),
	});

	try {
		process.emit('SIGINT', 'SIGINT');
		await waitForTask();
		expect(exits).toEqual([]);

		process.emit('SIGINT', 'SIGINT');
		expect(exits).toEqual([130]);

		releaseHandler();
		await waitForTask();
		expect(exits).toEqual([130]);
	} finally {
		unregisterHandler();
		unregisterListener();
	}
});
