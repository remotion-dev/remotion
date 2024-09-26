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

import type {LogLevel} from '../log-level';
import type {Page} from './BrowserPage';
import type {CDPSession} from './Connection';
import {Connection} from './Connection';
import {DOMWorld} from './DOMWorld';
import type {
	EvaluateFn,
	EvaluateFnReturnType,
	EvaluateHandleFn,
	SerializableOrJSHandle,
	UnwrapPromiseLike,
} from './EvalTypes';
import {EventEmitter} from './EventEmitter';
import {EVALUATION_SCRIPT_URL, ExecutionContext} from './ExecutionContext';
import type {HTTPResponse} from './HTTPResponse';
import type {JSHandle} from './JSHandle';
import type {PuppeteerLifeCycleEvent} from './LifecycleWatcher';
import {LifecycleWatcher} from './LifecycleWatcher';
import {NetworkManager} from './NetworkManager';
import {assert} from './assert';
import type {
	AttachedToTargetEvent,
	DetachedFromTargetEvent,
	ExecutionContextDescription,
	FrameDetachedEvent,
	FrameDetachedEventReason,
	FrameTree,
	LifecycleEventEvent,
	Frame as TFrame,
} from './devtools-types';
import {isTargetClosedErr} from './flaky-errors';
import {isErrorLike} from './util';

const UTILITY_WORLD_NAME = '__puppeteer_utility_world__';

export const FrameManagerEmittedEvents = {
	FrameNavigated: Symbol('FrameManager.FrameNavigated'),
	FrameDetached: Symbol('FrameManager.FrameDetached'),
	FrameSwapped: Symbol('FrameManager.FrameSwapped'),
	LifecycleEvent: Symbol('FrameManager.LifecycleEvent'),
	FrameNavigatedWithinDocument: Symbol(
		'FrameManager.FrameNavigatedWithinDocument',
	),
	ExecutionContextCreated: Symbol('FrameManager.ExecutionContextCreated'),
	ExecutionContextDestroyed: Symbol('FrameManager.ExecutionContextDestroyed'),
};

export class FrameManager extends EventEmitter {
	#page: Page;
	#networkManager: NetworkManager;
	#frames = new Map<string, Frame>();
	#contextIdToContext = new Map<string, ExecutionContext>();
	#isolatedWorlds = new Set<string>();
	#mainFrame?: Frame;
	#client: CDPSession;

	get _client(): CDPSession {
		return this.#client;
	}

	constructor(
		client: CDPSession,
		page: Page,
		indent: boolean,
		logLevel: LogLevel,
	) {
		super();
		this.#client = client;
		this.#page = page;
		this.#networkManager = new NetworkManager(client, this, indent, logLevel);
		this.setupEventListeners(this.#client);
	}

	private setupEventListeners(session: CDPSession) {
		session.on('Page.frameAttached', (event) => {
			this.#onFrameAttached(session, event.frameId, event.parentFrameId);
		});
		session.on('Page.frameNavigated', (event) => {
			this.#onFrameNavigated(event.frame);
		});
		session.on('Page.navigatedWithinDocument', (event) => {
			this.#onFrameNavigatedWithinDocument(event.frameId, event.url);
		});
		session.on('Page.frameDetached', (event: FrameDetachedEvent) => {
			this.#onFrameDetached(
				event.frameId,
				event.reason as FrameDetachedEventReason,
			);
		});
		session.on('Page.frameStartedLoading', (event) => {
			this.#onFrameStartedLoading(event.frameId);
		});
		session.on('Page.frameStoppedLoading', (event) => {
			this.#onFrameStoppedLoading(event.frameId);
		});
		session.on('Runtime.executionContextCreated', (event) => {
			this.#onExecutionContextCreated(event.context, session);
		});
		session.on('Runtime.executionContextDestroyed', (event) => {
			this.#onExecutionContextDestroyed(event.executionContextId, session);
		});
		session.on('Runtime.executionContextsCleared', () => {
			this.#onExecutionContextsCleared(session);
		});
		session.on('Page.lifecycleEvent', (event) => {
			this.#onLifecycleEvent(event);
		});
		session.on('Target.attachedToTarget', (event) => {
			this.#onAttachedToTarget(event);
		});
		session.on('Target.detachedFromTarget', (event) => {
			this.#onDetachedFromTarget(event);
		});
	}

