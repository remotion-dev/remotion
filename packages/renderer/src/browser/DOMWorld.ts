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

import {Protocol} from 'devtools-protocol';
import {assert} from './assert';
import {CDPSession} from './Connection';
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
import {debugError, isString, pageBindingInitString} from './util';

/**
 * @internal
 */
interface PageBinding {
	name: string;
	pptrFunction: Function;
}

/**
 * @internal
 */
export class DOMWorld {
	#client: CDPSession;
	#frame: Frame;
	#timeoutSettings: TimeoutSettings;
	#documentPromise: Promise<ElementHandle> | null = null;
	#contextPromise: Promise<ExecutionContext> | null = null;
	#contextResolveCallback: ((x: ExecutionContext) => void) | null = null;
	#detached = false;

	// Set of bindings that have been registered in the current context.
	#ctxBindings = new Set<string>();

	// Contains mapping from functions that should be bound to Puppeteer functions.
	#boundFunctions = new Map<string, Function>();
	#waitTasks = new Set<WaitTask>();

	/**
	 * @internal
	 */
	get _waitTasks(): Set<WaitTask> {
		return this.#waitTasks;
	}

	/**
	 * @internal
	 */
	get _boundFunctions(): Map<string, Function> {
		return this.#boundFunctions;
	}

	static #bindingIdentifier = (name: string, contextId: number) => {
		return `${name}_${contextId}`;
	};

	constructor(
		client: CDPSession,
		frame: Frame,
		timeoutSettings: TimeoutSettings
	) {
		// Keep own reference to client because it might differ from the FrameManager's
		// client for OOP iframes.
		this.#client = client;
		this.#frame = frame;
		this.#timeoutSettings = timeoutSettings;
		this._setContext(null);
		this.#client.on('Runtime.bindingCalled', this.#onBindingCalled);
	}

	frame(): Frame {
		return this.#frame;
	}

	/**
	 * @internal
	 */
	async _setContext(context: ExecutionContext | null): Promise<void> {
		if (context) {
			assert(
				this.#contextResolveCallback,
				'Execution Context has already been set.'
			);
			this.#ctxBindings.clear();
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

	/**
	 * @internal
	 */
	_hasContext(): boolean {
		return !this.#contextResolveCallback;
	}

	/**
	 * @internal
	 */
	_detach(): void {
		this.#detached = true;
		this.#client.off('Runtime.bindingCalled', this.#onBindingCalled);
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

	/**
	 * @internal
	 */
	async _document(): Promise<ElementHandle> {
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

	// If multiple waitFor are set up asynchronously, we need to wait for the
	// first one to set up the binding in the page before running the others.
	#settingUpBinding: Promise<void> | null = null;

	/**
	 * @internal
	 */
	async _addBindingToContext(
		context: ExecutionContext,
		name: string
	): Promise<void> {
		// Previous operation added the binding so we are done.
		if (
			this.#ctxBindings.has(
				DOMWorld.#bindingIdentifier(name, context._contextId)
			)
		) {
			return;
		}

		// Wait for other operation to finish
		if (this.#settingUpBinding) {
			await this.#settingUpBinding;
			return this._addBindingToContext(context, name);
		}

		const bind = async (_name: string) => {
			const expression = pageBindingInitString('internal', _name);
			try {
				await context._client.send('Runtime.addBinding', {
					name: _name,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					executionContextName: context._contextName,
				});
				await context.evaluate(expression);
			} catch (error) {
				// We could have tried to evaluate in a context which was already
				// destroyed. This happens, for example, if the page is navigated while
				// we are trying to add the binding
				const ctxDestroyed = (error as Error).message.includes(
					'Execution context was destroyed'
				);
				const ctxNotFound = (error as Error).message.includes(
					'Cannot find context with specified id'
				);
				if (ctxDestroyed || ctxNotFound) {
					return;
				}

				debugError(error);
				return;
			}

			this.#ctxBindings.add(
				DOMWorld.#bindingIdentifier(_name, context._contextId)
			);
		};

		this.#settingUpBinding = bind(name);
		await this.#settingUpBinding;
		this.#settingUpBinding = null;
	}

	#onBindingCalled = async (
		event: Protocol.Runtime.BindingCalledEvent
	): Promise<void> => {
		let payload: {type: string; name: string; seq: number; args: unknown[]};
		if (!this._hasContext()) {
			return;
		}

		const context = await this.executionContext();
		try {
			payload = JSON.parse(event.payload);
		} catch {
			// The binding was either called by something in the page or it was
			// called before our wrapper was initialized.
			return;
		}

		const {type, name, seq, args} = payload;
		if (
			type !== 'internal' ||
			!this.#ctxBindings.has(
				DOMWorld.#bindingIdentifier(name, context._contextId)
			)
		) {
			return;
		}

		if (context._contextId !== event.executionContextId) {
			return;
		}

		try {
			const fn = this._boundFunctions.get(name);
			if (!fn) {
				throw new Error(`Bound function $name is not found`);
			}

			const result = await fn(...args);
			await context.evaluate(deliverResult, name, seq, result);
		} catch (error) {
			// The WaitTask may already have been resolved by timing out, or the
			// exection context may have been destroyed.
			// In both caes, the promises above are rejected with a protocol error.
			// We can safely ignores these, as the WaitTask is re-installed in
			// the next execution context if needed.
			if ((error as Error).message.includes('Protocol error')) {
				return;
			}

			debugError(error);
		}

		function deliverResult(_name: string, _seq: number, result: unknown): void {
			(globalThis as any)[_name].callbacks.get(_seq).resolve(result);
			(globalThis as any)[_name].callbacks.delete(_seq);
		}
	};

	waitForFunction(
		pageFunction: Function | string,
		...args: SerializableOrJSHandle[]
	): Promise<JSHandle> {
		const timeout = this.#timeoutSettings.timeout();
		const waitTaskOptions: WaitTaskOptions = {
			domWorld: this,
			predicateBody: pageFunction,
			predicateAcceptsContextElement: false,
			title: 'function',
			timeout,
			args,
		};
		const waitTask = new WaitTask(waitTaskOptions);
		return waitTask.promise;
	}

	async title(): Promise<string> {
		return this.evaluate(() => {
			return document.title;
		});
	}
}

