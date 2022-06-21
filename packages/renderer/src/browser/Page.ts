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

import {Protocol} from 'devtools-protocol';
import {assert} from './assert';
import {Browser, BrowserContext} from './Browser';
import {CDPSession} from './Connection';
import {ConsoleMessage, ConsoleMessageType} from './ConsoleMessage';
import {EmulationManager} from './EmulationManager';
import {
	EvaluateFn,
	EvaluateFnReturnType,
	EvaluateHandleFn,
	SerializableOrJSHandle,
	UnwrapPromiseLike,
} from './EvalTypes';
import {EventEmitter} from './EventEmitter';
import {Frame, FrameManager, FrameManagerEmittedEvents} from './FrameManager';
import {HTTPResponse} from './HTTPResponse';
import {JSHandle, _createJSHandle} from './JSHandle';
import {PuppeteerLifeCycleEvent} from './LifecycleWatcher';
import {NetworkManagerEmittedEvents} from './NetworkManager';
import {Viewport} from './PuppeteerViewport';
import {Target} from './Target';
import {TaskQueue} from './TaskQueue';
import {TimeoutSettings} from './TimeoutSettings';
import {
	debugError,
	evaluationString,
	getExceptionMessage,
	isErrorLike,
	pageBindingDeliverErrorString,
	pageBindingDeliverErrorValueString,
	pageBindingDeliverResultString,
	releaseObject,
	valueFromRemoteObject,
} from './util';

/**
 * @public
 */
interface WaitForOptions {
	/**
	 * Maximum wait time in milliseconds, defaults to 30 seconds, pass `0` to
	 * disable the timeout.
	 *
	 * @remarks
	 * The default value can be changed by using the
	 * {@link Page.setDefaultTimeout} or {@link Page.setDefaultNavigationTimeout}
	 * methods.
	 */
	timeout?: number;
	waitUntil?: PuppeteerLifeCycleEvent | PuppeteerLifeCycleEvent[];
}

/**
 * @public
 */
