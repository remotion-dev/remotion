/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Protocol} from 'devtools-protocol';
import type {ProtocolMapping} from 'devtools-protocol/types/protocol-mapping';
import {assert} from './assert';
import {EventEmitter} from './EventEmitter';
import type {Frame} from './FrameManager';
import {HTTPRequest} from './HTTPRequest';
import {HTTPResponse} from './HTTPResponse';
import type {FetchRequestId} from './NetworkEventManager';
import {NetworkEventManager} from './NetworkEventManager';
import {isString} from './util';

export const NetworkManagerEmittedEvents = {
	Request: Symbol('NetworkManager.Request'),
} as const;

interface CDPSession extends EventEmitter {
	send<T extends keyof ProtocolMapping.Commands>(
		method: T,
		...paramArgs: ProtocolMapping.Commands[T]['paramsType']
	): Promise<ProtocolMapping.Commands[T]['returnType']>;
}

interface FrameManager {
	frame(frameId: string): Frame | null;
}

export class NetworkManager extends EventEmitter {
	#client: CDPSession;
	#frameManager: FrameManager;
	#networkEventManager = new NetworkEventManager();
	#extraHTTPHeaders: Record<string, string> = {};
	#attemptedAuthentications = new Set<string>();
	constructor(client: CDPSession, frameManager: FrameManager) {
		super();
		this.#client = client;
		this.#frameManager = frameManager;

		this.#client.on('Fetch.requestPaused', this.#onRequestPaused.bind(this));
		this.#client.on('Fetch.authRequired', this.#onAuthRequired.bind(this));
		this.#client.on(
			'Network.requestWillBeSent',
			this.#onRequestWillBeSent.bind(this)
		);
		this.#client.on(
			'Network.requestServedFromCache',
			this.#onRequestServedFromCache.bind(this)
		);
		this.#client.on(
			'Network.responseReceived',
			this.#onResponseReceived.bind(this)
		);
		this.#client.on(
			'Network.loadingFinished',
			this.#onLoadingFinished.bind(this)
		);
		this.#client.on('Network.loadingFailed', this.#onLoadingFailed.bind(this));
		this.#client.on(
			'Network.responseReceivedExtraInfo',
			this.#onResponseReceivedExtraInfo.bind(this)
		);
	}

	async initialize(): Promise<void> {
		await this.#client.send('Network.enable');
	}

	async setExtraHTTPHeaders(
		extraHTTPHeaders: Record<string, string>
	): Promise<void> {
		this.#extraHTTPHeaders = {};
		for (const key of Object.keys(extraHTTPHeaders)) {
			const value = extraHTTPHeaders[key];
			assert(
				isString(value),
				`Expected value of header "${key}" to be String, but "${typeof value}" is found.`
			);
			this.#extraHTTPHeaders[key.toLowerCase()] = value;
		}

		await this.#client.send('Network.setExtraHTTPHeaders', {
			headers: this.#extraHTTPHeaders,
		});
	}

	extraHTTPHeaders(): Record<string, string> {
		return {...this.#extraHTTPHeaders};
	}

	numRequestsInProgress(): number {
		return this.#networkEventManager.numRequestsInProgress();
	}

	#onRequestWillBeSent(event: Protocol.Network.RequestWillBeSentEvent): void {
		this.#onRequest(event, undefined);
	}

	#onAuthRequired(event: Protocol.Fetch.AuthRequiredEvent): void {
		type AuthResponse = 'Default' | 'CancelAuth' | 'ProvideCredentials';
		let response: AuthResponse = 'Default';
		if (this.#attemptedAuthentications.has(event.requestId)) {
			response = 'CancelAuth';
		}

		const {username, password} = {
			username: undefined,
			password: undefined,
		};
		this.#client
			.send('Fetch.continueWithAuth', {
				requestId: event.requestId,
				authChallengeResponse: {response, username, password},
			})
			.catch(() => undefined);
	}

	/**
	 * CDP may send a Fetch.requestPaused without or before a
	 * Network.requestWillBeSent
	 *
	 * CDP may send multiple Fetch.requestPaused
	 * for the same Network.requestWillBeSent.
	 */
	#onRequestPaused(event: Protocol.Fetch.RequestPausedEvent): void {
		const {networkId: networkRequestId, requestId: fetchRequestId} = event;

		if (!networkRequestId) {
			return;
		}

		const requestWillBeSentEvent = (() => {
			const _requestWillBeSentEvent =
				this.#networkEventManager.getRequestWillBeSent(networkRequestId);

			// redirect requests have the same `requestId`,
			if (
				_requestWillBeSentEvent &&
				(_requestWillBeSentEvent.request.url !== event.request.url ||
					_requestWillBeSentEvent.request.method !== event.request.method)
			) {
				this.#networkEventManager.forgetRequestWillBeSent(networkRequestId);
				return;
			}

			return _requestWillBeSentEvent;
		})();

		if (requestWillBeSentEvent) {
			this.#patchRequestEventHeaders(requestWillBeSentEvent, event);
			this.#onRequest(requestWillBeSentEvent, fetchRequestId);
		} else {
			this.#networkEventManager.storeRequestPaused(networkRequestId, event);
		}
	}

	#patchRequestEventHeaders(
		requestWillBeSentEvent: Protocol.Network.RequestWillBeSentEvent,
		requestPausedEvent: Protocol.Fetch.RequestPausedEvent
	): void {
		requestWillBeSentEvent.request.headers = {
			...requestWillBeSentEvent.request.headers,
			// includes extra headers, like: Accept, Origin
			...requestPausedEvent.request.headers,
		};
	}

	#onRequest(
		event: Protocol.Network.RequestWillBeSentEvent,
		fetchRequestId?: FetchRequestId
	): void {
		if (event.redirectResponse) {
			// We want to emit a response and requestfinished for the
			// redirectResponse, but we can't do so unless we have a
			// responseExtraInfo ready to pair it up with. If we don't have any
			// responseExtraInfos saved in our queue, they we have to wait until
			// the next one to emit response and requestfinished, *and* we should
			// also wait to emit this Request too because it should come after the
			// response/requestfinished.
			let redirectResponseExtraInfo = null;
			if (event.redirectHasExtraInfo) {
				redirectResponseExtraInfo = this.#networkEventManager
					.responseExtraInfo(event.requestId)
					.shift();
				if (!redirectResponseExtraInfo) {
					this.#networkEventManager.queueRedirectInfo(event.requestId, {
						event,
						fetchRequestId,
					});
					return;
				}
			}

			const _request = this.#networkEventManager.getRequest(event.requestId);
			// If we connect late to the target, we could have missed the
			// requestWillBeSent event.
			if (_request) {
				this.#handleRequestRedirect(
					_request,
					event.redirectResponse,
					redirectResponseExtraInfo
				);
			}
		}

		const frame = event.frameId
			? this.#frameManager.frame(event.frameId)
			: null;

		const request = new HTTPRequest(frame, event);
		this.#networkEventManager.storeRequest(event.requestId, request);
		this.emit(NetworkManagerEmittedEvents.Request, request);
	}

	#onRequestServedFromCache(
		event: Protocol.Network.RequestServedFromCacheEvent
	): void {
		const request = this.#networkEventManager.getRequest(event.requestId);
		if (request) {
			request._fromMemoryCache = true;
		}
	}

	#handleRequestRedirect(
		request: HTTPRequest,
		responsePayload: Protocol.Network.Response,
		extraInfo: Protocol.Network.ResponseReceivedExtraInfoEvent | null
	): void {
		const response = new HTTPResponse(responsePayload, extraInfo);
		request._response = response;
		response._resolveBody(
			new Error('Response body is unavailable for redirect responses')
		);
		this.#forgetRequest(request, false);
	}

	#emitResponseEvent(
		responseReceived: Protocol.Network.ResponseReceivedEvent,
		extraInfo: Protocol.Network.ResponseReceivedExtraInfoEvent | null
	): void {
		const request = this.#networkEventManager.getRequest(
			responseReceived.requestId
		);
		// FileUpload sends a response without a matching request.
		if (!request) {
			return;
		}

		const extraInfos = this.#networkEventManager.responseExtraInfo(
			responseReceived.requestId
		);
		if (extraInfos.length) {
			console.log(
				new Error(
					'Unexpected extraInfo events for request ' +
						responseReceived.requestId
				)
			);
		}

		const response = new HTTPResponse(responseReceived.response, extraInfo);
		request._response = response;
	}

	#onResponseReceived(event: Protocol.Network.ResponseReceivedEvent): void {
		const request = this.#networkEventManager.getRequest(event.requestId);
		let extraInfo = null;
		if (request && !request._fromMemoryCache && event.hasExtraInfo) {
			extraInfo = this.#networkEventManager
				.responseExtraInfo(event.requestId)
				.shift();
			if (!extraInfo) {
				// Wait until we get the corresponding ExtraInfo event.
				this.#networkEventManager.queueEventGroup(event.requestId, {
					responseReceivedEvent: event,
				});
				return;
			}
		}

		this.#emitResponseEvent(event, extraInfo);
	}

	#onResponseReceivedExtraInfo(
		event: Protocol.Network.ResponseReceivedExtraInfoEvent
	): void {
		// We may have skipped a redirect response/request pair due to waiting for
		// this ExtraInfo event. If so, continue that work now that we have the
		// request.
		const redirectInfo = this.#networkEventManager.takeQueuedRedirectInfo(
			event.requestId
		);
		if (redirectInfo) {
			this.#networkEventManager.responseExtraInfo(event.requestId).push(event);
			this.#onRequest(redirectInfo.event, redirectInfo.fetchRequestId);
			return;
		}

		// We may have skipped response and loading events because we didn't have
		// this ExtraInfo event yet. If so, emit those events now.
		const queuedEvents = this.#networkEventManager.getQueuedEventGroup(
			event.requestId
		);
		if (queuedEvents) {
			this.#networkEventManager.forgetQueuedEventGroup(event.requestId);
			this.#emitResponseEvent(queuedEvents.responseReceivedEvent, event);
			if (queuedEvents.loadingFinishedEvent) {
				this.#emitLoadingFinished(queuedEvents.loadingFinishedEvent);
			}

			if (queuedEvents.loadingFailedEvent) {
				this.#emitLoadingFailed(queuedEvents.loadingFailedEvent);
			}

			return;
		}

		// Wait until we get another event that can use this ExtraInfo event.
		this.#networkEventManager.responseExtraInfo(event.requestId).push(event);
	}

	#forgetRequest(request: HTTPRequest, events: boolean): void {
		const requestId = request._requestId;

		this.#networkEventManager.forgetRequest(requestId);

		if (events) {
			this.#networkEventManager.forget(requestId);
		}
	}

	#onLoadingFinished(event: Protocol.Network.LoadingFinishedEvent): void {
		// If the response event for this request is still waiting on a
		// corresponding ExtraInfo event, then wait to emit this event too.
		const queuedEvents = this.#networkEventManager.getQueuedEventGroup(
			event.requestId
		);
		if (queuedEvents) {
			queuedEvents.loadingFinishedEvent = event;
		} else {
			this.#emitLoadingFinished(event);
		}
	}

	#emitLoadingFinished(event: Protocol.Network.LoadingFinishedEvent): void {
		const request = this.#networkEventManager.getRequest(event.requestId);
		// For certain requestIds we never receive requestWillBeSent event.
		// @see https://crbug.com/750469
		if (!request) {
			return;
		}

		// Under certain conditions we never get the Network.responseReceived
		// event from protocol. @see https://crbug.com/883475
		if (request.response()) {
			request.response()?._resolveBody(null);
		}

		this.#forgetRequest(request, true);
	}

	#onLoadingFailed(event: Protocol.Network.LoadingFailedEvent): void {
		// If the response event for this request is still waiting on a
		// corresponding ExtraInfo event, then wait to emit this event too.
		const queuedEvents = this.#networkEventManager.getQueuedEventGroup(
			event.requestId
		);
		if (queuedEvents) {
			queuedEvents.loadingFailedEvent = event;
		} else {
			this.#emitLoadingFailed(event);
		}
	}

	#emitLoadingFailed(event: Protocol.Network.LoadingFailedEvent): void {
		const request = this.#networkEventManager.getRequest(event.requestId);
		// For certain requestIds we never receive requestWillBeSent event.
		// @see https://crbug.com/750469
		if (!request) {
			return;
		}

		const response = request.response();
		if (response) {
			response._resolveBody(null);
		}

		this.#forgetRequest(request, true);
	}
}
