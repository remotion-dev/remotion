/**
 * Copyright 2019 Google Inc. All rights reserved.
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

import type {AnySourceMapConsumer} from '../symbolicate-stacktrace';
import type {BrowserContext, HeadlessBrowser} from './Browser';
import {Page} from './BrowserPage';
import type {CDPSession} from './Connection';
import type {TargetInfo} from './devtools-types';
import type {Viewport} from './PuppeteerViewport';

const isPagetTarget = (target: TargetInfo): boolean => {
	return (
		target.type === 'page' ||
		target.type === 'background_page' ||
		target.type === 'webview'
	);
};

export class Target {
	#browserContext: BrowserContext;
	#targetInfo: TargetInfo;
	#sessionFactory: () => Promise<CDPSession>;
	#defaultViewport: Viewport;
	#pagePromise?: Promise<Page>;

	_initializedPromise: Promise<boolean>;
	_initializedCallback!: (x: boolean) => void;
	_isClosedPromise: Promise<void>;
	_closedCallback!: () => void;
	_isInitialized: boolean;
	_targetId: string;

	constructor(
		targetInfo: TargetInfo,
		browserContext: BrowserContext,
		sessionFactory: () => Promise<CDPSession>,
		defaultViewport: Viewport
	) {
		this.#targetInfo = targetInfo;
		this.#browserContext = browserContext;
		this._targetId = targetInfo.targetId;
		this.#sessionFactory = sessionFactory;
		this.#defaultViewport = defaultViewport;
		this._initializedPromise = new Promise<boolean>((fulfill) => {
			this._initializedCallback = fulfill;
		}).then((success) => {
			if (!success) {
				return false;
			}

			const opener = this.opener();
			if (!opener || !opener.#pagePromise || this.type() !== 'page') {
				return true;
			}

			return true;
		});
		this._isClosedPromise = new Promise<void>((fulfill) => {
			this._closedCallback = fulfill;
		});
		this._isInitialized =
			!isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== '';
		if (this._isInitialized) {
			this._initializedCallback(true);
		}
	}

	/**
	 * Creates a Chrome Devtools Protocol session attached to the target.
	 */
	createCDPSession(): Promise<CDPSession> {
		return this.#sessionFactory();
	}

	_getTargetInfo(): TargetInfo {
		return this.#targetInfo;
	}

	/**
	 * If the target is not of type `"page"` or `"background_page"`, returns `null`.
	 */
	async page(
		sourcemapContext: AnySourceMapConsumer | null
	): Promise<Page | null> {
		if (isPagetTarget(this.#targetInfo) && !this.#pagePromise) {
			this.#pagePromise = this.#sessionFactory().then((client) => {
				return Page._create({
					client,
					target: this,
					defaultViewport: this.#defaultViewport ?? null,
					browser: this.browser(),
					sourcemapContext,
				});
			});
		}

		return (await this.#pagePromise) ?? null;
	}

	url(): string {
		return this.#targetInfo.url;
	}

	/**
	 * Identifies what kind of target this is.
	 *
	 * @remarks
	 *
	 * See {@link https://developer.chrome.com/extensions/background_pages | docs} for more info about background pages.
	 */
	type():
		| 'page'
		| 'background_page'
		| 'service_worker'
		| 'shared_worker'
		| 'other'
		| 'browser'
		| 'webview' {
		const {type} = this.#targetInfo;
		if (
			type === 'page' ||
			type === 'background_page' ||
			type === 'service_worker' ||
			type === 'shared_worker' ||
			type === 'browser' ||
			type === 'webview'
		) {
			return type;
		}

		return 'other';
	}

	/**
	 * Get the browser the target belongs to.
	 */
	browser(): HeadlessBrowser {
		return this.#browserContext.browser();
	}

	/**
	 * Get the browser context the target belongs to.
	 */
	browserContext(): BrowserContext {
		return this.#browserContext;
	}

	/**
	 * Get the target that opened this target. Top-level targets return `null`.
	 */
	opener(): Target | undefined {
		const {openerId} = this.#targetInfo;
		if (!openerId) {
			return;
		}

		return this.browser()._targets.get(openerId);
	}

	_targetInfoChanged(targetInfo: TargetInfo): void {
		this.#targetInfo = targetInfo;

		if (
			!this._isInitialized &&
			(!isPagetTarget(this.#targetInfo) || this.#targetInfo.url !== '')
		) {
			this._isInitialized = true;
			this._initializedCallback(true);
		}
	}
}
