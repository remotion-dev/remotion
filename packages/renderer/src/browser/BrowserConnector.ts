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

import {assert} from './assert';
import {Browser} from './Browser';
import {Connection} from './Connection';
import {ConnectionTransport} from './ConnectionTransport';
import {NodeWebSocketTransport} from './NodeWebSocketTransport';
import {Viewport} from './PuppeteerViewport';

export interface BrowserConnectOptions {
	defaultViewport: Viewport;
}

const getWebSocketTransportClass = () => {
	return NodeWebSocketTransport;
};

export type ConnectToBrowserOptions = BrowserConnectOptions & {
	browserWSEndpoint: string;
	transport: ConnectionTransport;
};

export async function _connectToBrowser(
	options: ConnectToBrowserOptions
): Promise<Browser> {
	const {browserWSEndpoint, defaultViewport, transport} = options;

	assert(
		Number(Boolean(browserWSEndpoint)) + Number(Boolean(transport)) === 1,
		'Exactly one of browserWSEndpoint, browserURL or transport must be passed to puppeteer.connect'
	);

	let connection!: Connection;
	if (transport) {
		connection = new Connection('', transport);
	} else if (browserWSEndpoint) {
		const WebSocketClass = getWebSocketTransportClass();
		const connectionTransport: ConnectionTransport =
			await WebSocketClass.create(browserWSEndpoint);
		connection = new Connection(browserWSEndpoint, connectionTransport);
	}

	const {browserContextIds} = await connection.send(
		'Target.getBrowserContexts'
	);
	return Browser._create({
		connection,
		contextIds: browserContextIds,
		defaultViewport,
		process: undefined,
		closeCallback: () => {
			return connection.send('Browser.close').catch(() => undefined);
		},
	});
}
