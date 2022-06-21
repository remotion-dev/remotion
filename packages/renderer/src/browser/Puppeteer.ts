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
import {Browser} from './Browser';
import {BrowserConnectOptions, _connectToBrowser} from './BrowserConnector';
import {ConnectionTransport} from './ConnectionTransport';
import {Product} from './Product';

/**
 * @public
 */
export interface ConnectOptions extends BrowserConnectOptions {
	browserWSEndpoint: string;
	transport: ConnectionTransport;
	product: Product;
}

export class Puppeteer {
	protected _changedProduct = false;

	/**
	 * @internal
	 */
	constructor() {
		this.connect = this.connect.bind(this);
	}

	connect(options: ConnectOptions): Promise<Browser> {
		return _connectToBrowser(options);
	}
}
