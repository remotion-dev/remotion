import {readFileSync} from 'node:fs';
import path from 'node:path';
import type {CanUpdateSequencePropsResponse} from '@remotion/studio-shared';
import {parseAst} from '../codemods/parse-ast';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {
	computeSequencePropsStatus,
	computeSequencePropsStatusFromAst,
} from './routes/can-update-sequence-props';

type PositionInfo = {
	fileName: string;
	line: number;
	column: number;
	keys: string[];
	remotionRoot: string;
	absolutePath: string;
	clientIds: Set<string>;
};

type FileWatcherInfo = {
	unwatch: () => void;
	watcherKeys: Set<string>;
};

// watcherKey (absolutePath:line:column) -> position info with subscribing clients
const positions = new Map<string, PositionInfo>();

// absolutePath -> single file watcher shared across all positions in that file
const fileWatchers = new Map<string, FileWatcherInfo>();

// clientId -> set of watcherKeys (for cleanup on disconnect)
const clientToWatcherKeys = new Map<string, Set<string>>();

const makeWatcherKey = ({
	absolutePath,
	line,
	column,
}: {
	absolutePath: string;
	line: number;
	column: number;
}): string => {
	return `${absolutePath}:${line}:${column}`;
};

const ensureFileWatcher = (absolutePath: string): void => {
	if (fileWatchers.has(absolutePath)) {
		return;
	}

	const {unwatch} = installFileWatcher({
		file: absolutePath,
		onChange: (type) => {
			if (type === 'deleted') {
				return;
			}

			const watcherInfo = fileWatchers.get(absolutePath);
			if (!watcherInfo) {
				return;
			}

			let ast;
			try {
				const fileContents = readFileSync(absolutePath, 'utf-8');
				ast = parseAst(fileContents);
			} catch (err) {
				for (const watcherKey of watcherInfo.watcherKeys) {
					const posInfo = positions.get(watcherKey);
					if (!posInfo) {
						continue;
					}

					waitForLiveEventsListener().then((listener) => {
						listener.sendEventToClient({
							type: 'sequence-props-updated',
							fileName: posInfo.fileName,
							line: posInfo.line,
							column: posInfo.column,
							result: {
								canUpdate: false as const,
								reason: (err as Error).message,
							},
						});
					});
				}

				return;
			}

			for (const watcherKey of watcherInfo.watcherKeys) {
				const posInfo = positions.get(watcherKey);
				if (!posInfo) {
					continue;
				}

				const result = computeSequencePropsStatusFromAst({
					ast,
					line: posInfo.line,
					keys: posInfo.keys,
				});

				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClient({
						type: 'sequence-props-updated',
						fileName: posInfo.fileName,
						line: posInfo.line,
						column: posInfo.column,
						result,
					});
				});
			}
		},
	});

	fileWatchers.set(absolutePath, {unwatch, watcherKeys: new Set()});
};

const removeClientFromPosition = (
	clientId: string,
	watcherKey: string,
): void => {
	const posInfo = positions.get(watcherKey);
	if (!posInfo) {
		return;
	}

	posInfo.clientIds.delete(clientId);

	if (posInfo.clientIds.size === 0) {
		positions.delete(watcherKey);

		const fileInfo = fileWatchers.get(posInfo.absolutePath);
		if (fileInfo) {
			fileInfo.watcherKeys.delete(watcherKey);

			if (fileInfo.watcherKeys.size === 0) {
				fileInfo.unwatch();
				fileWatchers.delete(posInfo.absolutePath);
			}
		}
	}
};

export const subscribeToSequencePropsWatchers = ({
	fileName,
	line,
	column,
	keys,
	remotionRoot,
	clientId,
}: {
	fileName: string;
	line: number;
	column: number;
	keys: string[];
	remotionRoot: string;
	clientId: string;
}): CanUpdateSequencePropsResponse => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const watcherKey = makeWatcherKey({absolutePath, line, column});

	ensureFileWatcher(absolutePath);

	let posInfo = positions.get(watcherKey);
	if (!posInfo) {
		posInfo = {
			fileName,
			line,
			column,
			keys,
			remotionRoot,
			absolutePath,
			clientIds: new Set(),
		};
		positions.set(watcherKey, posInfo);
		fileWatchers.get(absolutePath)!.watcherKeys.add(watcherKey);
	} else {
		posInfo.keys = keys;
	}

	posInfo.clientIds.add(clientId);

	if (!clientToWatcherKeys.has(clientId)) {
		clientToWatcherKeys.set(clientId, new Set());
	}

	clientToWatcherKeys.get(clientId)!.add(watcherKey);

	return computeSequencePropsStatus({
		fileName,
		line,
		keys,
		remotionRoot,
	});
};

export const unsubscribeFromSequencePropsWatchers = ({
	fileName,
	line,
	column,
	remotionRoot,
	clientId,
}: {
	fileName: string;
	line: number;
	column: number;
	remotionRoot: string;
	clientId: string;
}) => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const watcherKey = makeWatcherKey({absolutePath, line, column});

	removeClientFromPosition(clientId, watcherKey);

	const watcherKeys = clientToWatcherKeys.get(clientId);
	if (watcherKeys) {
		watcherKeys.delete(watcherKey);
		if (watcherKeys.size === 0) {
			clientToWatcherKeys.delete(clientId);
		}
	}
};

export const unsubscribeClientSequencePropsWatchers = (clientId: string) => {
	const watcherKeys = clientToWatcherKeys.get(clientId);
	if (!watcherKeys) {
		return;
	}

	for (const watcherKey of watcherKeys) {
		removeClientFromPosition(clientId, watcherKey);
	}

	clientToWatcherKeys.delete(clientId);
};
