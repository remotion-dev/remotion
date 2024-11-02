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
import {showNotification} from '../components/Notifications/NotificationCenter';
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
	const {reload} = options;
	if (!upToDate(hash) && __webpack_module__.hot?.status() === 'idle') {
		check();
	}

	async function check() {
		const cb = function (err: Error | null, updatedModules: ModuleId[] | null) {
			if (err) return handleError(err);

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

			const applyCallback = function (
				applyErr: Error | null,
				renewedModules: ModuleId[],
			) {
				if (applyErr) return handleError(applyErr);

				if (!upToDate()) {
					check();
				}

				logUpdates(updatedModules, renewedModules);
			};

			const applyResult = __webpack_module__.hot?.apply(applyOptions);
			if ((applyResult as unknown as Promise<unknown>)?.then) {
				// HotModuleReplacement.runtime.js refers to the result as `outdatedModules`
				(applyResult as unknown as Promise<ModuleId[]>)
					.then((outdatedModules) => {
						applyCallback(null, outdatedModules);
					})
					.catch((_err: Error) => applyCallback(_err, []));
			}
		};

		try {
			const result = await __webpack_module__.hot?.check(false);
			cb(null, result);
		} catch (err) {
			cb(err as Error, []);
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
			if (!window.remotion_unsavedProps) {
				reloadUrl();
			}
		}
	}

	function performReload() {
		if (!reload) {
			return;
		}

		if (options.warn) console.warn('[Fast refresh] Reloading page');
		if (window.remotion_unsavedProps) {
			showNotification(
				'Fast refresh needs to reload the page, but you have unsaved props. Save then reload the page to apply changes.',
				1000,
			);
		} else {
			reloadUrl();
		}
	}
};
