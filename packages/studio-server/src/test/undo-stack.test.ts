import {expect, test} from 'bun:test';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {
	createFileWatcherRegistry,
	setFileWatcherRegistry,
} from '../file-watcher';
import {setLiveEventsListener} from '../preview-server/live-events';
import {
	clearUndoStackForTests,
	popRedo,
	popUndo,
	pushTransactionToUndoStack,
} from '../preview-server/undo-stack';

test('undo and redo restore every file in a transaction', () => {
	const cleanupFileWatcher = setFileWatcherRegistry(
		createFileWatcherRegistry(),
	);
	const cleanupLiveEvents = setLiveEventsListener({
		addNewClientListener: () => () => undefined,
		closeConnections: () => Promise.resolve(),
		router: () => Promise.resolve(),
		sendEventToClient: () => undefined,
		sendEventToClientId: () => true,
	});
	const dir = mkdtempSync(join(tmpdir(), 'remotion-undo-stack-'));
	const firstFile = join(dir, 'first.tsx');
	const secondFile = join(dir, 'second.tsx');

	try {
		writeFileSync(firstFile, 'new first');
		writeFileSync(secondFile, 'new second');

		pushTransactionToUndoStack({
			snapshots: [
				{
					filePath: firstFile,
					oldContents: 'old first',
					newContents: 'new first',
					logLine: 1,
				},
				{
					filePath: secondFile,
					oldContents: 'old second',
					newContents: 'new second',
					logLine: 1,
				},
			],
			logLevel: 'error',
			remotionRoot: dir,
			description: {
				undoMessage: 'Undo test transaction',
				redoMessage: 'Redo test transaction',
			},
			entryType: 'sequence-props',
			suppressHmrOnFileRestore: true,
		});

		expect(popUndo()).toEqual({success: true});
		expect(readFileSync(firstFile, 'utf-8')).toBe('old first');
		expect(readFileSync(secondFile, 'utf-8')).toBe('old second');

		expect(popRedo()).toEqual({success: true});
		expect(readFileSync(firstFile, 'utf-8')).toBe('new first');
		expect(readFileSync(secondFile, 'utf-8')).toBe('new second');
	} finally {
		clearUndoStackForTests();
		cleanupLiveEvents();
		cleanupFileWatcher();
		rmSync(dir, {force: true, recursive: true});
	}
});
