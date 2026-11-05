import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SubscribeToSequencePropsBatchResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {hasSourceOnlyRemappings} from '../helpers/sequence-node-path-mutations';
import {callApi} from './call-api';
import {getCompiledSourceHash} from './Timeline/TimelineStack/get-stack';

type PendingSequencePropsSubscription = {
	request: SubscribeToSequencePropsRequest;
	stack: string | null;
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

const flushSequencePropsSubscriptions = () => {
	sequencePropsSubscriptionTimer = null;
	const pending = pendingSequencePropsSubscriptions;
	pendingSequencePropsSubscriptions = [];

	const hashes = pending.map(({request, stack}) =>
		request.nodePath === null && hasSourceOnlyRemappings(request.fileName)
			? getCompiledSourceHash(stack, request.fileName)
			: null,
	);
	callApi('/api/subscribe-to-sequence-props', {
		requests: pending.map(({request}) => request),
		compiledSourceHashes: hashes.some((hash) => hash !== null) ? hashes : null,
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
	stack: string | null,
): Promise<SubscribeToSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	if (browserStudioOperations) {
		return browserStudioOperations.subscribeToSequenceProps(request);
	}

	return new Promise((resolve, reject) => {
		pendingSequencePropsSubscriptions.push({request, stack, resolve, reject});
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
