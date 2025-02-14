import {expect, test} from 'bun:test';
import {startLongRunningCompositor} from '../compositor/compositor';

test('Should get Rust errors in a good way', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	try {
		await compositor.executeCommand('ExtractFrame', {
			src: 'invlaid',
			original_src: 'invlaid',
			time: 1,
			transparent: false,
			tone_mapped: false,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory',
		);
		expect((err as Error).message).toContain('remotion::');
	}

	await compositor.finishCommands();
	await compositor.waitForDone();
});

test('Handle panics', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});

	try {
		await compositor.executeCommand('DeliberatePanic', {});
	} catch (err) {
		expect((err as Error).message).toContain('Compositor exited with code 101');
		expect(
			(err as Error).message.includes(['rust', 'commands', 'mod'].join('/')) ||
				(err as Error).message.includes(['rust', 'commands', 'mod'].join('\\')),
		).toBeTruthy();
	}

	try {
		await compositor.executeCommand('DeliberatePanic', {});
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor quit: thread');
	}

	try {
		await compositor.finishCommands();
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor quit');
	}

	try {
		await compositor.waitForDone();
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor quit');
	}
});

test(
	'Non-long running task panics should be handled',
	async () => {
		const compositor = startLongRunningCompositor({
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			maximumFrameCacheItemsInBytes: null,
			extraThreads: 2,
		});

		try {
			await compositor.executeCommand('DeliberatePanic', {});
			throw new Error('should not be reached');
		} catch (err) {
			expect((err as Error).message).toContain("thread 'main' panicked");
		}
	},
	{retry: 2},
);

test(
	'Long running task failures should be handled',
	async () => {
		const compositor = startLongRunningCompositor({
			maximumFrameCacheItemsInBytes: null,
			logLevel: 'info',
			indent: false,
			binariesDirectory: null,
			extraThreads: 2,
		});

		try {
			await compositor.executeCommand('ExtractFrame', {
				src: 'fsdfds',
				original_src: 'fsdfds',
				time: 1,
				transparent: false,
				tone_mapped: false,
			});
			throw new Error('should not be reached');
		} catch (err) {
			expect((err as Error).message).toContain(
				'Compositor error: No such file or directory',
			);
			expect((err as Error).stack).toContain('remotion::');
		}

		await compositor.finishCommands();
		await compositor.waitForDone();
	},
	{retry: 2},
);

test('Invalid payloads will be handled', async () => {
	const compositor = startLongRunningCompositor({
		maximumFrameCacheItemsInBytes: null,
		logLevel: 'info',
		indent: false,
		binariesDirectory: null,
		extraThreads: 2,
	});
	try {
		// @ts-expect-error
		await compositor.executeCommand('ExtractFrame', {
			src: 'fsdfds',
			original_src: 'fsdfds',
			tone_mapped: false,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor exited with code 1: {"error":"missing field `time`',
		);
	}
});
