import {getAllSchemaKeys, getAssetSchemaKeys} from '@remotion/studio-shared';
import type {
	JsxComponentIdentity,
	SequenceNodePath,
	InteractivitySchema,
	VideoConfigValues,
} from 'remotion';
import {Internals} from 'remotion';
import {callApi} from '../call-api';

type Key = string;

const makeKey = ({
	fileName,
	line,
	column,
	componentIdentity,
	sequenceKeys,
	assetKeys,
	effectKeys,
	videoConfigValues,
}: {
	fileName: string;
	line: number;
	column: number;
	componentIdentity: JsxComponentIdentity | null;
	sequenceKeys: string[];
	assetKeys: string[];
	effectKeys: string[][];
	videoConfigValues: VideoConfigValues;
}): Key =>
	`${fileName}\0${line}\0${column}\0${componentIdentity ?? ''}\0${sequenceKeys.join('\0')}\0${assetKeys.join('\0')}\0${effectKeys.map((keys) => keys.join('\0')).join('\0\0')}\0${JSON.stringify(videoConfigValues)}`;

type SubscribeResult = Awaited<
	ReturnType<typeof callApi<'/api/subscribe-to-sequence-props'>>
>;

type ApplyResult = (result: SubscribeResult) => void;

type Entry = {
	refCount: number;
	promise: Promise<SubscribeResult>;
	fileName: string;
	clientId: string;
	applyOnce: ApplyResult | null;
};

const entries = new Map<Key, Entry>();

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
	});
	let entry = entries.get(key);

	if (!entry) {
		const promise = callApi('/api/subscribe-to-sequence-props', {
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

					return callApi('/api/unsubscribe-from-sequence-props', {
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
