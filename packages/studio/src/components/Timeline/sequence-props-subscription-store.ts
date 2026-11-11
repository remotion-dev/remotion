import {
	getAllSchemaKeys,
	getAssetSchemaKeys,
	type UnsubscribeFromSequencePropsRequest,
	type UpdateSequencePropsSubscriptionRequest,
	type SequencePropsSubscriptionUpdate,
} from '@remotion/studio-shared';
import type {
	JsxComponentIdentity,
	SequenceNodePath,
	SequencePropsSubscriptionKey,
	InteractivitySchema,
} from 'remotion';
import {Internals} from 'remotion';
import {SequenceSourceReadCancelledError} from '../../helpers/sequence-node-path-mutations';
import {waitForSourceMutationQueue} from '../../helpers/source-mutation-queue';
import {
	subscribeToSequenceProps,
	unsubscribeFromSequenceProps,
	updateSequencePropsSubscription,
} from '../sequence-props-api';

type Key = string;

// The generated stack distinguishes Fast Refresh instances even when source maps
// resolve both the old and new JSX nodes to the same line and column.
const makeKey = ({
	fileName,
	clientId,
	line,
	column,
	componentIdentity,
	sequenceKeys,
	assetKeys,
	effectKeys,
	stack,
}: {
	fileName: string;
	clientId: string;
	line: number;
	column: number;
	componentIdentity: JsxComponentIdentity | null;
	sequenceKeys: string[];
	assetKeys: string[];
	effectKeys: string[][];
	stack: string | null;
}): Key =>
	`${clientId}\0${fileName}\0${line}\0${column}\0${componentIdentity ?? ''}\0${sequenceKeys.join('\0')}\0${assetKeys.join('\0')}\0${effectKeys.map((keys) => keys.join('\0')).join('\0\0')}\0${stack ?? ''}`;

type SubscribeResult = Awaited<ReturnType<typeof subscribeToSequenceProps>>;

type ApplyResult = (result: SubscribeResult) => void;

type Subscriber = {applyOnce: ApplyResult; applyEach: ApplyResult};

type Metadata = {effects: string[][]; sourceRevision: string | null};

type Entry = {
	promise: Promise<SubscribeResult>;
	subscription: Promise<UnsubscribeFromSequencePropsRequest | null>;
	listeners: Set<Subscriber>;
	metadataKey: string;
	resolvedSubscription: UnsubscribeFromSequencePropsRequest | null;
	pending: Metadata | null;
	updating: boolean;
	editResults: Map<string, {effects: string[][]; result: SubscribeResult}>;
};

const applyResult = (entry: Entry, result: SubscribeResult) => {
	entry.listeners.values().next().value?.applyOnce(result);
	for (const listener of entry.listeners) listener.applyEach(result);
};

const entries = new Map<Key, Entry>();
export const getSequencePropsForEffectEdit = (
	nodes: {nodePath: SequencePropsSubscriptionKey; effects: string[][]}[],
): UpdateSequencePropsSubscriptionRequest[] => {
	if (nodes.length === 0) return [];
	const requests = [...entries.values()].map((entry) => {
		const subscription = entry.resolvedSubscription;
		if (!subscription || entry.listeners.size === 0) return null;
		const node = nodes.find(
			({nodePath}) =>
				nodePath.absolutePath === subscription.nodePath.absolutePath &&
				JSON.stringify(nodePath.nodePath) ===
					JSON.stringify(subscription.nodePath.nodePath),
		);
		return node ? {subscription, effects: node.effects} : null;
	});
	return requests.filter((request) => request !== null);
};

export const receiveSequencePropsFromEffectEdit = (
	mutationId: string,
	updates: SequencePropsSubscriptionUpdate[],
) => {
	for (const entry of entries.values()) {
		const subscription = entry.resolvedSubscription;
		if (!subscription || entry.listeners.size === 0) continue;
		const update = updates.find(
			({request}) =>
				JSON.stringify(request.subscription) === JSON.stringify(subscription),
		);
		if (update)
			entry.editResults.set(mutationId, {
				effects: update.request.effects,
				result: update.result,
			});
	}
};

type SequencePropsRefresh =
	| {type: 'source'; nodePath: SequenceNodePath | null}
	| {type: 'effects'; mutationId: string; refreshing: boolean}
	| {type: 'preserve-source'}
	| {type: 'refresh-finished'}
	| {type: 'refresh-start'; mutationId: string | null};
type RefreshListener = (refresh: SequencePropsRefresh) => void;
const refreshListeners = new Map<string, Set<RefreshListener>>();

