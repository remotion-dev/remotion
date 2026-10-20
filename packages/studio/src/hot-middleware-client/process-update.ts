/* eslint-disable no-console */
/**
 * Source code is adapted from
 * https://github.com/webpack-contrib/webpack-hot-middleware#readme
 * and rewritten in TypeScript. This file is MIT licensed
 */

/**
 * Based heavily on https://github.com/webpack/webpack/blob/
 *  c0afdf9c6abc1dd70707c594e473802a566f7b6e/hot/only-dev-server.js
 * Original copyright Tobias Koppers @sokra (MIT license)
 */

import type {HotMiddlewareOptions, ModuleMap} from '@remotion/studio-shared';
import {REACT_REFRESH_FINISHED_EVENT} from '@remotion/studio-shared';
import {
	addErrorToOverlay,
	clearRecoveredRuntimeErrors,
	getRuntimeErrors,
} from '../error-overlay/runtime-error-store';
import {reloadUrl} from '../helpers/url-state';

if (!__webpack_module__.hot) {
	throw new Error('[Fast refresh] Hot Module Replacement is disabled.');
}

const hmrDocsUrl = 'https://webpack.js.org/concepts/hot-module-replacement/';

let lastHash: string | undefined;
const failureStatuses = {abort: 1, fail: 1};
const applyOptions: AcceptOptions = {
	ignoreUnaccepted: true,
	ignoreDeclined: true,
	ignoreErrored: true,
	onUnaccepted(data) {
		console.warn(
			'Ignored an update to unaccepted module ' +
				(data.chain ?? []).join(' -> '),
		);

		// Case:
		// 1. Import a CSS file with a bad filename in Root.tsx
		// 2. Fix the import and save it
		if (!window.remotion_isStudio) {
			reloadUrl();
		}
	},
	onDeclined(data) {
		console.warn(
			'Ignored an update to declined module ' + (data.chain ?? []).join(' -> '),
		);
	},
	onErrored(data) {
		console.error(data.error);
		console.warn(
			'Ignored an error while updating module ' +
				data.moduleId +
				' (' +
				data.type +
				')',
		);
	},
};

function upToDate(hash?: string) {
	if (hash) lastHash = hash;
	return lastHash === __webpack_hash__;
}

export const processUpdate = function (
	hash: string | undefined,
	moduleMap: ModuleMap,
	options: HotMiddlewareOptions,
) {
	async function check() {
		try {
			const updatedModules = await __webpack_module__.hot.check(false);
			if (!updatedModules) {
				if (options.warn) {
					console.warn(
						'[Fast refresh] Cannot find update (Full reload needed)',
					);
					console.warn(
						'[Fast refresh] (Probably because of restarting the server)',
					);
				}

				performReload();
				return null;
			}

			const errorsBeforeUpdate = getRuntimeErrors();
			const failedModules = new Set<ModuleId>();
			let reactRefreshFinished = false;
			const onReactRefreshFinished = () => {
				reactRefreshFinished = true;
			};

			window.addEventListener(
				REACT_REFRESH_FINISHED_EVENT,
				onReactRefreshFinished,
			);
			try {
				const renewedModules = await __webpack_module__.hot.apply({
					...applyOptions,
					onErrored(data) {
						const moduleIds = [data.moduleId];
						if (data.dependencyId !== undefined) {
							moduleIds.push(data.dependencyId);
						}

						for (const moduleId of moduleIds) {
							failedModules.add(moduleId);
						}

						const error =
							data.error ??
							data.originalError ??
							new Error('Hot update failed');
						addErrorToOverlay(
							error instanceof Error ? error : new Error(String(error)),
							moduleIds,
						);
						applyOptions.onErrored?.(data);
					},
				});
				// Rspack schedules its refresh after apply. Flush it now so recovery
				// follows the refreshed root, including errors from rendering it.
				try {
					window.remotion_performReactRefresh?.();
				} catch (err) {
					reactRefreshFinished = false;
					addErrorToOverlay(
						err instanceof Error ? err : new Error(String(err)),
						null,
					);
				}

				clearRecoveredRuntimeErrors({
					errorsBeforeUpdate,
					updatedModules: renewedModules,
					failedModules,
					moduleMap,
					reactRefreshFinished,
				});

				if (!upToDate()) {
					check();
				}

				logUpdates(updatedModules, renewedModules);
			} finally {
				window.removeEventListener(
					REACT_REFRESH_FINISHED_EVENT,
					onReactRefreshFinished,
				);
			}
		} catch (err) {
			handleError(err as Error);
		}
	}

	function logUpdates(updatedModules: ModuleId[], renewedModules: ModuleId[]) {
		const unacceptedModules =
			updatedModules?.filter((moduleId) => {
				return renewedModules && renewedModules.indexOf(moduleId) < 0;
			}) ?? [];

		if (unacceptedModules.length > 0) {
			if (options.warn) {
				console.warn(
					"[Fast refresh] The following modules couldn't be hot updated: " +
						'(Full reload needed)\n' +
						'This is usually because the modules which have changed ' +
						'(and their parents) do not know how to hot reload themselves. ' +
						'See ' +
						hmrDocsUrl +
						' for more details.',
				);
				unacceptedModules.forEach((moduleId) => {
					console.warn(
						'[Fast refresh]  - ' + (moduleMap[moduleId] || moduleId),
					);
				});
			}

			performReload();
			return;
		}

		if (!renewedModules || renewedModules.length === 0) {
			console.log('[Fast refresh] Nothing hot updated.');
		} else {
			renewedModules.forEach((moduleId) => {
				console.log(
					`[Fast refresh] ${moduleMap[moduleId] || moduleId} fast refreshed.`,
				);
			});
		}
	}

	function handleError(err: Error) {
		if ((__webpack_module__.hot?.status() ?? 'nope') in failureStatuses) {
			if (options.warn) {
				console.warn(
					'[Fast refresh] Cannot check for update (Full reload needed)',
				);
				console.warn('[Fast refresh] ' + (err.stack || err.message));
			}

			performReload();
			return;
		}

		if (options.warn) {
			console.warn(
				'[Fast refresh] Update check failed: ' + (err.stack || err.message),
			);

			reloadUrl();
		}
	}

	function performReload() {
		if (!reload) {
			return;
		}

		if (options.warn) console.warn('[Fast refresh] Reloading page');
		reloadUrl();
	}

	const {reload} = options;
	if (!upToDate(hash) && __webpack_module__.hot?.status() === 'idle') {
		check();
	}
};
