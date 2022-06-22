/**
 * Copyright 2020 Google Inc. All rights reserved.
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
import {Frame} from './FrameManager';
import {HTTPResponse} from './HTTPResponse';

type ResourceType = Lowercase<Protocol.Network.ResourceType>;

export class HTTPRequest {
	_requestId: string;
	_failureText: string | null = null;
	_response: HTTPResponse | null = null;
	_fromMemoryCache = false;
	_redirectChain: HTTPRequest[];

	#isNavigationRequest: boolean;
	#url: string;
	#resourceType: ResourceType;

	#method: string;
	#postData?: string;
	#headers: Record<string, string> = {};
	#frame: Frame | null;

	#initiator: Protocol.Network.Initiator;

	constructor(
		frame: Frame | null,
		event: Protocol.Network.RequestWillBeSentEvent,
		redirectChain: HTTPRequest[]
	) {
		this._requestId = event.requestId;
		this.#isNavigationRequest =
			event.requestId === event.loaderId && event.type === 'Document';
		this.#url = event.request.url;
		this.#resourceType = (event.type || 'other').toLowerCase() as ResourceType;
		this.#method = event.request.method;
		this.#postData = event.request.postData;
		this.#frame = frame;
		this._redirectChain = redirectChain;
		this.#initiator = event.initiator;

		for (const [key, value] of Object.entries(event.request.headers)) {
			this.#headers[key.toLowerCase()] = value;
		}
	}

	url(): string {
		return this.#url;
	}

	resourceType(): ResourceType {
		return this.#resourceType;
	}

	method(): string {
		return this.#method;
	}

	postData(): string | undefined {
		return this.#postData;
	}

	headers(): Record<string, string> {
		return this.#headers;
	}

	response(): HTTPResponse | null {
		return this._response;
	}

	frame(): Frame | null {
		return this.#frame;
	}

	isNavigationRequest(): boolean {
		return this.#isNavigationRequest;
	}

	initiator(): Protocol.Network.Initiator {
		return this.#initiator;
	}

	redirectChain(): HTTPRequest[] {
		return this._redirectChain.slice();
	}

	failure(): {errorText: string} | null {
		if (!this._failureText) {
			return null;
		}

		return {
			errorText: this._failureText,
		};
	}
}
