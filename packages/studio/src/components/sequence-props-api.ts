import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SubscribeToSequencePropsBatchResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

type PendingSequencePropsSubscription = {
	request: SubscribeToSequencePropsRequest;
	resolve: (response: SubscribeToSequencePropsResponse) => void;
	reject: (error: unknown) => void;
};

type PendingSequencePropsUnsubscription = {
	request: UnsubscribeFromSequencePropsRequest;
	resolve: (response: undefined) => void;
	reject: (error: unknown) => void;
};

let pendingSequencePropsSubscriptions: PendingSequencePropsSubscription[] = [];
let sequencePropsSubscriptionTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSequencePropsUnsubscriptions: PendingSequencePropsUnsubscription[] =
	[];
let sequencePropsUnsubscriptionTimer: ReturnType<typeof setTimeout> | null =
	null;

/** Drops a batch left queued by another test in this process. */
export const resetSequencePropsNetworkBatchesForTests = (): void => {
	if (sequencePropsSubscriptionTimer !== null) {
		clearTimeout(sequencePropsSubscriptionTimer);
		sequencePropsSubscriptionTimer = null;
	}

	if (sequencePropsUnsubscriptionTimer !== null) {
		clearTimeout(sequencePropsUnsubscriptionTimer);
		sequencePropsUnsubscriptionTimer = null;
	}

	const subscriptions = pendingSequencePropsSubscriptions;
	const unsubscriptions = pendingSequencePropsUnsubscriptions;
	pendingSequencePropsSubscriptions = [];
	pendingSequencePropsUnsubscriptions = [];
	for (const item of subscriptions) {
		item.reject(new Error('Sequence prop subscription batch was reset'));
	}

	for (const item of unsubscriptions) {
		item.resolve(undefined);
	}
};

const flushSequencePropsSubscriptions = () => {
	sequencePropsSubscriptionTimer = null;
	const pending = pendingSequencePropsSubscriptions;
	pendingSequencePropsSubscriptions = [];

	callApi('/api/subscribe-to-sequence-props', {
		requests: pending.map(({request}) => request),
	}).then(
		(response: SubscribeToSequencePropsBatchResponse) => {
			if (response.results.length !== pending.length) {
				const error = new Error(
					`Expected ${pending.length} sequence prop subscription results, got ${response.results.length}`,
				);
				for (const item of pending) {
					item.reject(error);
				}

				return;
			}

			for (let index = 0; index < pending.length; index++) {
				pending[index].resolve(response.results[index]);
			}
		},
		(error) => {
			for (const item of pending) {
				item.reject(error);
			}
		},
	);
};

export const saveSequenceProps = (
	request: SaveSequencePropsRequest,
): Promise<SaveSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.saveSequenceProps(request)
		: callApi('/api/save-sequence-props', request);
};

export const subscribeToSequenceProps = (
	request: SubscribeToSequencePropsRequest,
): Promise<SubscribeToSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.subscribeToSequenceProps(request);
	}

	return new Promise((resolve, reject) => {
		pendingSequencePropsSubscriptions.push({request, resolve, reject});
		if (sequencePropsSubscriptionTimer === null) {
			sequencePropsSubscriptionTimer = setTimeout(
				flushSequencePropsSubscriptions,
				0,
			);
		}
	});
};

export const unsubscribeFromSequenceProps = (
	request: UnsubscribeFromSequencePropsRequest,
): Promise<undefined> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.unsubscribeFromSequenceProps(request);
	}

	return new Promise((resolve, reject) => {
		pendingSequencePropsUnsubscriptions.push({request, resolve, reject});
		if (sequencePropsUnsubscriptionTimer === null) {
			sequencePropsUnsubscriptionTimer = setTimeout(() => {
				sequencePropsUnsubscriptionTimer = null;
				const pending = pendingSequencePropsUnsubscriptions;
				pendingSequencePropsUnsubscriptions = [];

				callApi('/api/unsubscribe-from-sequence-props', {
					requests: pending.map((item) => item.request),
				}).then(
					() => {
						for (const item of pending) {
							item.resolve(undefined);
						}
					},
					(error) => {
						for (const item of pending) {
							item.reject(error);
						}
					},
				);
			}, 0);
		}
	});
};