	async initialize(client: CDPSession = this.#client): Promise<void> {
		try {
			const result = await Promise.all([
				client.send('Page.enable'),
				client.send('Page.getFrameTree'),
				client === this.#client
					? Promise.resolve()
					: client.send('Target.setAutoAttach', {
							autoAttach: true,
							waitForDebuggerOnStart: false,
							flatten: true,
						}),
			]);

			const {
				value: {frameTree},
			} = result[1];
			this.#handleFrameTree(client, frameTree);
			await Promise.all([
				client.send('Page.setLifecycleEventsEnabled', {enabled: true}),
				client.send('Runtime.enable').then(() => {
					return this._ensureIsolatedWorld(client, UTILITY_WORLD_NAME);
				}),
				client === this.#client
					? this.#networkManager.initialize()
					: Promise.resolve(),
			]);
		} catch (error) {
			// The target might have been closed before the initialization finished.
			if (isErrorLike(error) && isTargetClosedErr(error)) {
				return;
			}

			throw error;
		}
	}

	networkManager(): NetworkManager {
		return this.#networkManager;
	}

	async navigateFrame(
		frame: Frame,
		url: string,
		timeout: number,
		options: {
			referer?: string;
			timeout?: number;
			waitUntil?: PuppeteerLifeCycleEvent;
		} = {},
	): Promise<HTTPResponse | null> {
		const {referer = undefined, waitUntil = 'load'} = options;

		const watcher = new LifecycleWatcher(this, frame, waitUntil, timeout);
		let error = await Promise.race([
			navigate(this.#client, url, referer, frame._id),
			watcher.timeoutOrTerminationPromise(),
		]);
		if (!error) {
			error = await Promise.race([
				watcher.timeoutOrTerminationPromise(),
				watcher.newDocumentNavigationPromise(),
				watcher.sameDocumentNavigationPromise(),
			]);
		}

		watcher.dispose();
		if (error) {
			throw error;
		}

		return watcher.navigationResponse();

		async function navigate(
			client: CDPSession,
			_url: string,
			referrer: string | undefined,
			frameId: string,
		): Promise<Error | null> {
			try {
				const {value: response} = await client.send('Page.navigate', {
					url: _url,
					referrer,
					frameId,
				});
				return response.errorText
					? new Error(`${response.errorText} at ${_url}`)
					: null;
			} catch (_error) {
				if (isErrorLike(_error)) {
					return _error;
				}

				throw _error;
			}
		}
	}

	async #onAttachedToTarget(event: AttachedToTargetEvent) {
		if (event.targetInfo.type !== 'iframe') {
			return;
		}

		const frame = this.#frames.get(event.targetInfo.targetId);
		const connection = Connection.fromSession(this.#client);
		assert(connection);
		const session = connection.session(event.sessionId);
		assert(session);
		if (frame) {
			frame._updateClient(session);
		}

		this.setupEventListeners(session);
		await this.initialize(session);
	}

	#onDetachedFromTarget(event: DetachedFromTargetEvent) {
		if (!event.targetId) {
			return;
		}

		const frame = this.#frames.get(event.targetId);
		if (frame?.isOOPFrame()) {
			// When an OOP iframe is removed from the page, it
			// will only get a Target.detachedFromTarget event.
			this.#removeFramesRecursively(frame);
		}
	}

	#onLifecycleEvent(event: LifecycleEventEvent): void {
		const frame = this.#frames.get(event.frameId);
		if (!frame) {
			return;
		}

