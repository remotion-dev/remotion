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

import {assert} from './assert';
import type {Browser} from './Browser';
import type {CDPSession} from './Connection';
import type {ConsoleMessageType} from './ConsoleMessage';
import {ConsoleMessage} from './ConsoleMessage';
import type {
	AttachedToTargetEvent,
	BindingCalledEvent,
	ConsoleAPICalledEvent,
	EntryAddedEvent,
	StackTrace,
} from './devtools-types';
import type {
	EvaluateFn,
	EvaluateFnReturnType,
	EvaluateHandleFn,
	SerializableOrJSHandle,
	UnwrapPromiseLike,
} from './EvalTypes';
import {EventEmitter} from './EventEmitter';
import type {Frame} from './FrameManager';
import {FrameManager} from './FrameManager';
import type {HTTPResponse} from './HTTPResponse';
import type {JSHandle} from './JSHandle';
import {_createJSHandle} from './JSHandle';
import type {Viewport} from './PuppeteerViewport';
import type {Target} from './Target';
import {TaskQueue} from './TaskQueue';
import {TimeoutSettings} from './TimeoutSettings';
import {
	evaluationString,
	isErrorLike,
	pageBindingDeliverErrorString,
	pageBindingDeliverErrorValueString,
	pageBindingDeliverResultString,
	releaseObject,
	valueFromRemoteObject,
} from './util';

interface WaitForOptions {
	timeout?: number;
}

const enum PageEmittedEvents {
	Console = 'console',
	Error = 'error',
}

interface PageEventObject {
	console: ConsoleMessage;
	error: Error;
}

export class Page extends EventEmitter {
	static async _create(
		client: CDPSession,
		target: Target,
		defaultViewport: Viewport,
		browser: Browser
	): Promise<Page> {
		const page = new Page(client, target, browser);
		await page.#initialize();
		await page.setViewport(defaultViewport);

		return page;
	}

	#closed = false;
	#client: CDPSession;
	#target: Target;
	#timeoutSettings = new TimeoutSettings();
	#frameManager: FrameManager;
	#pageBindings = new Map<string, Function>();
	browser: Browser;
	screenshotTaskQueue: TaskQueue;

	constructor(client: CDPSession, target: Target, browser: Browser) {
		super();
		this.#client = client;
		this.#target = target;
		this.#frameManager = new FrameManager(client, this, this.#timeoutSettings);
		this.screenshotTaskQueue = new TaskQueue();
		this.browser = browser;

		client.on('Target.attachedToTarget', (event: AttachedToTargetEvent) => {
			switch (event.targetInfo.type) {
				case 'iframe':
					break;
				case 'worker':
					break;
				default:
					// If we don't detach from service workers, they will never die.
					// We still want to attach to workers for emitting events.
					// We still want to attach to iframes so sessions may interact with them.
					// We detach from all other types out of an abundance of caution.
					// See https://source.chromium.org/chromium/chromium/src/+/main:content/browser/devtools/devtools_agent_host_impl.cc?ss=chromium&q=f:devtools%20-f:out%20%22::kTypePage%5B%5D%22
					// for the complete list of available types.
					client
						.send('Target.detachFromTarget', {
							sessionId: event.sessionId,
						})
						.catch((err) => console.log(err));
			}
		});

		client.on('Runtime.consoleAPICalled', (event) => {
			return this.#onConsoleAPI(event);
		});
		client.on('Runtime.bindingCalled', (event) => {
			return this.#onBindingCalled(event);
		});
		client.on('Inspector.targetCrashed', () => {
			return this.#onTargetCrashed();
		});
		client.on('Log.entryAdded', (event) => {
			return this.#onLogEntryAdded(event);
		});
	}

