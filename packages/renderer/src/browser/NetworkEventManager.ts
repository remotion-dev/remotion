import type {
	LoadingFailedEvent,
	LoadingFinishedEvent,
	RequestPausedEvent,
	RequestWillBeSentEvent,
	ResponseReceivedEvent,
	ResponseReceivedExtraInfoEvent,
} from './devtools-types';
import type {HTTPRequest} from './HTTPRequest';

type QueuedEventGroup = {
	responseReceivedEvent: ResponseReceivedEvent;
	loadingFinishedEvent?: LoadingFinishedEvent;
	loadingFailedEvent?: LoadingFailedEvent;
};

export type FetchRequestId = string;
type NetworkRequestId = string;

type RedirectInfo = {
	event: RequestWillBeSentEvent;
	fetchRequestId?: FetchRequestId;
};
type FailedLoadInfo = {
	event: LoadingFailedEvent;
};

type RedirectInfoList = RedirectInfo[];

export class NetworkEventManager {
	#requestWillBeSentMap = new Map<NetworkRequestId, RequestWillBeSentEvent>();

	#requestPausedMap = new Map<NetworkRequestId, RequestPausedEvent>();

	#httpRequestsMap = new Map<NetworkRequestId, HTTPRequest>();

	#responseReceivedExtraInfoMap = new Map<
		NetworkRequestId,
		ResponseReceivedExtraInfoEvent[]
	>();

	#queuedRedirectInfoMap = new Map<NetworkRequestId, RedirectInfoList>();
	#queuedEventGroupMap = new Map<NetworkRequestId, QueuedEventGroup>();
	#failedLoadInfoMap = new Map<NetworkRequestId, FailedLoadInfo>();

	forget(networkRequestId: NetworkRequestId): void {
		this.#requestWillBeSentMap.delete(networkRequestId);
		this.#requestPausedMap.delete(networkRequestId);
		this.#queuedEventGroupMap.delete(networkRequestId);
		this.#queuedRedirectInfoMap.delete(networkRequestId);
		this.#responseReceivedExtraInfoMap.delete(networkRequestId);
		this.#failedLoadInfoMap.delete(networkRequestId);
	}

	queueFailedLoadInfo(
		networkRequestId: NetworkRequestId,
		event: LoadingFailedEvent,
	): void {
		this.#failedLoadInfoMap.set(networkRequestId, {event});
	}

	getFailedLoadInfo(
		networkRequestId: NetworkRequestId,
	): LoadingFailedEvent | undefined {
		return this.#failedLoadInfoMap.get(networkRequestId)?.event;
	}

	getResponseExtraInfo(
		networkRequestId: NetworkRequestId,
	): ResponseReceivedExtraInfoEvent[] {
		if (!this.#responseReceivedExtraInfoMap.has(networkRequestId)) {
			this.#responseReceivedExtraInfoMap.set(networkRequestId, []);
		}

		return this.#responseReceivedExtraInfoMap.get(
			networkRequestId,
		) as ResponseReceivedExtraInfoEvent[];
	}

	private queuedRedirectInfo(fetchRequestId: FetchRequestId): RedirectInfoList {
		if (!this.#queuedRedirectInfoMap.has(fetchRequestId)) {
			this.#queuedRedirectInfoMap.set(fetchRequestId, []);
		}

		return this.#queuedRedirectInfoMap.get(fetchRequestId) as RedirectInfoList;
	}

	queueRedirectInfo(
		fetchRequestId: FetchRequestId,
		redirectInfo: RedirectInfo,
	): void {
		this.queuedRedirectInfo(fetchRequestId).push(redirectInfo);
	}

	takeQueuedRedirectInfo(
		fetchRequestId: FetchRequestId,
	): RedirectInfo | undefined {
		return this.queuedRedirectInfo(fetchRequestId).shift();
	}

	storeRequestWillBeSent(
		networkRequestId: NetworkRequestId,
		event: RequestWillBeSentEvent,
	): void {
		this.#requestWillBeSentMap.set(networkRequestId, event);
	}

	getRequestWillBeSent(
		networkRequestId: NetworkRequestId,
	): RequestWillBeSentEvent | undefined {
		return this.#requestWillBeSentMap.get(networkRequestId);
	}

	forgetRequestWillBeSent(networkRequestId: NetworkRequestId): void {
		this.#requestWillBeSentMap.delete(networkRequestId);
	}

	storeRequestPaused(
		networkRequestId: NetworkRequestId,
		event: RequestPausedEvent,
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
		networkRequestId: NetworkRequestId,
	): QueuedEventGroup | undefined {
		return this.#queuedEventGroupMap.get(networkRequestId);
	}

	queueEventGroup(
		networkRequestId: NetworkRequestId,
		event: QueuedEventGroup,
	): void {
		this.#queuedEventGroupMap.set(networkRequestId, event);
	}

	forgetQueuedEventGroup(networkRequestId: NetworkRequestId): void {
		this.#queuedEventGroupMap.delete(networkRequestId);
	}
}