export const subscribeToSequencePropsRefresh = (
	overrideId: string,
	listener: RefreshListener,
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

export const refreshSequencePropsSubscription = (
	overrideId: string | null,
	refresh: SequencePropsRefresh,
): void => {
	const listenerSets =
		overrideId === null
			? refreshListeners.values()
			: [refreshListeners.get(overrideId)];
	for (const listeners of listenerSets) {
		for (const listener of listeners ?? []) listener(refresh);
	}
};

export const acquireSequencePropsSubscription = ({
	fileName,
	line,
	column,
	schema,
	componentIdentity,
	effects,
	sourceRevision,
	nodePath,
	clientId,
	applyOnce,
	applyEach,

	stack,
}: {
	fileName: string;
	line: number;
	column: number;
	schema: InteractivitySchema;
	componentIdentity: JsxComponentIdentity | null;
	effects: InteractivitySchema[];
	sourceRevision: string | null;
	nodePath: SequenceNodePath | null;
	clientId: string;
	applyOnce: ApplyResult;
	applyEach: ApplyResult;

	stack: string | null;
}): {release: () => void; updateMetadata: (metadata: Metadata) => void} => {
	const sequenceKeys = getAllSchemaKeys(schema);
	const assetKeys = getAssetSchemaKeys(schema);
	const effectKeys = effects.map((effect) => getAllSchemaKeys(effect));
	const key = makeKey({
		fileName,
		clientId,
		line,
		column,
		componentIdentity,
		sequenceKeys,
		assetKeys,
		effectKeys,
		stack,
	});
	let entry = entries.get(key);

	if (!entry) {
		const promise = subscribeToSequenceProps(
			{
				fileName,
				line,
				column,
				nodePath,
				componentIdentity,
				keys: sequenceKeys,
				assetKeys,
				effects: effectKeys,
				clientId,
			},
			stack,
		);
		const created: Entry = {
			promise,
			subscription: promise.then((result) =>
				result.success
					? {
							fileName,
							nodePath: result.nodePath,
							clientId,
							sequenceKeys,
							assetKeys,
							effectKeys,
						}
					: null,
			),
			listeners: new Set(),
			resolvedSubscription: null,
			metadataKey: JSON.stringify({effects: effectKeys, sourceRevision}),
			pending: null,
			updating: false,
			editResults: new Map(),
		};
		entries.set(key, created);
		entry = created;
		promise
			.then((result) => {
				if (!created.updating)
					created.listeners.values().next().value?.applyOnce(result);
			})
			.catch((err) => {
				if (entries.get(key) !== created) return;
				entries.delete(key);
				if (err instanceof SequenceSourceReadCancelledError) return;
				Internals.Log.error({logLevel: 'error', tag: null}, err);
			});
		created.subscription
			.then((value) => {
				created.resolvedSubscription = value;
			})
			.catch(() => {});
	}

	const acquired = entry;
	const listener = {applyOnce, applyEach};
	acquired.listeners.add(listener);
	let released = false;
	acquired.promise
		.then((result) => {
			if (!released && !acquired.updating) listener.applyEach(result);
		})
		.catch(() => {});

	return {
		updateMetadata: (metadata) => {
			if (released) return;
			const metadataKey = JSON.stringify(metadata);
			if (metadataKey === acquired.metadataKey) return;
			acquired.metadataKey = metadataKey;
			acquired.pending = metadata;
			if (acquired.updating) return;
			acquired.updating = true;
			const update = async () => {
				try {
					const subscription = await acquired.subscription;
					if (!subscription) return;
					while (acquired.pending && acquired.listeners.size > 0) {
						await waitForSourceMutationQueue();
						if (acquired.listeners.size === 0) break;
						const {pending} = acquired;
						acquired.pending = null;
						try {
							const fromEdit =
								pending.sourceRevision === null
									? null
									: acquired.editResults.get(pending.sourceRevision);
							const result =
								fromEdit &&
								JSON.stringify(fromEdit.effects) ===
									JSON.stringify(pending.effects)
									? fromEdit.result
									: await updateSequencePropsSubscription({
											subscription,
											effects: pending.effects,
										});
							if (fromEdit) {
								for (const revision of acquired.editResults.keys()) {
									if (revision === pending.sourceRevision) break;
									acquired.editResults.delete(revision);
								}
							}

							if (!acquired.pending) {
								acquired.promise = Promise.resolve(result);
								applyResult(acquired, result);
							}
						} catch (err) {
							if (!acquired.pending) acquired.metadataKey = '';
							if (
								err instanceof SequenceSourceReadCancelledError ||
								acquired.listeners.size === 0
							)
								continue;
							Internals.Log.error({logLevel: 'error', tag: null}, err);
						}
					}
				} finally {
					acquired.updating = false;
				}
			};

			update().catch((err) => {
				if (
					err instanceof SequenceSourceReadCancelledError ||
					acquired.listeners.size === 0
				)
					return;
				Internals.Log.error({logLevel: 'error', tag: null}, err);
			});
		},
		release: () => {
			if (released) return;
			released = true;
			acquired.listeners.delete(listener);
			if (acquired.listeners.size > 0) return;
			if (entries.get(key) === acquired) entries.delete(key);
			acquired.subscription
				.then((subscription) => {
					if (subscription) return unsubscribeFromSequenceProps(subscription);
				})
				.catch(() => {});
		},
	};
};
