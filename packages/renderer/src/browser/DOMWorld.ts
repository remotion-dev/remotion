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
import {TimeoutError} from './Errors';
import {
	EvaluateFn,
	EvaluateFnReturnType,
	EvaluateHandleFn,
	SerializableOrJSHandle,
	UnwrapPromiseLike,
} from './EvalTypes';
import {ExecutionContext} from './ExecutionContext';
import {Frame} from './FrameManager';
import {ElementHandle, JSHandle} from './JSHandle';
import {TimeoutSettings} from './TimeoutSettings';
import {isString} from './util';

export class DOMWorld {
	#frame: Frame;
	#timeoutSettings: TimeoutSettings;
	#documentPromise: Promise<ElementHandle> | null = null;
	#contextPromise: Promise<ExecutionContext> | null = null;
	#contextResolveCallback: ((x: ExecutionContext) => void) | null = null;
	#detached = false;

	#waitTasks = new Set<WaitTask>();

	get _waitTasks(): Set<WaitTask> {
		return this.#waitTasks;
	}

	constructor(frame: Frame, timeoutSettings: TimeoutSettings) {
		// Keep own reference to client because it might differ from the FrameManager's
		// client for OOP iframes.
		this.#frame = frame;
		this.#timeoutSettings = timeoutSettings;
		this._setContext(null);
	}

	frame(): Frame {
		return this.#frame;
	}

	_setContext(context: ExecutionContext | null): void {
		if (context) {
			assert(
				this.#contextResolveCallback,
				'Execution Context has already been set.'
			);
			this.#contextResolveCallback?.call(null, context);
			this.#contextResolveCallback = null;
			for (const waitTask of this._waitTasks) {
				waitTask.rerun();
			}
		} else {
			this.#documentPromise = null;
			this.#contextPromise = new Promise((fulfill) => {
				this.#contextResolveCallback = fulfill;
			});
		}
	}

	_hasContext(): boolean {
		return !this.#contextResolveCallback;
	}

	_detach(): void {
		this.#detached = true;
		for (const waitTask of this._waitTasks) {
			waitTask.terminate(
				new Error('waitForFunction failed: frame got detached.')
			);
		}
	}

	executionContext(): Promise<ExecutionContext> {
		if (this.#detached) {
			throw new Error(
				`Execution context is not available in detached frame "${this.#frame.url()}" (are you trying to evaluate?)`
			);
		}

		if (this.#contextPromise === null) {
			throw new Error(`Execution content promise is missing`);
		}

		return this.#contextPromise;
	}

	async evaluateHandle<HandlerType extends JSHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandlerType> {
		const context = await this.executionContext();
		return context.evaluateHandle(pageFunction, ...args);
	}

	async evaluate<T extends EvaluateFn>(
		pageFunction: T,
		...args: SerializableOrJSHandle[]
	): Promise<UnwrapPromiseLike<EvaluateFnReturnType<T>>> {
		const context = await this.executionContext();
		return context.evaluate<UnwrapPromiseLike<EvaluateFnReturnType<T>>>(
			pageFunction,
			...args
		);
	}

	_document(): Promise<ElementHandle> {
		if (this.#documentPromise) {
			return this.#documentPromise;
		}

		this.#documentPromise = this.executionContext().then(async (context) => {
			const document = await context.evaluateHandle('document');
			const element = document.asElement();
			if (element === null) {
				throw new Error('Document is null');
			}

			return element;
		});
		return this.#documentPromise;
	}

	waitForFunction(
		pageFunction: Function | string,
		...args: SerializableOrJSHandle[]
	): Promise<JSHandle> {
		const timeout = this.#timeoutSettings.timeout();
		const waitTaskOptions: WaitTaskOptions = {
			domWorld: this,
			predicateBody: pageFunction,
			title: 'function',
			timeout,
			args,
		};
		const waitTask = new WaitTask(waitTaskOptions);
		return waitTask.promise;
	}

	title(): Promise<string> {
		return this.evaluate(() => {
			return document.title;
		});
	}
}

interface WaitTaskOptions {
	domWorld: DOMWorld;
	predicateBody: Function | string;
	title: string;
	timeout: number;
	args: SerializableOrJSHandle[];
}

const noop = (): void => undefined;

