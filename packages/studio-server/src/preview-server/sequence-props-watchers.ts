import path from 'node:path';
import {RenderInternals} from '@remotion/renderer';
import type {LogLevel} from '@remotion/renderer';
import {
	stringifySequenceSubscriptionKey,
	type SubscribeToSequencePropsResponse,
} from '@remotion/studio-shared';
import type {SequenceNodePath} from 'remotion';
import {installFileWatcher} from '../file-watcher';
import {waitForLiveEventsListener} from './live-events';
import {getCachedNodePath, setCachedNodePath} from './node-path-cache';
import {
	computeSequencePropsStatusFromContent,
	computeSequencePropsStatusFromFilenameByLine,
	computeSequencePropsStatus,
} from './routes/can-update-sequence-props';

type WatcherInfo = {
	unwatch: () => void;
	refCount: number;
};

const sequencePropsWatchers: Record<string, Record<string, WatcherInfo>> = {};

const getSequencePropsStatus = ({
	fileName,
	line,
	column,
	keys,
	effects,
	remotionRoot,
}: {
	fileName: string;
	line: number;
	column: number;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
}): SubscribeToSequencePropsResponse => {
	// Try cached nodePath first (handles stale source maps after suppressed rebuilds)
	const cachedNodePath = getCachedNodePath(fileName, line, column);

	if (cachedNodePath) {
		const cachedResult = computeSequencePropsStatus({
			fileName,
			nodePath: cachedNodePath,
			keys,
			effects,
			remotionRoot,
		});

		if (cachedResult.canUpdate) {
			return {
				status: cachedResult,
				nodePath: {
					absolutePath: fileName,
					nodePath: cachedNodePath,
					sequenceKeys: keys,
					effectKeys: effects,
				},
				success: true,
			};
		}
	}

	const status = computeSequencePropsStatusFromFilenameByLine({
		fileName,
		line,
		keys,
		effects,
		remotionRoot,
	});

	return status;
};

export const subscribeToSequencePropsWatchers = ({
	fileName,
	line,
	column,
	keys,
	effects,
	remotionRoot,
	clientId,
	logLevel,
}: {
	fileName: string;
	line: number;
	column: number;
	keys: string[];
	effects: string[][];
	remotionRoot: string;
	clientId: string;
	logLevel: LogLevel;
}): SubscribeToSequencePropsResponse => {
	const initialResult = getSequencePropsStatus({
		fileName,
		line,
		column,
		keys,
		effects,
		remotionRoot,
	});

	if (!initialResult.success) {
		return initialResult;
	}

	const absolutePath = path.resolve(remotionRoot, fileName);

	// Cache the resolved nodePath for future lookups with stale source maps
	setCachedNodePath(fileName, line, column, initialResult.nodePath.nodePath);

	const {nodePath} = initialResult;
	const watcherKey = stringifySequenceSubscriptionKey(nodePath);

	// If a watcher already exists for this key, just bump the ref count
	if (sequencePropsWatchers[clientId]?.[watcherKey]) {
		sequencePropsWatchers[clientId][watcherKey].refCount++;
		return initialResult;
	}

	const {unwatch} = installFileWatcher({
		file: absolutePath,
		existenceOnly: false,
		onChange: (event) => {
			if (event.type === 'deleted') {
				return;
			}

			try {
				const result = computeSequencePropsStatusFromContent({
					fileContents: event.content,
					nodePath: nodePath.nodePath,
					keys,
					effects,
				});
				const previousEffectChain = result.effects.map(
					(effect) => effect.canUpdate && effect.callee,
				);
				const newEffectChain =
					initialResult.success &&
					initialResult.status.effects.map(
						(effect) => effect.canUpdate && effect.callee,
					);
				if (previousEffectChain.join(',') !== newEffectChain.join(',')) {
					RenderInternals.Log.verbose(
						{indent: false, logLevel},
						'Effect chain changed, not sending "sequence-props-updated" event',
					);
					return;
				}

				waitForLiveEventsListener().then((listener) => {
					listener.sendEventToClientId(clientId, {
						type: 'sequence-props-updated',
						fileName,
						nodePath,
						result,
					});
				});
			} catch (error) {
				RenderInternals.Log.error({indent: false, logLevel}, error);
			}
		},
	});

	if (!sequencePropsWatchers[clientId]) {
		sequencePropsWatchers[clientId] = {};
	}

	sequencePropsWatchers[clientId][watcherKey] = {unwatch, refCount: 1};

	return initialResult;
};

export const unsubscribeFromSequencePropsWatchers = ({
	fileName,
	nodePath,
	remotionRoot,
	clientId,
	sequenceKeys,
	effectKeys,
}: {
	fileName: string;
	nodePath: SequenceNodePath;
	remotionRoot: string;
	clientId: string;
	sequenceKeys: string[];
	effectKeys: string[][];
}) => {
	const absolutePath = path.resolve(remotionRoot, fileName);
	const watcherKey = stringifySequenceSubscriptionKey({
		absolutePath,
		nodePath,
		sequenceKeys,
		effectKeys,
	});

	if (
		!sequencePropsWatchers[clientId] ||
		!sequencePropsWatchers[clientId][watcherKey]
	) {
		return;
	}

	sequencePropsWatchers[clientId][watcherKey].refCount--;
	if (sequencePropsWatchers[clientId][watcherKey].refCount <= 0) {
		sequencePropsWatchers[clientId][watcherKey].unwatch();
		delete sequencePropsWatchers[clientId][watcherKey];
	}
};

export const unsubscribeClientSequencePropsWatchers = (clientId: string) => {
	if (!sequencePropsWatchers[clientId]) {
		return;
	}

	Object.values(sequencePropsWatchers[clientId]).forEach((watcher) => {
		watcher.unwatch();
	});

	delete sequencePropsWatchers[clientId];
};
