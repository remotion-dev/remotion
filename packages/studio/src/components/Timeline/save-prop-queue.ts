import type {
	CanUpdateSequencePropsResponse,
	SequencePropsSubscriptionKey,
} from 'remotion';
import {Internals} from 'remotion';
import {showNotification} from '../Notifications/NotificationCenter';

type SetPropStatuses = (
	nodePath: SequencePropsSubscriptionKey,
	values: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse,
) => void;

type QueueState = {
	chain: Promise<unknown>;
	cancelled: boolean;
};

const queues = new Map<string, QueueState>();

const getQueue = (nodePath: SequencePropsSubscriptionKey): QueueState => {
	const key = Internals.makeSequencePropsSubscriptionKey(nodePath);
	let q = queues.get(key);
	if (!q) {
		q = {chain: Promise.resolve(), cancelled: false};
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
	setPropStatuses: SetPropStatuses;
	applyOptimistic: (
		prev: CanUpdateSequencePropsResponse,
	) => CanUpdateSequencePropsResponse;
	applyServerResponse?: (
		prev: CanUpdateSequencePropsResponse,
		response: TResponse,
	) => CanUpdateSequencePropsResponse;
	apiCall: () => Promise<TResponse>;
	errorLabel: string;
};

export const enqueueSavePropChange = <TResponse>({
	nodePath,
	setPropStatuses,
	applyOptimistic,
	applyServerResponse,
	apiCall,
	errorLabel,
}: EnqueueSaveOptions<TResponse>): Promise<void> => {
	const q = getQueue(nodePath);

	if (q.cancelled) {
		return Promise.resolve();
	}

	setPropStatuses(nodePath, (prev) => {
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

			// If nothing more is queued, reset baseline so the next round starts fresh.
			if (myQueue.chain === next) {
				if (applyServerResponse) {
					setPropStatuses(nodePath, (prev) =>
						applyServerResponse(prev, response),
					);
				}

				dropQueue(nodePath, myQueue);
			}
		} catch (err) {
			myQueue.cancelled = true;

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
