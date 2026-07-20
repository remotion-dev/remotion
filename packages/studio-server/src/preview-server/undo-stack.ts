import {existsSync, rmSync, readFileSync} from 'node:fs';
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
	// Dead code for now: the Studio selection model cannot mix sequence props and
	// effect props yet, but this will be used once mixed prop selection is enabled.
	| 'keyframe-add'
	| 'keyframe-delete'
	| 'add-effect'
	| 'delete-effect'
	| 'duplicate-effect'
	| 'paste-effects'
	| 'reorder-effect'
	| 'reorder-sequence'
	| 'delete-jsx-node'
	| 'duplicate-jsx-node'
	| 'split-jsx-sequence'
	| 'insert-jsx-element'
	| 'delete-composition'
	| 'rename-composition'
	| 'update-composition-metadata'
	| 'new-composition'
	| 'duplicate-composition'
	| 'move-composition-to-folder'
	| 'new-folder'
	| 'delete-folder'
	| 'rename-folder';

type UndoEntrySnapshot = {
	filePath: string;
	oldContents: string | null;
	newContents: string | null;
	/** 1-based source line for terminal/IDE file links (e.g. path:line). */
	logLine: number;
};

type UndoEntry = {
	filePath: string;
	/** 1-based source line for terminal/IDE file links (e.g. path:line). */
	logLine: number;
	snapshots: UndoEntrySnapshot[];
	description: UndoEntryDescription;
	/** When true, undo/redo file restores call `suppressBundlerUpdateForFile` (skip HMR refresh). */
	suppressHmrOnFileRestore: boolean;
} & (
	| {entryType: 'visual-control'}
	| {entryType: 'default-props'}
	| {entryType: 'sequence-props'}
	| {entryType: 'effect-props'}
	| {entryType: 'keyframe-add'}
	| {entryType: 'keyframe-delete'}
	| {entryType: 'add-effect'}
	| {entryType: 'delete-effect'}
	| {entryType: 'duplicate-effect'}
	| {entryType: 'paste-effects'}
	| {entryType: 'reorder-effect'}
	| {entryType: 'reorder-sequence'}
	| {entryType: 'delete-jsx-node'}
	| {entryType: 'duplicate-jsx-node'}
	| {entryType: 'split-jsx-sequence'}
	| {entryType: 'insert-jsx-element'}
	| {entryType: 'delete-composition'}
	| {entryType: 'rename-composition'}
	| {entryType: 'update-composition-metadata'}
	| {entryType: 'new-composition'}
	| {entryType: 'duplicate-composition'}
	| {entryType: 'move-composition-to-folder'}
	| {entryType: 'new-folder'}
	| {entryType: 'delete-folder'}
	| {entryType: 'rename-folder'}
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

const entryTouchesFile = (entry: UndoEntry, filePath: string) => {
	return entry.snapshots.some((snapshot) => snapshot.filePath === filePath);
};

const getEntryFilePaths = (entry: UndoEntry) => {
	return entry.snapshots.map((snapshot) => snapshot.filePath);
};

const makeUndoEntry = ({
	snapshots,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	snapshots: UndoEntrySnapshot[];
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}): UndoEntry => {
	if (snapshots.length === 0) {
		throw new Error('Cannot create an undo entry without snapshots');
	}

	return {
		filePath: snapshots[0].filePath,
		logLine: snapshots[0].logLine,
		snapshots,
		description,
		entryType,
		suppressHmrOnFileRestore,
	};
};

export function pushToUndoStack({
	filePath,
	oldContents,
	newContents,
	logLevel,
	remotionRoot,
	logLine,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	filePath: string;
	oldContents: string;
	newContents: string | null;
	logLevel: LogLevel;
	remotionRoot: string;
	logLine: number;
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}) {
	pushTransactionToUndoStack({
		snapshots: [
			{
				filePath,
				oldContents,
				newContents,
				logLine,
			},
		],
		logLevel,
		remotionRoot,
		description,
		entryType,
		suppressHmrOnFileRestore,
	});
}

export function pushTransactionToUndoStack({
	snapshots,
	logLevel,
	remotionRoot,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	snapshots: Array<{
		filePath: string;
		oldContents: string | null;
		newContents: string | null;
		logLine: number;
	}>;
	logLevel: LogLevel;
	remotionRoot: string;
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}) {
	storedLogLevel = logLevel;
	storedRemotionRoot = remotionRoot;

	const entry = makeUndoEntry({
		snapshots,
		description,
		entryType,
		suppressHmrOnFileRestore,
	});
	undoStack.push(entry);
	if (undoStack.length > MAX_ENTRIES) {
		undoStack.shift();
	}

	redoStack.length = 0;

	RenderInternals.Log.verbose(
		{indent: false, logLevel},
		RenderInternals.chalk.gray(
			`Undo stack: added entry for ${entry.filePath} (${undoStack.length} items)`,
		),
	);

	for (const filePath of getEntryFilePaths(entry)) {
		ensureWatching(filePath);
	}

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
	newContents,
	logLine,
	description,
	entryType,
	suppressHmrOnFileRestore,
}: {
	filePath: string;
	oldContents: string;
	newContents: string | null;
	logLine: number;
	description: UndoEntryDescription;
	entryType: UndoEntryType;
	suppressHmrOnFileRestore: boolean;
}) {
	const entry = makeUndoEntry({
		snapshots: [
			{
				filePath,
				oldContents,
				newContents,
				logLine,
			},
		],
		description,
		entryType,
		suppressHmrOnFileRestore,
	});
	redoStack.push(entry);
	if (redoStack.length > MAX_ENTRIES) {
		redoStack.shift();
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Redo stack: added entry for ${entry.filePath} (${redoStack.length} items)`,
		),
	);

	for (const watchedFilePath of getEntryFilePaths(entry)) {
		ensureWatching(watchedFilePath);
	}

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
		if (entryTouchesFile(undoStack[i], filePath)) {
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
		if (entryTouchesFile(redoStack[i], filePath)) {
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
		...undoStack.flatMap(getEntryFilePaths),
		...redoStack.flatMap(getEntryFilePaths),
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

	const redoSnapshots = entry.snapshots.map((snapshot) => {
		return {
			...snapshot,
			newContents:
				snapshot.newContents ??
				(existsSync(snapshot.filePath)
					? readFileSync(snapshot.filePath, 'utf-8')
					: null),
		};
	});
	redoStack.push(
		makeUndoEntry({
			snapshots: redoSnapshots,
			description: entry.description,
			entryType: entry.entryType,
			suppressHmrOnFileRestore: entry.suppressHmrOnFileRestore,
		}),
	);
	if (redoStack.length > MAX_ENTRIES) {
		redoStack.shift();
	}

	for (const snapshot of entry.snapshots) {
		suppressUndoStackInvalidation(snapshot.filePath);
		if (entry.suppressHmrOnFileRestore) {
			suppressBundlerUpdateForFile(snapshot.filePath);
		}

		if (snapshot.oldContents === null) {
			rmSync(snapshot.filePath, {force: true});
		} else {
			writeFileAndNotifyFileWatchers(
				snapshot.filePath,
				snapshot.oldContents,
				undefined,
			);
		}
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Undo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);
	logFileAction(entry.description.undoMessage, entry.filePath, entry.logLine);

	if (entry.entryType === 'visual-control') {
		for (const snapshot of entry.snapshots) {
			if (snapshot.oldContents !== null) {
				emitVisualControlChanges(snapshot.oldContents);
			}
		}
	}

	for (const filePath of getEntryFilePaths(entry)) {
		ensureWatching(filePath);
	}

	broadcastState();
	return {success: true};
}

export function popRedo(): {success: true} | {success: false; reason: string} {
	const entry = redoStack.pop();
	if (!entry) {
		return {success: false, reason: 'Nothing to redo'};
	}

	const snapshotsWithNewContents: Array<
		UndoEntrySnapshot & {newContents: string}
	> = [];
	for (const snapshot of entry.snapshots) {
		if (snapshot.newContents === null) {
			return {success: false, reason: 'Redo entry is incomplete'};
		}

		snapshotsWithNewContents.push({
			...snapshot,
			newContents: snapshot.newContents,
		});
	}

	undoStack.push(
		makeUndoEntry({
			snapshots: snapshotsWithNewContents,
			description: entry.description,
			entryType: entry.entryType,
			suppressHmrOnFileRestore: entry.suppressHmrOnFileRestore,
		}),
	);
	if (undoStack.length > MAX_ENTRIES) {
		undoStack.shift();
	}

	for (const snapshot of snapshotsWithNewContents) {
		suppressUndoStackInvalidation(snapshot.filePath);
		if (entry.suppressHmrOnFileRestore) {
			suppressBundlerUpdateForFile(snapshot.filePath);
		}

		writeFileAndNotifyFileWatchers(
			snapshot.filePath,
			snapshot.newContents,
			undefined,
		);
	}

	RenderInternals.Log.verbose(
		{indent: false, logLevel: storedLogLevel},
		RenderInternals.chalk.gray(
			`Redo: restored ${entry.filePath} (undo: ${undoStack.length}, redo: ${redoStack.length})`,
		),
	);
	logFileAction(entry.description.redoMessage, entry.filePath, entry.logLine);

	if (entry.entryType === 'visual-control') {
		for (const snapshot of entry.snapshots) {
			if (snapshot.newContents !== null) {
				emitVisualControlChanges(snapshot.newContents);
			}
		}
	}

	for (const filePath of getEntryFilePaths(entry)) {
		ensureWatching(filePath);
	}

	broadcastState();
	return {success: true};
}

/*
 * Keep stack accessors typed as readonly arrays so callers can only inspect
 * whether undo/redo is available and which file represents the top entry.
 */
export function getUndoStack(): readonly UndoEntry[] {
	return undoStack;
}

export function getRedoStack(): readonly UndoEntry[] {
	return redoStack;
}

export function clearUndoStackForTests() {
	undoStack.length = 0;
	redoStack.length = 0;
	suppressedWrites.clear();
	cleanupWatchers();
}
