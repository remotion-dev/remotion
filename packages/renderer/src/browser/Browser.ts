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

import {BrowserLog} from '../browser-log';
import type {LogLevel} from '../log-level';
import {assert} from './assert';
import type {OnLog, Page} from './BrowserPage';
import {PageEmittedEvents} from './BrowserPage';
import type {BrowserRunner} from './BrowserRunner';
import {makeBrowserRunner} from './BrowserRunner';
import type {Connection} from './Connection';
import type {DevtoolsTargetCreatedEvent} from './devtools-types';
import {EventEmitter} from './EventEmitter';
import type {Viewport} from './PuppeteerViewport';
import type {SourceMapGetter} from './source-map-getter';
import {Target} from './Target';
import {waitWithTimeout} from './util';

interface WaitForTargetOptions {
	timeout?: number;
}

export const enum BrowserEmittedEvents {
	TargetChanged = 'targetchanged',
	TargetCreated = 'targetcreated',
	Closed = 'closed',
	ClosedSilent = 'closed-silent',
}

export class HeadlessBrowser extends EventEmitter {
	static async create({
		defaultViewport,
		timeout,
		userDataDir,
		args,
		executablePath,
		logLevel,
		indent,
	}: {
		defaultViewport: Viewport;
		timeout: number;
		userDataDir: string;
		args: string[];
		executablePath: string;
		logLevel: LogLevel;
		indent: boolean;
	}): Promise<HeadlessBrowser> {
		const runner = await makeBrowserRunner({
			executablePath,
			processArguments: args,
			userDataDir,
			indent,
			logLevel,
			timeout,
		});

		const browser = new HeadlessBrowser({
			connection: runner.connection,
			defaultViewport,
			runner,
		});
		await runner.connection.send('Target.setDiscoverTargets', {discover: true});
		return browser;
	}

	#defaultViewport: Viewport;
	connection: Connection;
	#defaultContext: BrowserContext;
	#contexts: Map<string, BrowserContext>;
	#targets: Map<string, Target>;
	id: string;

	runner: BrowserRunner;

	get _targets(): Map<string, Target> {
		return this.#targets;
	}

	constructor({
		connection,
		defaultViewport,
		runner,
	}: {
		connection: Connection;
		defaultViewport: Viewport;
		runner: BrowserRunner;
	}) {
		super();
		this.#defaultViewport = defaultViewport;
		this.connection = connection;

		this.id = Math.random().toString(36).substring(2, 15);

		this.#defaultContext = new BrowserContext(this);
		this.#contexts = new Map();

		this.#targets = new Map();
		this.connection.on('Target.targetCreated', this.#targetCreated.bind(this));
		this.connection.on(
			'Target.targetDestroyed',
			this.#targetDestroyed.bind(this),
		);
		this.connection.on(
			'Target.targetInfoChanged',
			this.#targetInfoChanged.bind(this),
		);
		this.runner = runner;
	}

	browserContexts(): BrowserContext[] {
		return [this.#defaultContext, ...Array.from(this.#contexts.values())];
	}

	async #targetCreated(event: DevtoolsTargetCreatedEvent): Promise<void> {
		const {targetInfo} = event;
		const {browserContextId} = targetInfo;
		const context =
			browserContextId && this.#contexts.has(browserContextId)
				? this.#contexts.get(browserContextId)
				: this.#defaultContext;

		if (!context) {
			throw new Error('Missing browser context');
		}

		const target = new Target(
			targetInfo,
			context,
			() => {
				return this.connection.createSession(targetInfo);
			},
			this.#defaultViewport ?? null,
		);
		assert(
			!this.#targets.has(event.targetInfo.targetId),
			'Target should not exist before targetCreated',
		);
		this.#targets.set(event.targetInfo.targetId, target);

		if (await target._initializedPromise) {
			this.emit(BrowserEmittedEvents.TargetCreated, target);
		}
	}

	#targetDestroyed(event: {targetId: string}): void {
		const target = this.#targets.get(event.targetId);
		if (!target) {
			throw new Error(
				`Missing target in _targetDestroyed (id = ${event.targetId})`,
			);
		}

		target._initializedCallback(false);
		this.#targets.delete(event.targetId);
		target._closedCallback();
	}

	#targetInfoChanged(event: DevtoolsTargetCreatedEvent): void {
		const target = this.#targets.get(event.targetInfo.targetId);
		if (!target) {
			throw new Error(
				`Missing target in targetInfoChanged (id = ${event.targetInfo.targetId})`,
			);
		}

