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

import {assert} from './assert';
import {CDPSessionEmittedEvents} from './Connection';
import {TimeoutError} from './Errors';
import type {Frame, FrameManager} from './FrameManager';
import {FrameManagerEmittedEvents} from './FrameManager';
import type {HTTPRequest} from './HTTPRequest';
import type {HTTPResponse} from './HTTPResponse';
import {NetworkManagerEmittedEvents} from './NetworkManager';
import {addEventListener, removeEventListeners} from './util';
export type PuppeteerLifeCycleEvent = 'load';

type ProtocolLifeCycleEvent = 'load';

const puppeteerToProtocolLifecycle = new Map<
	PuppeteerLifeCycleEvent,
	ProtocolLifeCycleEvent
>([['load', 'load']]);

const noop = (): void => undefined;

export class LifecycleWatcher {
	#expectedLifecycle: ProtocolLifeCycleEvent[];
	#frameManager: FrameManager;
	#frame: Frame;
	#timeout: number;
	#navigationRequest: HTTPRequest | null = null;
	#eventListeners: (() => void)[];

	#sameDocumentNavigationCompleteCallback: (x?: Error) => void = noop;
	#sameDocumentNavigationPromise = new Promise<Error | undefined>((fulfill) => {
		this.#sameDocumentNavigationCompleteCallback = fulfill;
	});

	#lifecycleCallback: () => void = noop;
	#lifecyclePromise: Promise<void> = new Promise((fulfill) => {
		this.#lifecycleCallback = fulfill;
	});

	#newDocumentNavigationCompleteCallback: (x?: Error) => void = noop;
	#newDocumentNavigationPromise: Promise<Error | undefined> = new Promise(
		(fulfill) => {
			this.#newDocumentNavigationCompleteCallback = fulfill;
		},
	);

	#terminationCallback: (x?: Error) => void = noop;
	#terminationPromise: Promise<Error | undefined> = new Promise((fulfill) => {
		this.#terminationCallback = fulfill;
	});

	#timeoutPromise: Promise<TimeoutError | undefined>;

	#maximumTimer?: Timer;
	#hasSameDocumentNavigation?: boolean;
	#newDocumentNavigation?: boolean;
	#swapped?: boolean;

	constructor(
		frameManager: FrameManager,
		frame: Frame,
		waitUntil: PuppeteerLifeCycleEvent,
		timeout: number,
	) {
		const protocolEvent = puppeteerToProtocolLifecycle.get(waitUntil);
		assert(protocolEvent, 'Unknown value for options.waitUntil: ' + waitUntil);

		this.#expectedLifecycle = [waitUntil as ProtocolLifeCycleEvent];

		this.#frameManager = frameManager;
		this.#frame = frame;
		this.#timeout = timeout;
		this.#eventListeners = [
			addEventListener(
				frameManager._client,
				CDPSessionEmittedEvents.Disconnected,
				this.#terminate.bind(
					this,
					new Error('Navigation failed because browser has disconnected!'),
				),
			),
			addEventListener(
				this.#frameManager,
				FrameManagerEmittedEvents.LifecycleEvent,
				this.#checkLifecycleComplete.bind(this),
			),
			addEventListener(
				this.#frameManager,
				FrameManagerEmittedEvents.FrameNavigatedWithinDocument,
				this.#navigatedWithinDocument.bind(this),
			),
			addEventListener(
				this.#frameManager,
				FrameManagerEmittedEvents.FrameNavigated,
				this.#navigated.bind(this),
			),
			addEventListener(
				this.#frameManager,
				FrameManagerEmittedEvents.FrameSwapped,
				this.#frameSwapped.bind(this),
			),
			addEventListener(
				this.#frameManager,
				FrameManagerEmittedEvents.FrameDetached,
				this.#onFrameDetached.bind(this),
			),
			addEventListener(
				this.#frameManager.networkManager(),
				NetworkManagerEmittedEvents.Request,
				this.#onRequest.bind(this),
			),
		];

		this.#timeoutPromise = this.#createTimeoutPromise();
		this.#checkLifecycleComplete();
	}

	#onRequest(request: HTTPRequest): void {
		if (request.frame() !== this.#frame || !request.isNavigationRequest()) {
			return;
		}

		this.#navigationRequest = request;
	}

	#onFrameDetached(frame: Frame): void {
		if (this.#frame === frame) {
			this.#terminationCallback.call(
				null,
				new Error('Navigating frame was detached'),
			);
			return;
		}

		this.#checkLifecycleComplete();
	}

	navigationResponse(): HTTPResponse | null {
		if (!this.#navigationRequest) {
			return null;
		}

		const res = this.#navigationRequest.response();
		return res;
	}

	#terminate(error: Error): void {
		this.#terminationCallback.call(null, error);
	}

	sameDocumentNavigationPromise(): Promise<Error | undefined> {
		return this.#sameDocumentNavigationPromise;
	}

	newDocumentNavigationPromise(): Promise<Error | undefined> {
		return this.#newDocumentNavigationPromise;
	}

	lifecyclePromise(): Promise<void> {
		return this.#lifecyclePromise;
	}

	timeoutOrTerminationPromise(): Promise<Error | TimeoutError | undefined> {
		return Promise.race([this.#timeoutPromise, this.#terminationPromise]);
	}

	async #createTimeoutPromise(): Promise<TimeoutError | undefined> {
		if (!this.#timeout) {
			return new Promise(noop);
		}

		const errorMessage =
			'Navigation timeout of ' + this.#timeout + ' ms exceeded';
		await new Promise((fulfill) => {
			this.#maximumTimer = setTimeout(fulfill, this.#timeout);
		});
		return new TimeoutError(errorMessage);
	}

	#navigatedWithinDocument(frame: Frame): void {
		if (frame !== this.#frame) {
			return;
		}

		this.#hasSameDocumentNavigation = true;
		this.#checkLifecycleComplete();
	}

	#navigated(frame: Frame): void {
		if (frame !== this.#frame) {
			return;
		}

		this.#newDocumentNavigation = true;
		this.#checkLifecycleComplete();
	}

	#frameSwapped(frame: Frame): void {
		if (frame !== this.#frame) {
			return;
		}

		this.#swapped = true;
		this.#checkLifecycleComplete();
	}

	#checkLifecycleComplete(): void {
		// We expect navigation to commit.
		if (!checkLifecycle(this.#frame, this.#expectedLifecycle)) {
			return;
		}

		this.#lifecycleCallback();
		if (this.#hasSameDocumentNavigation) {
			this.#sameDocumentNavigationCompleteCallback();
		}

		if (this.#swapped || this.#newDocumentNavigation) {
			this.#newDocumentNavigationCompleteCallback();
		}

		function checkLifecycle(
			frame: Frame,
			expectedLifecycle: ProtocolLifeCycleEvent[],
		): boolean {
			for (const event of expectedLifecycle) {
				if (!frame._lifecycleEvents.has(event)) {
					return false;
				}
			}

			for (const child of frame.childFrames()) {
				if (
					child._hasStartedLoading &&
					!checkLifecycle(child, expectedLifecycle)
				) {
					return false;
				}
			}

			return true;
		}
	}

	dispose(): void {
		removeEventListeners(this.#eventListeners);
		if (this.#maximumTimer !== undefined) {
			clearTimeout(this.#maximumTimer);
		}
	}
}
