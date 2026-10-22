/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */

import type {webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {HotMiddlewareMessage} from '@remotion/studio-shared';
import {logHmrTiming} from '../hmr-timing';
import type {LiveEventsServer} from '../live-events';

declare global {
	const __webpack_hash__: unknown;

	interface HotNotifierInfo {
		type:
			| 'self-declined'
			| 'declined'
			| 'unaccepted'
			| 'accepted'
			| 'disposed'
			| 'accept-errored'
			| 'self-accept-errored'
			| 'self-accept-error-handler-errored';
		/**
		 * The module in question.
		 */
		moduleId: number;
		/**
		 * For errors: the module id owning the accept handler.
		 */
		dependencyId?: number | undefined;
		/**
		 * For declined/accepted/unaccepted: the chain from where the update was propagated.
		 */
		chain?: number[] | undefined;
		/**
		 * For declined: the module id of the declining parent
		 */
		parentId?: number | undefined;
		/**
		 * For accepted: the modules that are outdated and will be disposed
		 */
		outdatedModules?: number[] | undefined;
		/**
		 * For accepted: The location of accept handlers that will handle the update
		 */
		outdatedDependencies?:
			| {
					[dependencyId: number]: number[];
			  }
			| undefined;
		/**
		 * For errors: the thrown error
		 */
		error?: Error | undefined;
		/**
		 * For self-accept-error-handler-errored: the error thrown by the module
		 * before the error handler tried to handle it.
		 */
		originalError?: Error | undefined;
	}

	interface AcceptOptions {
		/**
		 * If true the update process continues even if some modules are not accepted (and would bubble to the entry point).
		 */
		ignoreUnaccepted?: boolean | undefined;
		/**
		 * Ignore changes made to declined modules.
		 */
		ignoreDeclined?: boolean | undefined;
		/**
		 *  Ignore errors throw in accept handlers, error handlers and while reevaluating module.
		 */
		ignoreErrored?: boolean | undefined;
		/**
		 * Notifier for declined modules.
		 */
		onDeclined?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for unaccepted modules.
		 */
		onUnaccepted?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for accepted modules.
		 */
		onAccepted?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for disposed modules.
		 */
		onDisposed?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Notifier for errors.
		 */
		onErrored?: ((info: HotNotifierInfo) => void) | undefined;
		/**
		 * Indicates that apply() is automatically called by check function
		 */
		autoApply?: boolean | undefined;
	}
	const __webpack_module__: {
		id: string;
		exports: unknown;
		hot: {
			accept: () => void;
			dispose: (onDispose: (data: Record<string, unknown>) => void) => void;
			invalidate: () => void;
			data?: Record<string, unknown>;
			addStatusHandler(callback: (status: string) => void): void;
			status(): string;
			apply(options?: AcceptOptions): Promise<ModuleId[]>;
			check(autoApply?: boolean): Promise<null | ModuleId[]>;
		};
	};
	type ModuleId = string | number;
}

export const setupWebpackHmr = (
	compiler: webpack.Compiler,
	logLevel: LogLevel,
	liveEventsServer: LiveEventsServer,
) => {
	let latestStats: webpack.Stats | null = null;

	const publishHmr = (hmrEvent: HotMiddlewareMessage) => {
		liveEventsServer.sendEventToClient({type: 'hmr', hmrEvent});
	};

	compiler.hooks.invalid.tap('remotion', onInvalid);
	compiler.hooks.watchRun.tap('remotion-hmr-timing', () => {
		logHmrTiming({detail: null, logLevel, stage: 'compiler-watch-run'});
	});
	compiler.hooks.done.tap('remotion', onDone);

	function onInvalid(fileName: string | null, changeTime: number) {
		logHmrTiming({
			detail: `file=${fileName ?? 'manual'} changeTime=${changeTime}`,
			logLevel,
			stage: 'compiler-invalid',
		});
		latestStats = null;
		RenderInternals.Log.info({indent: false, logLevel}, 'Building...');
		publishHmr({
			action: 'building',
		});
	}

	function onDone(statsResult: webpack.Stats) {
		logHmrTiming({
			detail: `reportedBuildDuration=${statsResult.endTime - statsResult.startTime}ms`,
			logLevel,
			stage: 'compiler-done',
		});
		// Keep hold of latest stats so they can be propagated to new clients
		latestStats = statsResult;
		publishStats('built', latestStats, publishHmr);
		logHmrTiming({detail: null, logLevel, stage: 'hmr-stats-published'});
	}

	liveEventsServer.addNewClientListener(() => {
		if (latestStats) {
			publishStats('sync', latestStats, publishHmr);
		}
	});
};

function publishStats(
	action: HotMiddlewareMessage['action'],
	statsResult: webpack.Stats,
	publishHmr: (hmrEvent: HotMiddlewareMessage) => void,
) {
	// Studio uses a single compiler. Child compilations must not replace the
	// parent compilation's hash in the HMR message.
	publishHmr({
		name: statsResult.compilation.name ?? '',
		action,
		time: statsResult.endTime - statsResult.startTime,
		hash: statsResult.hash,
		// Build diagnostics are printed by the dev middleware.
		warnings: [],
		errors: [],
		// Module names only label browser console messages. The client already
		// falls back to module IDs, which are named in development builds.
		modules: {},
	});
}