class WaitTask {
	#domWorld: DOMWorld;
	#timeout: number;
	#predicateBody: string;
	#args: SerializableOrJSHandle[];
	#runCount = 0;
	#resolve: (x: JSHandle) => void = noop;
	#reject: (x: Error) => void = noop;
	#timeoutTimer?: NodeJS.Timeout;
	#terminated = false;

	promise: Promise<JSHandle>;

	constructor(options: WaitTaskOptions) {
		function getPredicateBody(predicateBody: Function | string) {
			if (isString(predicateBody)) {
				return `return (${predicateBody});`;
			}

			return `return (${predicateBody})(...args);`;
		}

		this.#domWorld = options.domWorld;
		this.#timeout = options.timeout;
		this.#predicateBody = getPredicateBody(options.predicateBody);
		this.#args = options.args;
		this.#runCount = 0;
		this.#domWorld._waitTasks.add(this);

		this.promise = new Promise<JSHandle>((resolve, reject) => {
			this.#resolve = resolve;
			this.#reject = reject;
		});
		// Since page navigation requires us to re-install the pageScript, we should track
		// timeout on our end.
		if (options.timeout) {
			const timeoutError = new TimeoutError(
				`waiting for ${options.title} failed: timeout ${options.timeout}ms exceeded`
			);
			this.#timeoutTimer = setTimeout(() => {
				return this.terminate(timeoutError);
			}, options.timeout);
		}

		this.rerun();
	}

	terminate(error: Error): void {
		this.#terminated = true;
		this.#reject(error);
		this.#cleanup();
	}

	async rerun(): Promise<void> {
		const runCount = ++this.#runCount;
		let success: JSHandle | null = null;
		let error: Error | null = null;
		const context = await this.#domWorld.executionContext();
		if (this.#terminated || runCount !== this.#runCount) {
			return;
		}

		if (this.#terminated || runCount !== this.#runCount) {
			return;
		}

		try {
			success = await context.evaluateHandle(
				waitForPredicatePageFunction,
				this.#predicateBody,
				this.#timeout,
				...this.#args
			);
		} catch (error_) {
			error = error_ as Error;
		}

		if (this.#terminated || runCount !== this.#runCount) {
			if (success) {
				await success.dispose();
			}

			return;
		}

		// Ignore timeouts in pageScript - we track timeouts ourselves.
		// If the frame's execution context has already changed, `frame.evaluate` will
		// throw an error - ignore this predicate run altogether.
		if (
			!error &&
			(await this.#domWorld
				.evaluate((s) => {
					return !s;
				}, success)
				.catch(() => {
					return true;
				}))
		) {
			if (!success) {
				throw new Error('Assertion: result handle is not available');
			}

			await success.dispose();
			return;
		}

		if (error) {
			if (error.message.includes('TypeError: binding is not a function')) {
				return this.rerun();
			}

			// When frame is detached the task should have been terminated by the DOMWorld.
			// This can fail if we were adding this task while the frame was detached,
			// so we terminate here instead.
			if (
				error.message.includes(
					'Execution context is not available in detached frame'
				)
			) {
				this.terminate(
					new Error('waitForFunction failed: frame got detached.')
				);
				return;
			}

			// When the page is navigated, the promise is rejected.
			// We will try again in the new execution context.
			if (error.message.includes('Execution context was destroyed')) {
				return;
			}

			// We could have tried to evaluate in a context which was already
			// destroyed.
			if (error.message.includes('Cannot find context with specified id')) {
				return;
			}

			this.#reject(error);
		} else {
			if (!success) {
				throw new Error('Assertion: result handle is not available');
			}

			this.#resolve(success);
		}

		this.#cleanup();
	}

	#cleanup(): void {
		if (this.#timeoutTimer !== undefined) {
			clearTimeout(this.#timeoutTimer);
		}

		this.#domWorld._waitTasks.delete(this);
	}
}

function waitForPredicatePageFunction(
	predicateBody: string,
	timeout: number,
	...args: unknown[]
): Promise<unknown> {
	// eslint-disable-next-line no-new-func
	const predicate = new Function('...args', predicateBody);
	let timedOut = false;
	if (timeout) {
		setTimeout(() => {
			timedOut = true;
		}, timeout);
	}

	return new Promise<JSHandle | undefined>((resolve) => {
		async function onRaf(): Promise<void> {
			if (timedOut) {
				resolve(undefined);
				return;
			}

			const success = await predicate(...args);
			if (success) {
				resolve(success);
			} else {
				requestAnimationFrame(onRaf);
			}
		}

		onRaf();
	});
}