/**
 * @internal
 */
interface WaitTaskOptions {
	domWorld: DOMWorld;
	predicateBody: Function | string;
	predicateAcceptsContextElement: boolean;
	title: string;
	timeout: number;
	binding?: PageBinding;
	args: SerializableOrJSHandle[];
	root?: ElementHandle;
}

const noop = (): void => undefined;

/**
 * @internal
 */
class WaitTask {
	#domWorld: DOMWorld;
	#timeout: number;
	#predicateBody: string;
	#predicateAcceptsContextElement: boolean;
	#args: SerializableOrJSHandle[];
	#binding?: PageBinding;
	#runCount = 0;
	#resolve: (x: JSHandle) => void = noop;
	#reject: (x: Error) => void = noop;
	#timeoutTimer?: NodeJS.Timeout;
	#terminated = false;
	#root: ElementHandle | null = null;

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
		this.#root = options.root || null;
		this.#predicateBody = getPredicateBody(options.predicateBody);
		this.#predicateAcceptsContextElement =
			options.predicateAcceptsContextElement;
		this.#args = options.args;
		this.#binding = options.binding;
		this.#runCount = 0;
		this.#domWorld._waitTasks.add(this);
		if (this.#binding) {
			this.#domWorld._boundFunctions.set(
				this.#binding.name,
				this.#binding.pptrFunction
			);
		}

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

		if (this.#binding) {
			await this.#domWorld._addBindingToContext(context, this.#binding.name);
		}

		if (this.#terminated || runCount !== this.#runCount) {
			return;
		}

		try {
			success = await context.evaluateHandle(
				waitForPredicatePageFunction,
				this.#root || null,
				this.#predicateBody,
				this.#predicateAcceptsContextElement,
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

async function waitForPredicatePageFunction(
	root: Element | Document | null,
	predicateBody: string,
	predicateAcceptsContextElement: boolean,
	timeout: number,
	...args: unknown[]
): Promise<unknown> {
	root = root || document;
	// eslint-disable-next-line no-new-func
	const predicate = new Function('...args', predicateBody);
	let timedOut = false;
	if (timeout) {
		setTimeout(() => {
			timedOut = true;
		}, timeout);
	}

	return async function (): Promise<unknown> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		let fulfill = (__?: unknown): void => undefined;
		const result = new Promise((x) => {
			fulfill = x;
		});
		await onRaf();
		return result;

		async function onRaf(): Promise<void> {
			if (timedOut) {
				fulfill();
				return;
			}

			const success = predicateAcceptsContextElement
				? await predicate(root, ...args)
				: await predicate(...args);
			if (success) {
				fulfill(success);
			} else {
				requestAnimationFrame(onRaf);
			}
		}
	};
}