		const previousURL = target.url();
		const wasInitialized = target._isInitialized;
		target._targetInfoChanged(event.targetInfo);
		if (wasInitialized && previousURL !== target.url()) {
			this.emit(BrowserEmittedEvents.TargetChanged, target);
		}
	}

	newPage({
		context,
		logLevel,
		indent,
		pageIndex,
		onBrowserLog,
		onLog,
	}: {
		context: SourceMapGetter;
		logLevel: LogLevel;
		indent: boolean;
		pageIndex: number;
		onBrowserLog: null | ((log: BrowserLog) => void);
		onLog: OnLog;
	}): Promise<Page> {
		return this.#defaultContext.newPage({
			context,
			logLevel,
			indent,
			pageIndex,
			onBrowserLog,
			onLog,
		});
	}

	async _createPageInContext({
		context,
		logLevel,
		indent,
		pageIndex,
		onBrowserLog,
		onLog,
	}: {
		context: SourceMapGetter;
		logLevel: LogLevel;
		indent: boolean;
		pageIndex: number;
		onBrowserLog: null | ((log: BrowserLog) => void);
		onLog: OnLog;
	}): Promise<Page> {
		const {
			value: {targetId},
		} = await this.connection.send('Target.createTarget', {
			url: 'about:blank',
			browserContextId: undefined,
		});
		const target = this.#targets.get(targetId);
		if (!target) {
			throw new Error(`Missing target for page (id = ${targetId})`);
		}

		const initialized = await target._initializedPromise;
		if (!initialized) {
			throw new Error(`Failed to create target for page (id = ${targetId})`);
		}

		const page = await target.page({
			sourceMapGetter: context,
			logLevel,
			indent,
			pageIndex,
			onBrowserLog,
			onLog,
		});
		if (!page) {
			throw new Error(`Failed to create a page for context`);
		}

		return page;
	}

	targets(): Target[] {
		return Array.from(this.#targets.values()).filter((target) => {
			return target._isInitialized;
		});
	}

	async waitForTarget(
		predicate: (x: Target) => boolean | Promise<boolean>,
		options: WaitForTargetOptions = {},
	): Promise<Target> {
		const {timeout = 30000} = options;
		let resolve: (value: Target | PromiseLike<Target>) => void;
		let isResolved = false;
		const targetPromise = new Promise<Target>((x) => {
			resolve = x;
		});
		this.on(BrowserEmittedEvents.TargetCreated, check);
		this.on(BrowserEmittedEvents.TargetChanged, check);
		try {
			if (!timeout) {
				return await targetPromise;
			}

			this.targets().forEach(check);
			return await waitWithTimeout(targetPromise, 'target', timeout, this);
		} finally {
			this.off(BrowserEmittedEvents.TargetCreated, check);
			this.off(BrowserEmittedEvents.TargetChanged, check);
		}

		async function check(target: Target): Promise<void> {
			if ((await predicate(target)) && !isResolved) {
				isResolved = true;
				resolve(target);
			}
		}
	}

	async pages(): Promise<Page[]> {
		const contextPages = await Promise.all(
			this.browserContexts().map((context) => {
				return context.pages();
			}),
		);
		// Flatten array.
		return contextPages.reduce((acc, x) => {
			return acc.concat(x);
		}, []);
	}

	async close({silent}: {silent: boolean}): Promise<void> {
		await this.runner.closeProcess();
		(await this.pages()).forEach((page) => {
			page.emit(PageEmittedEvents.Disposed);
			page.closed = true;
		});
		this.disconnect();
		this.emit(
			silent ? BrowserEmittedEvents.ClosedSilent : BrowserEmittedEvents.Closed,
		);
	}

	disconnect(): void {
		this.connection.dispose();
	}
}

export class BrowserContext extends EventEmitter {
	#browser: HeadlessBrowser;

	constructor(browser: HeadlessBrowser) {
		super();
		this.#browser = browser;
	}

	targets(): Target[] {
		return this.#browser.targets().filter((target) => {
			return target.browserContext() === this;
		});
	}

	waitForTarget(
		predicate: (x: Target) => boolean | Promise<boolean>,
		options: {timeout?: number} = {},
	): Promise<Target> {
		return this.#browser.waitForTarget((target) => {
			return target.browserContext() === this && predicate(target);
		}, options);
	}

	async pages(): Promise<Page[]> {
		const pages = await Promise.all(
			this.targets()
				.filter((target) => target.type() === 'page')
				.map((target) => target.expectPage()),
		);
		return pages.filter((page): page is Page => {
			return Boolean(page);
		});
	}

	newPage({
		context,
		logLevel,
		indent,
		pageIndex,
		onBrowserLog,
		onLog,
	}: {
		context: SourceMapGetter;
		logLevel: LogLevel;
		indent: boolean;
		pageIndex: number;
		onBrowserLog: null | ((log: BrowserLog) => void);
		onLog: OnLog;
	}): Promise<Page> {
		return this.#browser._createPageInContext({
			context,
			logLevel,
			indent,
			pageIndex,
			onBrowserLog,
			onLog,
		});
	}

	browser(): HeadlessBrowser {
		return this.#browser;
	}
}
