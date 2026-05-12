import type {SequenceSchema} from 'remotion';
import {Internals} from 'remotion';
import {callApi} from '../call-api';

type Key = string;

const makeKey = (fileName: string, line: number, column: number): Key =>
	`${fileName}\0${line}\0${column}`;

type SubscribeResult = Awaited<
	ReturnType<typeof callApi<'/api/subscribe-to-sequence-props'>>
>;

type ApplyResult = (result: SubscribeResult) => void;

type Entry = {
	refCount: number;
	promise: Promise<SubscribeResult>;
	fileName: string;
	clientId: string;
	apply: ApplyResult | null;
};

const entries = new Map<Key, Entry>();

export const acquireSequencePropsSubscription = ({
	fileName,
	line,
	column,
	schema,
	clientId,
	apply,
}: {
	fileName: string;
	line: number;
	column: number;
	schema: SequenceSchema;
	clientId: string;
	apply: ApplyResult;
}): {release: () => void} => {
	const key = makeKey(fileName, line, column);
	let entry = entries.get(key);

	if (!entry) {
		const promise = callApi('/api/subscribe-to-sequence-props', {
			fileName,
			line,
			column,
			schema,
			clientId,
		});
		const created: Entry = {
			refCount: 0,
			promise,
			fileName,
			clientId,
			apply,
		};
		entries.set(key, created);
		entry = created;

		promise
			.then((result) => {
				const current = entries.get(key);
				if (current !== created || !current.apply) {
					return;
				}

				const cb = current.apply;
				current.apply = null;
				cb(result);
			})
			.catch((err) => {
				const current = entries.get(key);
				if (current !== created) {
					return;
				}

				current.apply = null;
				Internals.Log.error(err);
			});
	}

	entry.refCount++;
	const acquired = entry;

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
					if (!result.canUpdate) {
						return;
					}

					return callApi('/api/unsubscribe-from-sequence-props', {
						fileName: acquired.fileName,
						nodePath: result.nodePath,
						clientId: acquired.clientId,
					});
				})
				.catch(() => {
					// Ignore — either the subscribe failed (nothing to clean up) or
					// the unsubscribe failed (server-side TTL will handle it).
				});
		},
	};
};
