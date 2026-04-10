import {afterEach, beforeEach, expect, mock, spyOn, test} from 'bun:test';
import fs, {existsSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {FileChangeEvent} from '../file-watcher';
import {createFileWatcherRegistry} from '../file-watcher';

const tmpDir = os.tmpdir();

const waitFor = async (
	predicate: () => boolean,
	timeoutMs = 5_000,
	intervalMs = 50,
): Promise<void> => {
	const deadline = Date.now() + timeoutMs;
	while (!predicate()) {
		if (Date.now() >= deadline) {
			throw new Error(`waitFor timed out after ${timeoutMs}ms`);
		}

		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
};

let registry: ReturnType<typeof createFileWatcherRegistry>;
let tmpFile: string;

beforeEach(() => {
	registry = createFileWatcherRegistry();
	tmpFile = path.join(tmpDir, `file-watcher-test-${Date.now()}.txt`);
	writeFileSync(tmpFile, 'initial');
});

afterEach(() => {
	if (existsSync(tmpFile)) {
		unlinkSync(tmpFile);
	}
});

test('multiple watchers on the same file share a single OS watcher', () => {
	const watchFileSpy = spyOn(fs, 'watchFile');

	const cb1 = mock(() => {});
	const cb2 = mock(() => {});

	const w1 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb1,
	});
	const w2 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb2,
	});

	// Only one fs.watchFile call despite two subscribers
	expect(watchFileSpy).toHaveBeenCalledTimes(1);

	expect(w1.exists).toBe(true);
	expect(w2.exists).toBe(true);

	// writeFileAndNotifyFileWatchers should notify both
	registry.writeFileAndNotifyFileWatchers(tmpFile, 'updated');

	expect(cb1).toHaveBeenCalledTimes(1);
	expect(cb1).toHaveBeenCalledWith({type: 'changed', content: 'updated'});
	expect(cb2).toHaveBeenCalledTimes(1);
	expect(cb2).toHaveBeenCalledWith({type: 'changed', content: 'updated'});

	w1.unwatch();
	w2.unwatch();
	watchFileSpy.mockRestore();
});

test('OS watcher is only removed when last subscriber unwatches', () => {
	const unwatchFileSpy = spyOn(fs, 'unwatchFile');

	const cb1 = mock(() => {});
	const cb2 = mock(() => {});

	const w1 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb1,
	});
	const w2 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb2,
	});

	w1.unwatch();
	// First unwatch should NOT remove the OS watcher
	expect(unwatchFileSpy).toHaveBeenCalledTimes(0);

	w2.unwatch();
	// Last unwatch should remove the OS watcher
	expect(unwatchFileSpy).toHaveBeenCalledTimes(1);

	unwatchFileSpy.mockRestore();
});

test('unwatching one subscriber does not affect the other', () => {
	const cb1 = mock(() => {});
	const cb2 = mock(() => {});

	const w1 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb1,
	});
	const w2 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb2,
	});

	w1.unwatch();

	registry.writeFileAndNotifyFileWatchers(tmpFile, 'after-unwatch');

	expect(cb1).toHaveBeenCalledTimes(0);
	expect(cb2).toHaveBeenCalledTimes(1);
	expect(cb2).toHaveBeenCalledWith({type: 'changed', content: 'after-unwatch'});

	w2.unwatch();
});

test('writeFileAndNotifyFileWatchers passes content to subscribers', () => {
	let receivedEvent: FileChangeEvent | null = null;

	const w = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: (evt) => {
			receivedEvent = evt;
		},
	});

	registry.writeFileAndNotifyFileWatchers(tmpFile, 'hello world');

	const event = receivedEvent!;
	expect(event.type).toBe('changed');
	if (event.type !== 'changed') {
		throw new Error('unexpected');
	}

	expect(event.content).toBe('hello world');

	w.unwatch();
});

