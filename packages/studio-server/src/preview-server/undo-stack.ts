import {installFileWatcher} from '../file-watcher';

interface UndoEntry {
	filePath: string;
	oldContents: string;
}

const MAX_ENTRIES = 100;
const stack: UndoEntry[] = [];
const suppressedWrites = new Set<string>();
const watchers = new Map<string, {unwatch: () => void}>();

export function pushToUndoStack(filePath: string, oldContents: string) {
	stack.push({filePath, oldContents});
	if (stack.length > MAX_ENTRIES) {
		stack.shift();
	}

	ensureWatching(filePath);
}

export function suppressUndoStackInvalidation(filePath: string) {
	suppressedWrites.add(filePath);
}

function ensureWatching(filePath: string) {
	if (watchers.has(filePath)) {
		return;
	}

	const watcher = installFileWatcher({
		file: filePath,
		onChange: () => {
			if (suppressedWrites.has(filePath)) {
				suppressedWrites.delete(filePath);
				return;
			}

			invalidateForFile(filePath);
		},
	});

	watchers.set(filePath, watcher);
}

function invalidateForFile(filePath: string) {
	let lastIndex = -1;
	for (let i = stack.length - 1; i >= 0; i--) {
		if (stack[i].filePath === filePath) {
			lastIndex = i;
			break;
		}
	}

	if (lastIndex !== -1) {
		stack.splice(0, lastIndex + 1);
	}

	cleanupWatchers();
}

function cleanupWatchers() {
	const filesInStack = new Set(stack.map((e) => e.filePath));
	for (const [filePath, watcher] of watchers) {
		if (!filesInStack.has(filePath)) {
			watcher.unwatch();
			watchers.delete(filePath);
		}
	}
}

export function getUndoStack(): readonly UndoEntry[] {
	return stack;
}
