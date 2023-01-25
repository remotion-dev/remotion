/**
 * Copyright 2018 Google Inc. All rights reserved.
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
import {promises as dns} from 'dns';
import {URL} from 'url';
import type {WS} from '../ws/ws-types';
import {ws as NodeWebSocket} from '../ws/ws-types';

interface ConnectionTransport {
	send(message: string): void;
	close(): void;
	onmessage?: (message: string) => void;
	onclose?: () => void;
}

export class NodeWebSocketTransport implements ConnectionTransport {
	static async create(urlString: string): Promise<NodeWebSocketTransport> {
		// Starting in Node 17, IPv6 is favoured over IPv4 due to a change
		// in a default option:
		// - https://github.com/nodejs/node/issues/40537,
		// Due to this, for Firefox, we must parse and resolve the `localhost` hostname
		// manually with the previous behavior according to:
		// - https://nodejs.org/api/dns.html#dnslookuphostname-options-callback
		// because of https://bugzilla.mozilla.org/show_bug.cgi?id=1769994.
		const url = new URL(urlString);
		if (url.hostname === 'localhost') {
			const {address} = await dns.lookup(url.hostname, {verbatim: false});
			url.hostname = address;
		}

		return new Promise((resolve, reject) => {
			const ws = new NodeWebSocket(url, [], {
				followRedirects: true,
				perMessageDeflate: false,
				maxPayload: 1024 * 1024 * 1024, // 1024Mb
				headers: {
					'User-Agent': `Remotion CLI`,
				},
			});

			ws.addEventListener('open', () => {
				return resolve(new NodeWebSocketTransport(ws));
			});
			ws.addEventListener('error', reject);
		});
	}

	#ws: WS;
	onmessage?: (message: string) => void;
	onclose?: () => void;

	constructor(ws: WS) {
		this.#ws = ws;
		this.#ws.addEventListener('message', (event) => {
			if (this.onmessage) {
				this.onmessage.call(null, event.data as string);
			}
		});
		this.#ws.addEventListener('close', () => {
			if (this.onclose) {
				this.onclose.call(null);
			}
		});
		// Silently ignore all errors - we don't know what to do with them.
		this.#ws.addEventListener('error', () => undefined);
	}

	send(message: string): void {
		this.#ws.send(message);
	}

	close(): void {
		this.#ws.close();
	}
}