test('writeFileAndNotifyFileWatchers writes the file to disk', () => {
	const w = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: () => {},
	});

	registry.writeFileAndNotifyFileWatchers(tmpFile, 'disk content');

	expect(readFileSync(tmpFile, 'utf-8')).toBe('disk content');

	w.unwatch();
});

test('writeFileAndNotifyFileWatchers works even without watchers', () => {
	// Should not throw
	registry.writeFileAndNotifyFileWatchers(tmpFile, 'no watchers');

	expect(readFileSync(tmpFile, 'utf-8')).toBe('no watchers');
});

test('duplicate content from fs.watchFile is suppressed', async () => {
	const cb = mock(() => {});

	const w = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb,
	});

	// Simulate a write via our API — sets lastKnownContent
	registry.writeFileAndNotifyFileWatchers(tmpFile, 'new content');
	expect(cb).toHaveBeenCalledTimes(1);

	// Wait for fs.watchFile to poll (100ms interval + generous buffer)
	await new Promise((resolve) => setTimeout(resolve, 500));

	// The polled change should be suppressed since content is identical
	expect(cb).toHaveBeenCalledTimes(1);

	w.unwatch();
});

test('registries are isolated from each other', () => {
	const registry2 = createFileWatcherRegistry();

	const cb1 = mock(() => {});
	const cb2 = mock(() => {});

	const w1 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb1,
	});
	const w2 = registry2.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb2,
	});

	registry.writeFileAndNotifyFileWatchers(tmpFile, 'from registry 1');

	expect(cb1).toHaveBeenCalledTimes(1);
	expect(cb2).toHaveBeenCalledTimes(0);

	w1.unwatch();
	w2.unwatch();
});

test('exists returns false for non-existent file', () => {
	const nonExistent = path.join(tmpDir, `does-not-exist-${Date.now()}.txt`);

	const w = registry.installFileWatcher({
		file: nonExistent,
		existenceOnly: false,
		onChange: () => {},
	});

	expect(w.exists).toBe(false);

	w.unwatch();
});

test('existenceOnly does not read the file when content changes', async () => {
	const readSpy = spyOn(fs, 'readFileSync');

	const cb = mock(() => {});

	const w = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: true,
		onChange: cb,
	});

	await new Promise((resolve) => setTimeout(resolve, 500));

	writeFileSync(tmpFile, 'updated without reading');

	await new Promise((resolve) => setTimeout(resolve, 500));

	expect(readSpy).not.toHaveBeenCalled();

	w.unwatch();
	readSpy.mockRestore();
});

test('existenceOnly emits created with empty content when file appears', async () => {
	const newFile = path.join(tmpDir, `existence-created-${Date.now()}.txt`);

	const cb = mock(() => {});

	const w = registry.installFileWatcher({
		file: newFile,
		existenceOnly: true,
		onChange: cb,
	});

	expect(w.exists).toBe(false);

	writeFileSync(newFile, 'hello');

	await waitFor(() => cb.mock.calls.length > 0);

	expect(cb).toHaveBeenCalledWith({type: 'created', content: ''});

	w.unwatch();
	unlinkSync(newFile);
});

test('existenceOnly emits deleted when file is removed', async () => {
	const cb = mock(() => {});

	const w = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: true,
		onChange: cb,
	});

	expect(w.exists).toBe(true);

	unlinkSync(tmpFile);

	await waitFor(() => cb.mock.calls.length > 0);

	expect(cb).toHaveBeenCalledWith({type: 'deleted'});

	w.unwatch();
});

test('existenceOnly and content watchers on the same path use separate OS watchers', () => {
	const watchFileSpy = spyOn(fs, 'watchFile');

	const cb1 = mock(() => {});
	const cb2 = mock(() => {});

	const w1 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: true,
		onChange: cb1,
	});
	const w2 = registry.installFileWatcher({
		file: tmpFile,
		existenceOnly: false,
		onChange: cb2,
	});

	expect(watchFileSpy).toHaveBeenCalledTimes(2);

	w1.unwatch();
	w2.unwatch();
	watchFileSpy.mockRestore();
});