interface ScreenshotClip {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**
 * @public
 */
export interface ScreenshotOptions {
	/**
	 * @defaultValue 'png'
	 */
	type?: 'png' | 'jpeg' | 'webp';
	/**
	 * The file path to save the image to. The screenshot type will be inferred
	 * from file extension. If path is a relative path, then it is resolved
	 * relative to current working directory. If no path is provided, the image
	 * won't be saved to the disk.
	 */
	path?: string;
	/**
	 * When true, takes a screenshot of the full page.
	 * @defaultValue false
	 */
	fullPage?: boolean;
	/**
	 * An object which specifies the clipping region of the page.
	 */
	clip?: ScreenshotClip;
	/**
	 * Quality of the image, between 0-100. Not applicable to `png` images.
	 */
	quality?: number;
	/**
	 * Hides default white background and allows capturing screenshots with transparency.
	 * @defaultValue false
	 */
	omitBackground?: boolean;
	/**
	 * Encoding of the image.
	 * @defaultValue 'binary'
	 */
	encoding?: 'base64' | 'binary';
	/**
	 * If you need a screenshot bigger than the Viewport
	 * @defaultValue true
	 */
	captureBeyondViewport?: boolean;
}

/**
 * All the events that a page instance may emit.
 *
 * @public
 */
export const enum PageEmittedEvents {
	Console = 'console',
	Error = 'error',
	/** Emitted when a frame is attached. Will contain a {@link Frame}. */
	FrameAttached = 'frameattached',
	/** Emitted when a frame is detached. Will contain a {@link Frame}. */
	FrameDetached = 'framedetached',
	/** Emitted when a frame is navigated to a new URL. Will contain a {@link Frame}. */
	FrameNavigated = 'framenavigated',
	/**
	 * Emitted when the JavaScript
	 * {@link https://developer.mozilla.org/en-US/docs/Web/Events/load | load}
	 * event is dispatched.
	 */
	Load = 'load',
	/**
	 * Emitted when the JavaScript code makes a call to `console.timeStamp`. For
	 * the list of metrics see {@link Page.metrics | page.metrics}.
	 *
	 * @remarks
	 * Contains an object with two properties:
	 * - `title`: the title passed to `console.timeStamp`
	 * - `metrics`: objec containing metrics as key/value pairs. The values will
	 *   be `number`s.
	 */
	Metrics = 'metrics',
	/**
	 * Emitted when an uncaught exception happens within the page.
	 * Contains an `Error`.
	 */
	PageError = 'pageerror',
	/**
	 * Emitted when the page opens a new tab or window.
	 *
	 * Contains a {@link Page} corresponding to the popup window.
	 *
	 * @example
	 *
	 * ```js
	 * const [popup] = await Promise.all([
	 *   new Promise(resolve => page.once('popup', resolve)),
	 *   page.click('a[target=_blank]'),
	 * ]);
	 * ```
	 *
	 * ```js
	 * const [popup] = await Promise.all([
	 *   new Promise(resolve => page.once('popup', resolve)),
	 *   page.evaluate(() => window.open('https://example.com')),
	 * ]);
	 * ```
	 */
	Popup = 'popup',
	/**
	 * Emitted when a page issues a request and contains a {@link HTTPRequest}.
	 *
	 * @remarks
	 * The object is readonly. See {@link Page.setRequestInterception} for intercepting
	 * and mutating requests.
	 */
	Request = 'request',
	/**
	 * Emitted when a request ended up loading from cache. Contains a {@link HTTPRequest}.
	 *
	 * @remarks
	 * For certain requests, might contain undefined.
	 * {@link https://crbug.com/750469}
	 */
	RequestServedFromCache = 'requestservedfromcache',
	/**
	 * Emitted when a request fails, for example by timing out.
	 *
	 * Contains a {@link HTTPRequest}.
	 *
	 * @remarks
	 *
	 * NOTE: HTTP Error responses, such as 404 or 503, are still successful
	 * responses from HTTP standpoint, so request will complete with
	 * `requestfinished` event and not with `requestfailed`.
	 */
	RequestFailed = 'requestfailed',
	/**
	 * Emitted when a request finishes successfully. Contains a {@link HTTPRequest}.
	 */
	RequestFinished = 'requestfinished',
	/**
	 * Emitted when a response is received. Contains a {@link HTTPResponse}.
	 */
	Response = 'response',
	/**
	 * Emitted when a dedicated
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API | WebWorker}
	 * is spawned by the page.
	 */
	WorkerCreated = 'workercreated',
	/**
	 * Emitted when a dedicated
	 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API | WebWorker}
	 * is destroyed by the page.
	 */
	WorkerDestroyed = 'workerdestroyed',
}

interface PageEventObject {
	console: ConsoleMessage;
	error: Error;
}

export class Page extends EventEmitter {
	/**
	 * @internal
	 */
	static async _create(
		client: CDPSession,
		target: Target,
		defaultViewport: Viewport
	): Promise<Page> {
		const page = new Page(client, target);
		await page.#initialize();
		await page.setViewport(defaultViewport);

		return page;
	}

	#closed = false;
	#client: CDPSession;
	#target: Target;
	#timeoutSettings = new TimeoutSettings();
	#frameManager: FrameManager;
	#emulationManager: EmulationManager;
	#pageBindings = new Map<string, Function>();
	screenshotTaskQueue: TaskQueue;

	/**
	 * @internal
	 */
	constructor(client: CDPSession, target: Target) {
		super();
		this.#client = client;
		this.#target = target;
		this.#frameManager = new FrameManager(client, this, this.#timeoutSettings);
		this.#emulationManager = new EmulationManager(client);
		this.screenshotTaskQueue = new TaskQueue();

		client.on(
			'Target.attachedToTarget',
			(event: Protocol.Target.AttachedToTargetEvent) => {
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
							.catch(debugError);
				}
			}
		);