	async #initialize(): Promise<void> {
		await Promise.all([
			this.#frameManager.initialize(),
			this.#client.send('Target.setAutoAttach', {
				autoAttach: true,
				waitForDebuggerOnStart: false,
				flatten: true,
			}),
			this.#client.send('Performance.enable'),
			this.#client.send('Log.enable'),
		]);
	}

	/**
	 * Listen to page events.
	 */
	// Note: this method exists to define event typings and handle
	// proper wireup of cooperative request interception. Actual event listening and
	// dispatching is delegated to EventEmitter.
	public override on<K extends keyof PageEventObject>(
		eventName: K,
		handler: (event: PageEventObject[K]) => void
	): EventEmitter {
		return super.on(eventName, handler);
	}

	public override once<K extends keyof PageEventObject>(
		eventName: K,
		handler: (event: PageEventObject[K]) => void
	): EventEmitter {
		// Note: this method only exists to define the types; we delegate the impl
		// to EventEmitter.
		return super.once(eventName, handler);
	}

	override off<K extends keyof PageEventObject>(
		eventName: K,
		handler: (event: PageEventObject[K]) => void
	): EventEmitter {
		return super.off(eventName, handler);
	}

	/**
	 * @returns A target this page was created from.
	 */
	target(): Target {
		return this.#target;
	}

	_client(): CDPSession {
		return this.#client;
	}

	#onTargetCrashed(): void {
		this.emit('error', new Error('Page crashed!'));
	}

	#onLogEntryAdded(event: EntryAddedEvent): void {
		const {level, text, args, source, url, lineNumber} = event.entry;
		if (args) {
			args.map((arg) => {
				return releaseObject(this.#client, arg);
			});
		}

		if (source !== 'worker') {
			this.emit(
				PageEmittedEvents.Console,
				new ConsoleMessage(level, text, [], [{url, lineNumber}])
			);
		}
	}

	/**
	 * @returns The page's main frame.
	 * @remarks
	 * Page is guaranteed to have a main frame which persists during navigations.
	 */
	mainFrame(): Frame {
		return this.#frameManager.mainFrame();
	}

	setViewport(viewport: Viewport): Promise<void> {
		return this.#client.send('Emulation.setDeviceMetricsOverride', {
			mobile: false,
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: viewport.deviceScaleFactor,
			screenOrientation: {
				angle: 0,
				type: 'portraitPrimary',
			},
		});
	}

	setDefaultNavigationTimeout(timeout: number): void {
		this.#timeoutSettings.setDefaultNavigationTimeout(timeout);
	}

	setDefaultTimeout(timeout: number): void {
		this.#timeoutSettings.setDefaultTimeout(timeout);
	}

	async evaluateHandle<HandlerType extends JSHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandlerType> {
		const context = await this.mainFrame().executionContext();
		return context.evaluateHandle<HandlerType>(pageFunction, ...args);
	}

	#onConsoleAPI(event: ConsoleAPICalledEvent): void {
		if (event.executionContextId === 0) {
			return;
		}

		const context = this.#frameManager.executionContextById(
			event.executionContextId,
			this.#client
		);
		const values = event.args.map((arg) => {
			return _createJSHandle(context, arg);
		});
		this.#addConsoleMessage(event.type, values, event.stackTrace);
	}

	async #onBindingCalled(event: BindingCalledEvent): Promise<void> {
		let payload: {type: string; name: string; seq: number; args: unknown[]};
		try {
			payload = JSON.parse(event.payload);
		} catch {
			// The binding was either called by something in the page or it was
			// called before our wrapper was initialized.
			return;
		}

		const {type, name, seq, args} = payload;
		if (type !== 'exposedFun' || !this.#pageBindings.has(name)) {
			return;
		}

		let expression = null;
		try {
			const pageBinding = this.#pageBindings.get(name);
			assert(pageBinding);
			const result = await pageBinding(...args);
			expression = pageBindingDeliverResultString(name, seq, result);
		} catch (_error) {
			if (isErrorLike(_error)) {
				expression = pageBindingDeliverErrorString(
					name,
					seq,
					_error.message,
					_error.stack
				);
			} else {
				expression = pageBindingDeliverErrorValueString(name, seq, _error);
			}
		}

		this.#client.send('Runtime.evaluate', {
			expression,
			contextId: event.executionContextId,
		});
	}

	#addConsoleMessage(
		eventType: ConsoleMessageType,
		args: JSHandle[],
		stackTrace?: StackTrace
	): void {
		if (!this.listenerCount(PageEmittedEvents.Console)) {
			args.forEach((arg) => {
				return arg.dispose();
			});
			return;
		}

		const textTokens = [];
		for (const arg of args) {
			const remoteObject = arg._remoteObject;
			if (remoteObject.objectId) {
				textTokens.push(arg.toString());
			} else {
				textTokens.push(valueFromRemoteObject(remoteObject));
			}
		}

		const stackTraceLocations = [];
		if (stackTrace) {
			for (const callFrame of stackTrace.callFrames) {
				stackTraceLocations.push({
					url: callFrame.url,
					lineNumber: callFrame.lineNumber,
					columnNumber: callFrame.columnNumber,
				});
			}
		}

		const message = new ConsoleMessage(
			eventType,
			textTokens.join(' '),
			args,
			stackTraceLocations
		);
		this.emit(PageEmittedEvents.Console, message);
	}

	url(): string {
		return this.mainFrame().url();
	}

	goto(
		url: string,
		options: WaitForOptions & {referer?: string} = {}
	): Promise<HTTPResponse | null> {
		return this.#frameManager.mainFrame().goto(url, options);
	}

	async bringToFront(): Promise<void> {
		await this.#client.send('Page.bringToFront');
	}

	evaluate<T extends EvaluateFn>(
		pageFunction: T,
		...args: SerializableOrJSHandle[]
	): Promise<UnwrapPromiseLike<EvaluateFnReturnType<T>>> {
		return this.#frameManager.mainFrame().evaluate<T>(pageFunction, ...args);
	}

	async evaluateOnNewDocument(
		pageFunction: Function | string,
		...args: unknown[]
	): Promise<void> {
		const source = evaluationString(pageFunction, ...args);
		await this.#client.send('Page.addScriptToEvaluateOnNewDocument', {
			source,
		});
	}

	async close(
		options: {runBeforeUnload?: boolean} = {runBeforeUnload: undefined}
	): Promise<void> {
		const connection = this.#client.connection();
		assert(
			connection,
			'Protocol error: Connection closed. Most likely the page has been closed.'
		);
		const runBeforeUnload = Boolean(options.runBeforeUnload);
		if (runBeforeUnload) {
			await this.#client.send('Page.close');
		} else {
			await connection.send('Target.closeTarget', {
				targetId: this.#target._targetId,
			});
			await this.#target._isClosedPromise;
		}
	}

	isClosed(): boolean {
		return this.#closed;
	}

	waitForFunction(
		browser: Browser,
		pageFunction: Function | string,
		...args: SerializableOrJSHandle[]
	): Promise<JSHandle> {
		return this.mainFrame().waitForFunction(browser, pageFunction, ...args);
	}
}
