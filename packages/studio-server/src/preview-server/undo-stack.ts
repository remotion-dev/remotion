import {readFileSync, writeFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {installFileWatcher} from '../file-watcher';
import {suppressHmrForFile} from './hmr-suppression';
import {waitForLiveEventsListener} from './live-events';

interface UndoEntry {
	filePath: string;
	oldContents: string;
}

const MAX_ENTRIES = 100;
const undoStack: UndoEntry[] = [];
const redoStack: UndoEntry[] = [];
const suppressedWrites = new Map<string, number>();
const watchers = new Map<string, {unwatch: () => void}>();
let storedLogLevel: LogLevel = 'info';

function broadcastState() {
	const undoFile =
		undoStack.length > 0 ? undoStack[undoStack.length - 1].filePath : null;
	const redoFile =
		redoStack.length > 0 ? redoStack[redoStack.length - 1].filePath : null;

	waitForLiveEventsListener().then((listener) => {
		listener.sendEventToClient({
			type: 'undo-redo-stack-changed',
			undoFile,
			redoFile,
		});
	});
}

export function pushToUndoStack(
	filePath: string,
	oldContents: string,
	logLevel: LogLevel,
) {
	storedLogLevel = logLevel;
	undoStack.push({filePath, oldContents});
	if (undoStack.length > MAX_ENTRIES) {
		undoStack.shift();
	}

	redoStack.length = 0;

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		RenderInternals.chalk.gray(
			`Undo stack: added entry for ${filePath} (${undoStack.length} items)`,
		),
	);

	ensureWatching(filePath);
	broadcastState();
}

export function pushToRedoStack(filePath: string, oldContents: string) {
	redoStack.push({filePath, oldContents});
	if (redoStack.length > MAX_ENTRIES) {
		redoStack.shift();
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Redo stack: added entry for ${filePath} (${redoStack.length} items)`,
		),
	);

	ensureWatching(filePath);
	broadcastState();
}

export function suppressUndoStackInvalidation(filePath: string) {
	suppressedWrites.set(filePath, (suppressedWrites.get(filePath) ?? 0) + 1);
}

function ensureWatching(filePath: string) {
	if (watchers.has(filePath)) {
		return;
	}

	const watcher = installFileWatcher({
		file: filePath,
		onChange: () => {
			const count = suppressedWrites.get(filePath) ?? 0;
			if (count > 0) {
				if (count === 1) {
					suppressedWrites.delete(filePath);
				} else {
					suppressedWrites.set(filePath, count - 1);
				}

				return;
			}

			invalidateForFile(filePath);
		},
	});

	watchers.set(filePath, watcher);
}

function invalidateForFile(filePath: string) {
	let changed = false;

	let lastUndoIndex = -1;
	for (let i = undoStack.length - 1; i >= 0; i--) {
		if (undoStack[i].filePath === filePath) {
			lastUndoIndex = i;
			break;
		}
	}

	if (lastUndoIndex !== -1) {
		const removed = lastUndoIndex + 1;
		undoStack.splice(0, removed);
		changed = true;
		RenderInternals.Log.verbose(
			{indent: false, logLevel: storedLogLevel},
			RenderInternals.chalk.gray(
				`Undo stack: ${filePath} was externally modified, removed ${removed} entries (${undoStack.length} items)`,
			),
		);
	}

	let lastRedoIndex = -1;
	for (let i = redoStack.length - 1; i >= 0; i--) {
		if (redoStack[i].filePath === filePath) {
			lastRedoIndex = i;
			break;
		}
	}

	if (lastRedoIndex !== -1) {
		const removed = lastRedoIndex + 1;
		redoStack.splice(0, removed);
		changed = true;
		RenderInternals.Log.verbose(
			{indent: false, logLevel: storedLogLevel},
			RenderInternals.chalk.gray(
				`Redo stack: ${filePath} was externally modified, removed ${removed} entries (${redoStack.length} items)`,
			),
		);
	}

	cleanupWatchers();

	if (changed) {
		broadcastState();
	}
}

function cleanupWatchers() {
	const filesInStacks = new Set([
		...undoStack.map((e) => e.filePath),
		...redoStack.map((e) => e.filePath),
	]);
	for (const [filePath, watcher] of watchers) {
		if (!filesInStacks.has(filePath)) {
			watcher.unwatch();
			watchers.delete(filePath);
		}
	}
}

export function popUndo(): {success: true} | {success: false; reason: string} {
	const entry = undoStack.pop();
	if (!entry) {
		return {success: false, reason: 'Nothing to undo'};
	}

	const currentContents = readFileSync(entry.filePath, 'utf-8');
	redoStack.push({filePath: entry.filePath, oldContents: currentContents});

	suppressUndoStackInvalidation(entry.filePath);
	suppressHmrForFile(entry.filePath);
	writeFileSync(entry.filePath, entry.oldContents);

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Undo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);

	ensureWatching(entry.filePath);
	broadcastState();
	return {success: true};
}

export function popRedo(): {success: true} | {success: false; reason: string} {
	const entry = redoStack.pop();
	if (!entry) {
		return {success: false, reason: 'Nothing to redo'};
	}

	const currentContents = readFileSync(entry.filePath, 'utf-8');
	undoStack.push({filePath: entry.filePath, oldContents: currentContents});

	suppressUndoStackInvalidation(entry.filePath);
	suppressHmrForFile(entry.filePath);
	writeFileSync(entry.filePath, entry.oldContents);

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Redo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);

	ensureWatching(entry.filePath);
	broadcastState();
	return {success: true};
}

export function getUndoStack(): readonly UndoEntry[] {
	return undoStack;
}

export function getRedoStack(): readonly UndoEntry[] {
	return redoStack;
}
