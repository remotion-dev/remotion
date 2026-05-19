import {readFileSync} from 'node:fs';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {parseAst} from '../codemods/parse-ast';
import {readVisualControlValues} from '../codemods/read-visual-control-values';
import {
	installFileWatcher,
	writeFileAndNotifyFileWatchers,
} from '../file-watcher';
import {formatLogFileLocation} from './format-log-file-location';
import {waitForLiveEventsListener} from './live-events';
import {suppressBundlerUpdateForFile} from './watch-ignore-next-change';

export interface UndoEntryDescription {
	undoMessage: string;
	redoMessage: string;
}

type UndoEntryType =
	| 'visual-control'
	| 'default-props'
	| 'sequence-props'
	| 'effect-props'
	| 'delete-jsx-node'
	| 'duplicate-jsx-node';

type UndoEntry = {
	filePath: string;
	oldContents: string;
	/** 1-based source line for terminal/IDE file links (e.g. path:line). */
	logLine: number;
	description: UndoEntryDescription;
	/** When true, undo/redo file restores call `suppressBundlerUpdateForFile` (skip HMR refresh). */
	suppressHmrOnFileRestore: boolean;
} & (
	| {entryType: 'visual-control'}
	| {entryType: 'default-props'}
	| {entryType: 'sequence-props'}
	| {entryType: 'effect-props'}
	| {entryType: 'delete-jsx-node'}
	| {entryType: 'duplicate-jsx-node'}
);

const MAX_ENTRIES = 100;
const undoStack: UndoEntry[] = [];
const redoStack: UndoEntry[] = [];
const suppressedWrites = new Map<string, number>();
const watchers = new Map<string, {unwatch: () => void}>();
let storedLogLevel: LogLevel = 'info';
let storedRemotionRoot: string | null = null;
let printedUndoHint = false;

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

export function pushToUndoStack({
	filePath,
	oldContents,
	logLevel,
	remotionRoot,
	logLine,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	filePath: string;
	oldContents: string;
	logLevel: LogLevel;
	remotionRoot: string;
	logLine: number;
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}) {
	storedLogLevel = logLevel;
	storedRemotionRoot = remotionRoot;
	undoStack.push({
		filePath,
		oldContents,
		logLine,
		description,
		entryType,
		suppressHmrOnFileRestore,
	});
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

export function printUndoHint(logLevel: LogLevel) {
	if (!printedUndoHint) {
		printedUndoHint = true;
		const shortcut = process.platform === 'darwin' ? 'Cmd+Z' : 'Ctrl+Z';
		RenderInternals.Log.info(
			{indent: false, logLevel},
			RenderInternals.chalk.gray(`Tip: ${shortcut} in Studio to undo`),
		);
	}
}

export function pushToRedoStack({
	filePath,
	oldContents,
	logLine,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	filePath: string;
	oldContents: string;
	logLine: number;
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}) {
	redoStack.push({
		filePath,
		oldContents,
		logLine,
		description,
		entryType,
		suppressHmrOnFileRestore,
	});
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
		existenceOnly: false,
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

function emitVisualControlChanges(fileContents: string) {
	try {
		const ast = parseAst(fileContents);
		const values = readVisualControlValues(ast);
		if (values.length > 0) {
			waitForLiveEventsListener().then((listener) => {
				listener.sendEventToClient({
					type: 'visual-control-values-changed',
					values,
				});
			});
		}
	} catch {
		// File might not contain visual controls or might not be parseable
	}
}

function logFileAction(action: string, filePath: string, logLine: number) {
	const locationLabel =
		storedRemotionRoot !== null
			? formatLogFileLocation({
					remotionRoot: storedRemotionRoot,
					absolutePath: filePath,
					line: logLine,
				})
			: `${filePath}:${logLine}`;
	RenderInternals.Log.info(
		{indent: false, logLevel: storedLogLevel},
		`${RenderInternals.chalk.blueBright(`${locationLabel}`)} ${action}`,
	);
}

export function popUndo(): {success: true} | {success: false; reason: string} {
	const entry = undoStack.pop();
	if (!entry) {
		return {success: false, reason: 'Nothing to undo'};
	}

	const currentContents = readFileSync(entry.filePath, 'utf-8');
	redoStack.push({
		filePath: entry.filePath,
		oldContents: currentContents,
		logLine: entry.logLine,
		description: entry.description,
		entryType: entry.entryType,
		suppressHmrOnFileRestore: entry.suppressHmrOnFileRestore,
	});

	suppressUndoStackInvalidation(entry.filePath);
	if (entry.suppressHmrOnFileRestore) {
		suppressBundlerUpdateForFile(entry.filePath);
	}

	writeFileAndNotifyFileWatchers(entry.filePath, entry.oldContents, undefined);

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Undo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);
	logFileAction(entry.description.undoMessage, entry.filePath, entry.logLine);

	if (entry.entryType === 'visual-control') {
		emitVisualControlChanges(entry.oldContents);
	}

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
	undoStack.push({
		filePath: entry.filePath,
		oldContents: currentContents,
		logLine: entry.logLine,
		description: entry.description,
		entryType: entry.entryType,
		suppressHmrOnFileRestore: entry.suppressHmrOnFileRestore,
	});

	suppressUndoStackInvalidation(entry.filePath);
	if (entry.suppressHmrOnFileRestore) {
		suppressBundlerUpdateForFile(entry.filePath);
	}

	writeFileAndNotifyFileWatchers(entry.filePath, entry.oldContents, undefined);

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Redo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);
	logFileAction(entry.description.redoMessage, entry.filePath, entry.logLine);

	if (entry.entryType === 'visual-control') {
		emitVisualControlChanges(entry.oldContents);
	}

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
