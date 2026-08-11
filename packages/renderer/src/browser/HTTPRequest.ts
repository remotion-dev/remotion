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
import type {RequestWillBeSentEvent} from './devtools-types';
import type {Frame} from './FrameManager';
import type {HTTPResponse} from './HTTPResponse';

export class HTTPRequest {
	_requestId: string;
	_response: HTTPResponse | null = null;
	_url: string | null = null;
	_fromMemoryCache = false;

	#isNavigationRequest: boolean;
	#frame: Frame | null;

	constructor(frame: Frame | null, event: RequestWillBeSentEvent) {
		this._requestId = event.requestId;
		this.#isNavigationRequest =
			event.requestId === event.loaderId && event.type === 'Document';
		this.#frame = frame;
		this._url = event.request.url;
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
}
