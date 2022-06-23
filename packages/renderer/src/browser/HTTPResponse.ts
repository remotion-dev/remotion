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

export class HTTPResponse {
	#bodyLoadedPromiseFulfill: (err: Error | void) => void = () => undefined;
	#status: number;

	constructor(
		responsePayload: Protocol.Network.Response,
		extraInfo: Protocol.Network.ResponseReceivedExtraInfoEvent | null
	) {
		this.#status = extraInfo ? extraInfo.statusCode : responsePayload.status;
	}

	_resolveBody(err: Error | null): void {
		if (err) {
			return this.#bodyLoadedPromiseFulfill(err);
		}

		return this.#bodyLoadedPromiseFulfill();
	}

	status(): number {
		return this.#status;
	}
}
