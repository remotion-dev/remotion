/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */

import type {webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {HotMiddlewareMessage, ModuleMap} from '@remotion/studio-shared';
import type {LiveEventsServer} from '../live-events';
import type {WebpackStats} from './types';

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
	compiler.hooks.done.tap('remotion', onDone);

	function onInvalid() {
		latestStats = null;
		RenderInternals.Log.info({indent: false, logLevel}, 'Building...');
		publishHmr({
			action: 'building',
		});
	}

	function onDone(statsResult: webpack.Stats) {
		// Keep hold of latest stats so they can be propagated to new clients
		latestStats = statsResult;
		publishStats('built', latestStats, publishHmr);
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
	const stats = statsResult.toJson({
		all: false,
		cached: true,
		children: true,
		modules: true,
		timings: true,
		hash: true,
	});
	// For multi-compiler, stats will be an object with a 'children' array of stats
	const bundles = extractBundles(stats);
	bundles.forEach((_stats: WebpackStats) => {
		let name = _stats.name || '';

		// Fallback to compilation name in case of 1 bundle (if it exists)
		if (bundles.length === 1 && !name && statsResult.compilation) {
			name = statsResult.compilation.name || '';
		}

		publishHmr({
			name,
			action,
			time: _stats.time,
			hash: _stats.hash,
			warnings: _stats.warnings || [],
			errors: _stats.errors || [],
			modules: buildModuleMap(_stats.modules),
		});
	});
}

function extractBundles(stats: WebpackStats) {
	// Stats has modules, single bundle
	if (stats.modules) return [stats];

	// Stats has children, multiple bundles
	if (stats.children?.length) return stats.children;

	// Not sure, assume single
	return [stats];
}

function buildModuleMap(modules: WebpackStats['modules']): ModuleMap {
	const map: {[key: string]: string} = {};
	if (!modules) {
		return map;
	}

	modules.forEach((module) => {
		const id = module.id as string;
		map[id] = module.name as string;
	});
	return map;
}
