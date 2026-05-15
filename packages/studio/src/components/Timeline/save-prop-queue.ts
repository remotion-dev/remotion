import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {showNotification} from '../Notifications/NotificationCenter';

type SetCodeValues = (
	nodePath: SequencePropsSubscriptionKey,
	values: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse,
) => void;

type QueueState = {
	chain: Promise<unknown>;
	cancelled: boolean;
	committed: CanUpdateSequencePropsResponse | null;
};

const queues = new Map<string, QueueState>();

const getQueue = (nodePath: SequencePropsSubscriptionKey): QueueState => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	let q = queues.get(key);
	if (!q) {
		q = {chain: Promise.resolve(), cancelled: false, committed: null};
		queues.set(key, q);
	}

	return q;
};

const dropQueue = (
	nodePath: SequencePropsSubscriptionKey,
	q: QueueState,
): void => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	if (queues.get(key) === q) {
		queues.delete(key);
	}
};

export type EnqueueSaveOptions<TResponse> = {
	nodePath: SequencePropsSubscriptionKey;
	setCodeValues: SetCodeValues;
	applyOptimistic: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse;
	apiCall: () => Promise<TResponse>;
	mergeServerResponse: (
		prev: CanUpdateSequencePropsResponse,
		response: TResponse,
	) => CanUpdateSequencePropsResponse;
	errorLabel: string;
};

export const enqueueSavePropChange = <TResponse>({
	nodePath,
	setCodeValues,
	applyOptimistic,
	apiCall,
	mergeServerResponse,
	errorLabel,
}: EnqueueSaveOptions<TResponse>): Promise<void> => {
	const q = getQueue(nodePath);

	if (q.cancelled) {
		return Promise.resolve();
	}

	setCodeValues(nodePath, (prev) => {
		if (q.committed === null) {
			q.committed = prev;
		}

		return applyOptimistic(prev);
	});

	const myQueue = q;
	const next = myQueue.chain.then(async () => {
		if (myQueue.cancelled) {
			return;
		}

		try {
			const response = await apiCall();
			if (myQueue.cancelled) {
				return;
			}

			setCodeValues(nodePath, (prev) => mergeServerResponse(prev, response));
			myQueue.committed = mergeServerResponse(
				myQueue.committed as CanUpdateSequencePropsResponse,
				response,
			);

			// If nothing more is queued, reset baseline so the next round starts fresh.
			if (myQueue.chain === next) {
				dropQueue(nodePath, myQueue);
			}
		} catch (err) {
			myQueue.cancelled = true;
			const {committed} = myQueue;
			if (committed !== null) {
				setCodeValues(nodePath, () => committed);
			}

			dropQueue(nodePath, myQueue);
			showNotification(
				`${errorLabel}: ${err instanceof Error ? err.message : String(err)}`,
				4000,
			);
		}
	});

	myQueue.chain = next;
	return next;
};
