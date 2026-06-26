import path from 'node:path';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {
	stringifySequenceSubscriptionKey,
	type SubscribeToSequencePropsResponse,
} from '@remotion/studio-shared';
import type {JsxComponentIdentity, SequenceNodePath} from 'remotion';
import {installFileWatcher} from '../file-watcher';
import {JsxElementIdentityMismatchError} from './jsx-component-identity';
import {JsxElementNotFoundAtLocationError} from './jsx-element-not-found-at-location-error';
import {waitForLiveEventsListener} from './live-events';
import {getCachedNodePath, setCachedNodePath} from './node-path-cache';
import {
	computeSequencePropsStatus,
	computeSequencePropsStatusFromContent,
	computeSequencePropsStatusFromFilenameByLine,
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
	preferredNodePath,
	componentIdentity,
	keys,
	effects,
	runtimeValues,
	runtimeIdentifierValues,
	remotionRoot,
	logLevel,
}: {
	fileName: string;
	line: number;
	column: number;
	preferredNodePath: SequenceNodePath | null;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
	runtimeValues: Record<string, unknown>;
	runtimeIdentifierValues: Record<string, number>;
	remotionRoot: string;
	logLevel: LogLevel;
}): SubscribeToSequencePropsResponse => {
	if (preferredNodePath) {
		try {
			const fromNodePath = computeSequencePropsStatus({
				fileName,
				nodePath: preferredNodePath,
				componentIdentity,
				keys,
				effects,
				runtimeValues,
				runtimeIdentifierValues,
				remotionRoot,
			});
			return {
				status: fromNodePath,
				nodePath: {
					absolutePath: path.resolve(remotionRoot, fileName),
					nodePath: preferredNodePath,
					sequenceKeys: keys,
					effectKeys: effects,
				},
				success: true,
			};
		} catch (error) {
			if (
				!(
					error instanceof JsxElementIdentityMismatchError ||
					error instanceof JsxElementNotFoundAtLocationError
				)
			) {
				throw error;
			}
		}
	}

	// Try cached nodePath first (handles stale source maps after suppressed rebuilds)
	const cachedNodePath = getCachedNodePath(fileName, line, column);

	if (cachedNodePath) {
		const cachedResult = (() => {
			try {
				return computeSequencePropsStatus({
					fileName,
					nodePath: cachedNodePath,
					componentIdentity,
					keys,
					effects,
					runtimeValues,
					runtimeIdentifierValues,
					remotionRoot,
				});
			} catch (error) {
				if (
					error instanceof JsxElementIdentityMismatchError ||
					error instanceof JsxElementNotFoundAtLocationError
				) {
					return null;
				}

				throw error;
			}
		})();

		if (cachedResult?.canUpdate) {
			return {
				status: cachedResult,
				nodePath: {
					absolutePath: path.resolve(remotionRoot, fileName),
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
		componentIdentity,
		keys,
		effects,
		runtimeValues,
		runtimeIdentifierValues,
		remotionRoot,
		logLevel,
	});

	return status;
};

export const subscribeToSequencePropsWatchers = ({
	fileName,
	line,
	column,
	nodePath: preferredNodePath,
	componentIdentity,
	keys,
	effects,
	runtimeValues,
	runtimeIdentifierValues,
	remotionRoot,
	clientId,
	logLevel,
}: {
	fileName: string;
	line: number;
	column: number;
	nodePath: SequenceNodePath | null;
	componentIdentity: JsxComponentIdentity | null;
	keys: string[];
	effects: string[][];
	runtimeValues: Record<string, unknown>;
	runtimeIdentifierValues: Record<string, number>;
	remotionRoot: string;
	clientId: string;
	logLevel: LogLevel;
}): SubscribeToSequencePropsResponse => {
	const initialResult = getSequencePropsStatus({
		fileName,
		line,
		column,
		preferredNodePath,
		componentIdentity,
		keys,
		effects,
		runtimeValues,
		runtimeIdentifierValues,
		remotionRoot,
		logLevel,
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

			if (event.originatorClientId === clientId) {
				return;
			}

			try {
				const result = computeSequencePropsStatusFromContent({
					fileContents: event.content,
					nodePath: nodePath.nodePath,
					componentIdentity,
					keys,
					effects,
					runtimeValues,
					runtimeIdentifierValues,
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
				if (
					error instanceof JsxElementNotFoundAtLocationError ||
					error instanceof JsxElementIdentityMismatchError
				) {
					waitForLiveEventsListener().then((listener) => {
						listener.sendEventToClientId(clientId, {
							type: 'lost-node-path',
							fileName,
							line,
							column,
						});
					});
					return;
				}

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
