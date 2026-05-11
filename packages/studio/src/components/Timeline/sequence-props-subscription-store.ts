import type {EventSourceEvent} from '@remotion/studio-shared';
import {Internals, type CanUpdateSequencePropStatus} from 'remotion';
import type {SequenceSchema, SequenceNodePath} from 'remotion';
import {callApi} from '../call-api';

export type SequencePropsSnapshot = {
	nodePath: SequenceNodePath | null;
	jsxInMapCallback: boolean;
	props: Record<string, CanUpdateSequencePropStatus> | null;
};

const INITIAL_SNAPSHOT: SequencePropsSnapshot = {
	nodePath: null,
	jsxInMapCallback: false,
	props: null,
};

type SubscribeToEvent = (
	type: EventSourceEvent['type'],
	listener: (event: EventSourceEvent) => void,
) => () => void;

type Entry = {
	clientId: string;
	fileName: string;
	refCount: number;
	snapshot: SequencePropsSnapshot;
	listeners: Set<(s: SequencePropsSnapshot) => void>;
	tornDown: boolean;
};

const entries = new Map<string, Entry>();
let globalUnsubscribe: (() => void) | null = null;

const makeKey = (fileName: string, line: number, column: number): string =>
	`${fileName}|${line}|${column}`;

const nodePathsEqual = (
	a: SequenceNodePath | null,
	b: SequenceNodePath | null,
): boolean => {
	if (!a || !b) {
		return false;
	}

	return JSON.stringify(a) === JSON.stringify(b);
};

const notify = (entry: Entry) => {
	for (const listener of entry.listeners) {
		listener(entry.snapshot);
	}
};

const handleEvent = (event: EventSourceEvent) => {
	if (event.type !== 'sequence-props-updated') {
		return;
	}

	for (const entry of entries.values()) {
		if (entry.fileName !== event.fileName) {
			continue;
		}

		if (!nodePathsEqual(entry.snapshot.nodePath, event.nodePath)) {
			continue;
		}

		if (event.result.canUpdate) {
			entry.snapshot = {
				nodePath: entry.snapshot.nodePath,
				jsxInMapCallback: event.result.jsxInMapCallback,
				props: event.result.props,
			};
		} else {
			entry.snapshot = {
				nodePath: entry.snapshot.nodePath,
				jsxInMapCallback: false,
				props: null,
			};
		}

		notify(entry);
	}
};

const ensureGlobalListener = (subscribeToEvent: SubscribeToEvent) => {
	if (globalUnsubscribe) {
		return;
	}

	globalUnsubscribe = subscribeToEvent('sequence-props-updated', handleEvent);
};

const teardownGlobalListenerIfEmpty = () => {
	if (entries.size > 0) {
		return;
	}

	if (globalUnsubscribe) {
		globalUnsubscribe();
		globalUnsubscribe = null;
	}
};

const fireUnsubscribe = (
	fileName: string,
	nodePath: SequenceNodePath,
	clientId: string,
) => {
	callApi('/api/unsubscribe-from-sequence-props', {
		fileName,
		nodePath,
		clientId,
	}).catch(() => {
		// Ignore unsubscribe errors
	});
};

export const acquireSequencePropsSubscription = ({
	clientId,
	fileName,
	line,
	column,
	schema,
	subscribeToEvent,
	onChange,
}: {
	clientId: string;
	fileName: string;
	line: number;
	column: number;
	schema: SequenceSchema;
	subscribeToEvent: SubscribeToEvent;
	onChange: (snapshot: SequencePropsSnapshot) => void;
}): (() => void) => {
	const key = makeKey(fileName, line, column);
	let entry = entries.get(key);

	if (!entry) {
		const newEntry: Entry = {
			clientId,
			fileName,
			refCount: 0,
			snapshot: INITIAL_SNAPSHOT,
			listeners: new Set(),
			tornDown: false,
		};
		entries.set(key, newEntry);
		ensureGlobalListener(subscribeToEvent);

		callApi('/api/subscribe-to-sequence-props', {
			fileName,
			line,
			column,
			schema,
			clientId,
		})
			.then((result) => {
				if (newEntry.tornDown) {
					if (result.canUpdate) {
						fireUnsubscribe(fileName, result.nodePath, clientId);
					}

					return;
				}

				if (result.canUpdate) {
					newEntry.snapshot = {
						nodePath: result.nodePath,
						jsxInMapCallback: result.jsxInMapCallback,
						props: result.props,
					};
				} else {
					newEntry.snapshot = INITIAL_SNAPSHOT;
				}

				notify(newEntry);
			})
			.catch((err) => {
				if (newEntry.tornDown) {
					return;
				}

				Internals.Log.error(err);
				newEntry.snapshot = INITIAL_SNAPSHOT;
				notify(newEntry);
			});

		entry = newEntry;
	}

	entry.refCount += 1;
	entry.listeners.add(onChange);
	onChange(entry.snapshot);

	let released = false;
	return () => {
		if (released) {
			return;
		}

		released = true;
		const e = entry as Entry;
		e.listeners.delete(onChange);
		e.refCount -= 1;

		if (e.refCount > 0) {
			return;
		}

		e.tornDown = true;
		const resolvedNodePath = e.snapshot.nodePath;
		entries.delete(key);

		if (resolvedNodePath) {
			fireUnsubscribe(e.fileName, resolvedNodePath, e.clientId);
		}

		teardownGlobalListenerIfEmpty();
	};
};
