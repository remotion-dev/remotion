import {getAllSchemaKeys, getAssetSchemaKeys} from '@remotion/studio-shared';
import type {
	JsxComponentIdentity,
	SequenceNodePath,
	InteractivitySchema,
	VideoConfigValues,
} from 'remotion';
import {Internals} from 'remotion';
import {
	subscribeToSequenceProps,
	unsubscribeFromSequenceProps,
} from '../sequence-props-api';

type Key = string;

// The generated stack distinguishes Fast Refresh instances even when source maps
// resolve both the old and new JSX nodes to the same line and column.
const makeKey = ({
	fileName,
	line,
	column,
	componentIdentity,
	sequenceKeys,
	assetKeys,
	effectKeys,
	videoConfigValues,
	stack,
}: {
	fileName: string;
	line: number;
	column: number;
	componentIdentity: JsxComponentIdentity | null;
	sequenceKeys: string[];
	assetKeys: string[];
	effectKeys: string[][];
	videoConfigValues: VideoConfigValues;
	stack: string | null;
}): Key =>
	`${fileName}\0${line}\0${column}\0${componentIdentity ?? ''}\0${sequenceKeys.join('\0')}\0${assetKeys.join('\0')}\0${effectKeys.map((keys) => keys.join('\0')).join('\0\0')}\0${JSON.stringify(videoConfigValues)}\0${stack ?? ''}`;

type SubscribeResult = Awaited<ReturnType<typeof subscribeToSequenceProps>>;

type ApplyResult = (result: SubscribeResult) => void;

type Entry = {
	refCount: number;
	promise: Promise<SubscribeResult>;
	fileName: string;
	clientId: string;
	applyOnce: ApplyResult | null;
};

const entries = new Map<Key, Entry>();
const refreshListeners = new Map<string, Set<() => void>>();

export const subscribeToSequencePropsRefresh = (
	overrideId: string,
	listener: () => void,
): (() => void) => {
	const listeners = refreshListeners.get(overrideId) ?? new Set();
	listeners.add(listener);
	refreshListeners.set(overrideId, listeners);

	return () => {
		listeners.delete(listener);
		if (listeners.size === 0) {
			refreshListeners.delete(overrideId);
		}
	};
};

export const refreshSequencePropsSubscription = (overrideId: string): void => {
	for (const listener of refreshListeners.get(overrideId) ?? []) {
		listener();
	}
};

export const acquireSequencePropsSubscription = ({
	fileName,
	line,
	column,
	schema,
	componentIdentity,
	effects,
	nodePath,
	clientId,
	applyOnce,
	applyEach,
	videoConfigValues,
	stack,
}: {
	fileName: string;
	line: number;
	column: number;
	schema: InteractivitySchema;
	componentIdentity: JsxComponentIdentity | null;
	effects: InteractivitySchema[];
	nodePath: SequenceNodePath | null;
	clientId: string;
	applyOnce: ApplyResult;
	applyEach: ApplyResult;
	videoConfigValues: VideoConfigValues;
	stack: string | null;
}): {release: () => void} => {
	const sequenceKeys = getAllSchemaKeys(schema);
	const assetKeys = getAssetSchemaKeys(schema);
	const effectKeys = effects.map((effect) => getAllSchemaKeys(effect));
	const key = makeKey({
		fileName,
		line,
		column,
		componentIdentity,
		sequenceKeys,
		assetKeys,
		effectKeys,
		videoConfigValues,
		stack,
	});
	let entry = entries.get(key);

	if (!entry) {
		const promise = subscribeToSequenceProps({
			fileName,
			line,
			column,
			nodePath,
			componentIdentity,
			keys: getAllSchemaKeys(schema),
			assetKeys,
			effects: effectKeys,
			clientId,
			videoConfigValues,
		});
		const created: Entry = {
			refCount: 0,
			promise,
			fileName,
			clientId,
			applyOnce,
		};
		entries.set(key, created);
		entry = created;

		promise
			.then((result) => {
				const current = entries.get(key);
				if (current !== created || !current.applyOnce) {
					return;
				}

				const cb = current.applyOnce;
				current.applyOnce = null;
				cb(result);
			})
			.catch((err) => {
				const current = entries.get(key);
				if (current !== created) {
					return;
				}

				current.applyOnce = null;
				Internals.Log.error(err);
			});
	}

	entry.refCount++;
	const acquired = entry;

	acquired.promise.then(applyEach).catch(() => {
		// Error already logged by the first acquirer.
	});

	let released = false;
	return {
		release: () => {
			if (released) {
				return;
			}

			released = true;
			acquired.refCount--;

			if (acquired.refCount > 0) {
				return;
			}

			if (entries.get(key) === acquired) {
				entries.delete(key);
			}

			acquired.promise
				.then((result) => {
					if (!result.success) {
						return;
					}

					return unsubscribeFromSequenceProps({
						fileName: acquired.fileName,
						nodePath: result.nodePath,
						clientId: acquired.clientId,
						sequenceKeys,
						assetKeys,
						effectKeys,
					});
				})
				.catch(() => {
					// Ignore — either the subscribe failed (nothing to clean up) or
					// the unsubscribe failed (server-side TTL will handle it).
				});
		},
	};
};
