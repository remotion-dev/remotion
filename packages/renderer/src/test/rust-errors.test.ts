import {expect, test} from 'vitest';
import {callCompositor, serializeCommand} from '../compositor/compose';
import {startLongRunningCompositor} from '../compositor/compositor';

test('Should get Rust errors in a good way', async () => {
	const compositor = startLongRunningCompositor();

	try {
		await compositor.executeCommand('ExtractFrame', {
			input: 'invlaid',
			time: 1,
			transparent: false,
		});
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory'
		);
		expect((err as Error).message).toContain('opened_video::open_stream');
	}
});

test('Handle panics', async () => {
	const compositor = startLongRunningCompositor();

	try {
		await compositor.executeCommand('DeliberatePanic', {});
	} catch (err) {
		expect((err as Error).message).toContain('Compositor panicked');
		expect((err as Error).message).toContain('/rust/commands/mod');
	}

	try {
		await compositor.executeCommand('DeliberatePanic', {});
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor already quit');
	}

	try {
		compositor.finishCommands();
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor already quit');
	}

	try {
		await compositor.waitForDone();
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor already quit');
	}
});

test('Non-long running task panics should be handled', async () => {
	const command = serializeCommand('DeliberatePanic', {});

	try {
		await callCompositor(JSON.stringify(command));
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain('Compositor panicked');
		expect((err as Error).message).toContain("thread 'main' panicked");
	}
});

test('Long running task failures should be handled', async () => {
	const command = serializeCommand('ExtractFrame', {
		input: 'fsdfds',
		time: 1,
		transparent: false,
	});
	try {
		await callCompositor(JSON.stringify(command));
		throw new Error('should not be reached');
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: No such file or directory'
		);
		expect((err as Error).stack).toContain('opened_video::open_stream');
	}
});

test('Invalid payloads will be handled', async () => {
	// @ts-expect-error
	const command = serializeCommand('ExtractFrame', {
		input: 'fsdfds',
	});
	try {
		await callCompositor(JSON.stringify(command));
	} catch (err) {
		expect((err as Error).message).toContain(
			'Compositor error: missing field `time`'
		);
	}
});