		frame._onLifecycleEvent(event.loaderId, event.name);
		this.emit(FrameManagerEmittedEvents.LifecycleEvent, frame);
	}

	#onFrameStartedLoading(frameId: string): void {
		const frame = this.#frames.get(frameId);
		if (!frame) {
			return;
		}

		frame._onLoadingStarted();
	}

	#onFrameStoppedLoading(frameId: string): void {
		const frame = this.#frames.get(frameId);
		if (!frame) {
			return;
		}

		frame._onLoadingStopped();
		this.emit(FrameManagerEmittedEvents.LifecycleEvent, frame);
	}

	#handleFrameTree(session: CDPSession, frameTree: FrameTree): void {
		if (frameTree.frame.parentId) {
			this.#onFrameAttached(
				session,
				frameTree.frame.id,
				frameTree.frame.parentId,
			);
		}

		this.#onFrameNavigated(frameTree.frame);
		if (!frameTree.childFrames) {
			return;
		}

		for (const child of frameTree.childFrames) {
			this.#handleFrameTree(session, child);
		}
	}

	page(): Page {
		return this.#page;
	}

	mainFrame(): Frame {
		assert(this.#mainFrame, 'Requesting main frame too early!');
		return this.#mainFrame;
	}

	frames(): Frame[] {
		return Array.from(this.#frames.values());
	}

	frame(frameId: string): Frame | null {
		return this.#frames.get(frameId) || null;
	}

	#onFrameAttached(
		session: CDPSession,
		frameId: string,
		parentFrameId?: string,
	): void {
		if (this.#frames.has(frameId)) {
			const _frame = this.#frames.get(frameId) as Frame;
			if (session && _frame.isOOPFrame()) {
				// If an OOP iframes becomes a normal iframe again
				// it is first attached to the parent page before
				// the target is removed.
				_frame._updateClient(session);
			}

			return;
		}

		assert(parentFrameId);
		const parentFrame = this.#frames.get(parentFrameId);
		assert(parentFrame);
		const frame = new Frame(this, parentFrame, frameId, session);
		this.#frames.set(frame._id, frame);
	}

	#onFrameNavigated(framePayload: TFrame): void {
		const isMainFrame = !framePayload.parentId;
		let frame = isMainFrame
			? this.#mainFrame
			: this.#frames.get(framePayload.id);
		assert(
			isMainFrame || frame,
			'We either navigate top level or have old version of the navigated frame',
		);

		// Detach all child frames first.
		if (frame) {
			for (const child of frame.childFrames()) {
				this.#removeFramesRecursively(child);
			}
		}

		// Update or create main frame.
		if (isMainFrame) {
			if (frame) {
				// Update frame id to retain frame identity on cross-process navigation.
				this.#frames.delete(frame._id);
				frame._id = framePayload.id;
			} else {
				// Initial main frame navigation.
				frame = new Frame(this, null, framePayload.id, this.#client);
			}

			this.#frames.set(framePayload.id, frame);
			this.#mainFrame = frame;
		}

		// Update frame payload.
		assert(frame);
		frame._navigated(framePayload);

		this.emit(FrameManagerEmittedEvents.FrameNavigated, frame);
	}

	async _ensureIsolatedWorld(session: CDPSession, name: string): Promise<void> {
		const key = `${session.id()}:${name}`;
		if (this.#isolatedWorlds.has(key)) {
			return;
		}

		this.#isolatedWorlds.add(key);

		await session.send('Page.addScriptToEvaluateOnNewDocument', {
			source: `//# sourceURL=${EVALUATION_SCRIPT_URL}`,
			worldName: name,
		});
		// Frames might be removed before we send this.
		await Promise.all(
			this.frames()
				.filter((frame) => {
					return frame._client() === session;
				})
				.map((frame) => {
					return session
						.send('Page.createIsolatedWorld', {
							frameId: frame._id,
							worldName: name,
							grantUniveralAccess: true,
						})
						.catch(() => undefined);
				}),
		);
	}

	#onFrameNavigatedWithinDocument(frameId: string, url: string): void {
		const frame = this.#frames.get(frameId);
		if (!frame) {
			return;
		}

		frame._navigatedWithinDocument(url);
		this.emit(FrameManagerEmittedEvents.FrameNavigatedWithinDocument, frame);
		this.emit(FrameManagerEmittedEvents.FrameNavigated, frame);
	}

	#onFrameDetached(frameId: string, reason: FrameDetachedEventReason): void {
		const frame = this.#frames.get(frameId);
		if (reason === 'remove') {
			// Only remove the frame if the reason for the detached event is
			// an actual removement of the frame.
			// For frames that become OOP iframes, the reason would be 'swap'.
			if (frame) {
				this.#removeFramesRecursively(frame);
			}
		} else if (reason === 'swap') {
			this.emit(FrameManagerEmittedEvents.FrameSwapped, frame);
		}
	}

	#onExecutionContextCreated(
		contextPayload: ExecutionContextDescription,
		session: CDPSession,
	): void {
		const auxData = contextPayload.auxData as {frameId?: string} | undefined;
		const frameId = auxData?.frameId;
		const frame =
			typeof frameId === 'string' ? this.#frames.get(frameId) : undefined;
		let world: DOMWorld | undefined;
		if (frame) {
			// Only care about execution contexts created for the current session.
			if (frame._client() !== session) {
				return;
			}

			if (contextPayload.auxData && Boolean(contextPayload.auxData.isDefault)) {
				world = frame._mainWorld;
			} else if (
				contextPayload.name === UTILITY_WORLD_NAME &&
				!frame._secondaryWorld._hasContext()
			) {
				// In case of multiple sessions to the same target, there's a race between
				// connections so we might end up creating multiple isolated worlds.
				// We can use either.
				world = frame._secondaryWorld;
			}
		}

		const context = new ExecutionContext(
			frame?._client() || this.#client,
			contextPayload,
			world as DOMWorld,
		);
		if (world) {
			world._setContext(context);
		}

		const key = `${session.id()}:${contextPayload.id}`;
		this.#contextIdToContext.set(key, context);
	}

	#onExecutionContextDestroyed(
		executionContextId: number,
		session: CDPSession,
	): void {
		const key = `${session.id()}:${executionContextId}`;
		const context = this.#contextIdToContext.get(key);
		if (!context) {
			return;
		}

		this.#contextIdToContext.delete(key);
		if (context._world) {
			context._world._setContext(null);
		}
	}

	#onExecutionContextsCleared(session: CDPSession): void {
		for (const [key, context] of this.#contextIdToContext.entries()) {
			// Make sure to only clear execution contexts that belong
			// to the current session.
			if (context._client !== session) {
				continue;
			}

			if (context._world) {
				context._world._setContext(null);
			}

			this.#contextIdToContext.delete(key);
		}
	}

	executionContextById(
		contextId: number,
		session: CDPSession = this.#client,
	): ExecutionContext {
		const key = `${session.id()}:${contextId}`;
		const context = this.#contextIdToContext.get(key);
		assert(context, 'INTERNAL ERROR: missing context with id = ' + contextId);
		return context;
	}

	#removeFramesRecursively(frame: Frame): void {
		for (const child of frame.childFrames()) {
			this.#removeFramesRecursively(child);
		}

		frame._detach();
		this.#frames.delete(frame._id);
		this.emit(FrameManagerEmittedEvents.FrameDetached, frame);
	}
}

