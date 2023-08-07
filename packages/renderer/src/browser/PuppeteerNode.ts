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

import type {HeadlessBrowser} from './Browser';
import type {BrowserConnectOptions} from './BrowserConnector';
import type {ProductLauncher} from './Launcher';
import {ChromeLauncher} from './Launcher';
import type {
	BrowserLaunchArgumentOptions,
	LaunchOptions,
} from './LaunchOptions';
import type {Product} from './Product';
import {PUPPETEER_REVISIONS} from './revisions';

interface PuppeteerLaunchOptions
	extends LaunchOptions,
		BrowserLaunchArgumentOptions,
		BrowserConnectOptions {
	product?: Product;
	extraPrefsFirefox?: Record<string, unknown>;
}

export class PuppeteerNode {
	#lazyLauncher?: ProductLauncher;
	#productName?: Product;

	_preferredRevision: string;

	constructor(settings: {preferredRevision: string; productName?: Product}) {
		const {preferredRevision, productName} = settings;
		this.#productName = productName;
		this._preferredRevision = preferredRevision;

		this.launch = this.launch.bind(this);
		this.executablePath = this.executablePath.bind(this);
	}

	launch(options: PuppeteerLaunchOptions): Promise<HeadlessBrowser> {
		if (options.product) {
			this.#productName = options.product;
		}

		return this._launcher.launch(options);
	}

	executablePath(channel?: string): string {
		return this._launcher.executablePath(channel);
	}

	get _launcher(): ProductLauncher {
		if (
			!this.#lazyLauncher ||
			this.#lazyLauncher.product !== this.#productName
		) {
			switch (this.#productName) {
				case 'chrome':
				default:
					this._preferredRevision = PUPPETEER_REVISIONS.chromium;
			}

			this.#lazyLauncher = new ChromeLauncher(this._preferredRevision);
		}

		return this.#lazyLauncher;
	}

	get product(): string {
		return this._launcher.product;
	}
}