		this.#frameManager.on(FrameManagerEmittedEvents.FrameAttached, (event) => {
			return this.emit(PageEmittedEvents.FrameAttached, event);
		});
		this.#frameManager.on(FrameManagerEmittedEvents.FrameDetached, (event) => {
			return this.emit(PageEmittedEvents.FrameDetached, event);
		});
		this.#frameManager.on(FrameManagerEmittedEvents.FrameNavigated, (event) => {
			return this.emit(PageEmittedEvents.FrameNavigated, event);
		});

		const networkManager = this.#frameManager.networkManager();
		networkManager.on(NetworkManagerEmittedEvents.Request, (event) => {
			return this.emit(PageEmittedEvents.Request, event);
		});
		networkManager.on(
			NetworkManagerEmittedEvents.RequestServedFromCache,
			(event) => {
				return this.emit(PageEmittedEvents.RequestServedFromCache, event);
			}
		);
		networkManager.on(NetworkManagerEmittedEvents.Response, (event) => {
			return this.emit(PageEmittedEvents.Response, event);
		});
		networkManager.on(NetworkManagerEmittedEvents.RequestFailed, (event) => {
			return this.emit(PageEmittedEvents.RequestFailed, event);
		});
		networkManager.on(NetworkManagerEmittedEvents.RequestFinished, (event) => {
			return this.emit(PageEmittedEvents.RequestFinished, event);
		});

		client.on('Page.loadEventFired', () => {
			return this.emit(PageEmittedEvents.Load);
		});
		client.on('Runtime.consoleAPICalled', (event) => {
			return this.#onConsoleAPI(event);
		});
		client.on('Runtime.bindingCalled', (event) => {
			return this.#onBindingCalled(event);
		});
		client.on('Runtime.exceptionThrown', (exception) => {
			return this.#handleException(exception.exceptionDetails);
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

	/**
	 * @internal
	 */
	_client(): CDPSession {
		return this.#client;
	}

	/**
	 * Get the browser the page belongs to.
	 */
	browser(): Browser {
		return this.#target.browser();
	}

	/**
	 * Get the browser context that the page belongs to.
	 */
	browserContext(): BrowserContext {
		return this.#target.browserContext();
	}

	#onTargetCrashed(): void {
		this.emit('error', new Error('Page crashed!'));
	}

	#onLogEntryAdded(event: Protocol.Log.EntryAddedEvent): void {
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

	/**
	 * @returns An array of all frames attached to the page.
	 */
	frames(): Frame[] {
		return this.#frameManager.frames();
	}

	async setViewport(viewport: Viewport): Promise<void> {
		await this.#emulationManager.emulateViewport(viewport);
	}

	/**
	 * This setting will change the default maximum navigation time for the
	 * following methods and related shortcuts:
	 *
	 * - {@link Page.goBack | page.goBack(options)}
	 *
	 * - {@link Page.goForward | page.goForward(options)}
	 *
	 * - {@link Page.goto | page.goto(url,options)}
	 *
	 * - {@link Page.reload | page.reload(options)}
	 *
	 * - {@link Page.setContent | page.setContent(html,options)}
	 *
	 * - {@link Page.waitForNavigation | page.waitForNavigation(options)}
	 * @param timeout - Maximum navigation time in milliseconds.
	 */
	setDefaultNavigationTimeout(timeout: number): void {
		this.#timeoutSettings.setDefaultNavigationTimeout(timeout);
	}

	/**
	 * @param timeout - Maximum time in milliseconds.
	 */
	setDefaultTimeout(timeout: number): void {
		this.#timeoutSettings.setDefaultTimeout(timeout);
	}

	/**
	 * @remarks
	 *
	 * The only difference between {@link Page.evaluate | page.evaluate} and
	 * `page.evaluateHandle` is that `evaluateHandle` will return the value
	 * wrapped in an in-page object.
	 *
	 * If the function passed to `page.evaluteHandle` returns a Promise, the
	 * function will wait for the promise to resolve and return its value.
	 *
	 * You can pass a string instead of a function (although functions are
	 * recommended as they are easier to debug and use with TypeScript):
	 *
	 * @example
	 * ```
	 * const aHandle = await page.evaluateHandle('document')
	 * ```
	 *
	 * @example
	 * {@link JSHandle} instances can be passed as arguments to the `pageFunction`:
	 * ```
	 * const aHandle = await page.evaluateHandle(() => document.body);
	 * const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
	 * console.log(await resultHandle.jsonValue());
	 * await resultHandle.dispose();
	 * ```
	 *
	 * Most of the time this function returns a {@link JSHandle},
	 * but if `pageFunction` returns a reference to an element,
	 * you instead get an {@link ElementHandle} back:
	 *
	 * @example
	 * ```
	 * const button = await page.evaluateHandle(() => document.querySelector('button'));
	 * // can call `click` because `button` is an `ElementHandle`
	 * await button.click();
	 * ```
	 *
	 * The TypeScript definitions assume that `evaluateHandle` returns
	 *  a `JSHandle`, but if you know it's going to return an
	 * `ElementHandle`, pass it as the generic argument:
	 *
	 * ```
	 * const button = await page.evaluateHandle<ElementHandle>(...);
	 * ```
	 *
	 * @param pageFunction - a function that is run within the page
	 * @param args - arguments to be passed to the pageFunction
	 */
	async evaluateHandle<HandlerType extends JSHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandlerType> {
		const context = await this.mainFrame().executionContext();
		return context.evaluateHandle<HandlerType>(pageFunction, ...args);
	}

	#handleException(exceptionDetails: Protocol.Runtime.ExceptionDetails): void {
		const message = getExceptionMessage(exceptionDetails);
		const err = new Error(message);
		err.stack = ''; // Don't report clientside error with a node stack attached
		this.emit(PageEmittedEvents.PageError, err);
	}

	async #onConsoleAPI(
		event: Protocol.Runtime.ConsoleAPICalledEvent
	): Promise<void> {
		if (event.executionContextId === 0) {
			// DevTools protocol stores the last 1000 console messages. These
			// messages are always reported even for removed execution contexts. In
			// this case, they are marked with executionContextId = 0 and are
			// reported upon enabling Runtime agent.
			//
			// Ignore these messages since:
			// - there's no execution context we can use to operate with message
			//   arguments
			// - these messages are reported before Puppeteer clients can subscribe
			//   to the 'console'
			//   page event.
			//
			// @see https://github.com/puppeteer/puppeteer/issues/3865
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

	async #onBindingCalled(
		event: Protocol.Runtime.BindingCalledEvent
	): Promise<void> {
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
		} catch (error) {
			if (isErrorLike(error)) {
				expression = pageBindingDeliverErrorString(
					name,
					seq,
					error.message,
					error.stack
				);
			} else {
				expression = pageBindingDeliverErrorValueString(name, seq, error);
			}
		}

		this.#client
			.send('Runtime.evaluate', {
				expression,
				contextId: event.executionContextId,
			})
			.catch(debugError);
	}

	#addConsoleMessage(
		eventType: ConsoleMessageType,
		args: JSHandle[],
		stackTrace?: Protocol.Runtime.StackTrace
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

	/**
	 *
	 * @returns
	 * @remarks Shortcut for
	 * {@link Frame.url | page.mainFrame().url()}.
	 */
	url(): string {
		return this.mainFrame().url();
	}

	async goto(
		url: string,
		options: WaitForOptions & {referer?: string} = {}
	): Promise<HTTPResponse | null> {
		return this.#frameManager.mainFrame().goto(url, options);
	}

	/**
	 * Brings page to front (activates tab).
	 */
	async bringToFront(): Promise<void> {
		await this.#client.send('Page.bringToFront');
	}

	async evaluate<T extends EvaluateFn>(
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
		pageFunction: Function | string,
		options: {
			timeout?: number;
			polling?: string | number;
		} = {},
		...args: SerializableOrJSHandle[]
	): Promise<JSHandle> {
		return this.mainFrame().waitForFunction(pageFunction, options, ...args);
	}
}