export class Frame {
	#parentFrame: Frame | null;
	#url = '';
	#client!: CDPSession;

	_frameManager: FrameManager;
	_id: string;
	_loaderId = '';
	_name?: string;
	_hasStartedLoading = false;
	_lifecycleEvents = new Set<string>();
	_mainWorld!: DOMWorld;
	_secondaryWorld!: DOMWorld;
	_childFrames: Set<Frame>;

	constructor(
		frameManager: FrameManager,
		parentFrame: Frame | null,
		frameId: string,
		client: CDPSession,
	) {
		this._frameManager = frameManager;
		this.#parentFrame = parentFrame ?? null;
		this.#url = '';
		this._id = frameId;

		this._loaderId = '';

		this._childFrames = new Set();
		if (this.#parentFrame) {
			this.#parentFrame._childFrames.add(this);
		}

		this._updateClient(client);
	}

	_updateClient(client: CDPSession): void {
		this.#client = client;
		this._mainWorld = new DOMWorld(this);
		this._secondaryWorld = new DOMWorld(this);
	}

	isOOPFrame(): boolean {
		return this.#client !== this._frameManager._client;
	}

	goto(
		url: string,
		timeout: number,
		options: {
			referer?: string;
			waitUntil?: PuppeteerLifeCycleEvent;
		} = {},
	): Promise<HTTPResponse | null> {
		return this._frameManager.navigateFrame(this, url, timeout, options);
	}

	_client(): CDPSession {
		return this.#client;
	}

	/**
	 * @returns a promise that resolves to the frame's default execution context.
	 */
	executionContext(): Promise<ExecutionContext> {
		return this._mainWorld.executionContext();
	}

	evaluateHandle<HandlerType extends JSHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandlerType> {
		return this._mainWorld.evaluateHandle<HandlerType>(pageFunction, ...args);
	}

	evaluate<T extends EvaluateFn>(
		pageFunction: T,
		...args: SerializableOrJSHandle[]
	): Promise<UnwrapPromiseLike<EvaluateFnReturnType<T>>> {
		return this._mainWorld.evaluate<T>(pageFunction, ...args);
	}

	url(): string {
		return this.#url;
	}

	childFrames(): Frame[] {
		return Array.from(this._childFrames);
	}

	_navigated(framePayload: TFrame): void {
		this._name = framePayload.name;
		this.#url = `${framePayload.url}${framePayload.urlFragment || ''}`;
	}

	_navigatedWithinDocument(url: string): void {
		this.#url = url;
	}

	_onLifecycleEvent(loaderId: string, name: string): void {
		if (name === 'init') {
			this._loaderId = loaderId;
			this._lifecycleEvents.clear();
		}

		this._lifecycleEvents.add(name);
	}

	_onLoadingStopped(): void {
		this._lifecycleEvents.add('load');
	}

	_onLoadingStarted(): void {
		this._hasStartedLoading = true;
	}

	_detach(): void {
		this._mainWorld._detach();
		this._secondaryWorld._detach();
		if (this.#parentFrame) {
			this.#parentFrame._childFrames.delete(this);
		}

		this.#parentFrame = null;
	}
}
