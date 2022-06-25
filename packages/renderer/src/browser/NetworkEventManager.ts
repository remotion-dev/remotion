import type {Protocol} from 'devtools-protocol';
import type {HTTPRequest} from './HTTPRequest';

type QueuedEventGroup = {
	responseReceivedEvent: Protocol.Network.ResponseReceivedEvent;
	loadingFinishedEvent?: Protocol.Network.LoadingFinishedEvent;
	loadingFailedEvent?: Protocol.Network.LoadingFailedEvent;
};

export type FetchRequestId = string;
type NetworkRequestId = string;

type RedirectInfo = {
	event: Protocol.Network.RequestWillBeSentEvent;
	fetchRequestId?: FetchRequestId;
};
type RedirectInfoList = RedirectInfo[];

export class NetworkEventManager {
	#requestWillBeSentMap = new Map<
		NetworkRequestId,
		Protocol.Network.RequestWillBeSentEvent
	>();

	#requestPausedMap = new Map<
		NetworkRequestId,
		Protocol.Fetch.RequestPausedEvent
	>();

	#httpRequestsMap = new Map<NetworkRequestId, HTTPRequest>();

	#responseReceivedExtraInfoMap = new Map<
		NetworkRequestId,
		Protocol.Network.ResponseReceivedExtraInfoEvent[]
	>();

	#queuedRedirectInfoMap = new Map<NetworkRequestId, RedirectInfoList>();
	#queuedEventGroupMap = new Map<NetworkRequestId, QueuedEventGroup>();

	forget(networkRequestId: NetworkRequestId): void {
		this.#requestWillBeSentMap.delete(networkRequestId);
		this.#requestPausedMap.delete(networkRequestId);
		this.#queuedEventGroupMap.delete(networkRequestId);
		this.#queuedRedirectInfoMap.delete(networkRequestId);
		this.#responseReceivedExtraInfoMap.delete(networkRequestId);
	}

	responseExtraInfo(
		networkRequestId: NetworkRequestId
	): Protocol.Network.ResponseReceivedExtraInfoEvent[] {
		if (!this.#responseReceivedExtraInfoMap.has(networkRequestId)) {
			this.#responseReceivedExtraInfoMap.set(networkRequestId, []);
		}

		return this.#responseReceivedExtraInfoMap.get(
			networkRequestId
		) as Protocol.Network.ResponseReceivedExtraInfoEvent[];
	}

	private queuedRedirectInfo(fetchRequestId: FetchRequestId): RedirectInfoList {
		if (!this.#queuedRedirectInfoMap.has(fetchRequestId)) {
			this.#queuedRedirectInfoMap.set(fetchRequestId, []);
		}

		return this.#queuedRedirectInfoMap.get(fetchRequestId) as RedirectInfoList;
	}

	queueRedirectInfo(
		fetchRequestId: FetchRequestId,
		redirectInfo: RedirectInfo
	): void {
		this.queuedRedirectInfo(fetchRequestId).push(redirectInfo);
	}

	takeQueuedRedirectInfo(
		fetchRequestId: FetchRequestId
	): RedirectInfo | undefined {
		return this.queuedRedirectInfo(fetchRequestId).shift();
	}

	numRequestsInProgress(): number {
		return [...this.#httpRequestsMap].filter(([, request]) => {
			return !request.response();
		}).length;
	}

	storeRequestWillBeSent(
		networkRequestId: NetworkRequestId,
		event: Protocol.Network.RequestWillBeSentEvent
	): void {
		this.#requestWillBeSentMap.set(networkRequestId, event);
	}

	getRequestWillBeSent(
		networkRequestId: NetworkRequestId
	): Protocol.Network.RequestWillBeSentEvent | undefined {
		return this.#requestWillBeSentMap.get(networkRequestId);
	}

	forgetRequestWillBeSent(networkRequestId: NetworkRequestId): void {
		this.#requestWillBeSentMap.delete(networkRequestId);
	}

	storeRequestPaused(
		networkRequestId: NetworkRequestId,
		event: Protocol.Fetch.RequestPausedEvent
	): void {
		this.#requestPausedMap.set(networkRequestId, event);
	}

	getRequest(networkRequestId: NetworkRequestId): HTTPRequest | undefined {
		return this.#httpRequestsMap.get(networkRequestId);
	}

	storeRequest(networkRequestId: NetworkRequestId, request: HTTPRequest): void {
		this.#httpRequestsMap.set(networkRequestId, request);
	}

	forgetRequest(networkRequestId: NetworkRequestId): void {
		this.#httpRequestsMap.delete(networkRequestId);
	}

	getQueuedEventGroup(
		networkRequestId: NetworkRequestId
	): QueuedEventGroup | undefined {
		return this.#queuedEventGroupMap.get(networkRequestId);
	}

	queueEventGroup(
		networkRequestId: NetworkRequestId,
		event: QueuedEventGroup
	): void {
		this.#queuedEventGroupMap.set(networkRequestId, event);
	}

	forgetQueuedEventGroup(networkRequestId: NetworkRequestId): void {
		this.#queuedEventGroupMap.delete(networkRequestId);
	}
}
