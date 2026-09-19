import type {FC} from 'react';
import {Internals} from 'remotion';
import {createBrowserModuleScope} from './browser-module-scope';
import {
	browserBundleHmrBridgeName,
	browserBundleHotUpdateName,
	type BrowserBundleHotRuntime,
} from './fast-refresh-bridge';
import {createBrowserHmrAssetManager} from './hmr-assets';
import type {BrowserBundle} from './types';

export type BrowserBundleRuntime = {
	applyBundle: (bundle: BrowserBundle) => Promise<FC>;
	dispose: () => void;
};

export const createBrowserBundleRuntime = (): BrowserBundleRuntime => {
	if (typeof document === 'undefined' || !document.body) {
		throw new Error(
			'createBrowserBundleRuntime() must be called in a browser.',
		);
	}

	if (Object.hasOwn(globalThis, browserBundleHmrBridgeName)) {
		throw new Error(
			'Only one Fast Refresh runtime can use a preview document.',
		);
	}

	const assets = createBrowserHmrAssetManager({
		createObjectUrl: (blob) => URL.createObjectURL(blob),
		revokeObjectUrl: (url) => URL.revokeObjectURL(url),
	});
	let hotRuntime: BrowserBundleHotRuntime | null = null;
	let scope: ReturnType<typeof createBrowserModuleScope> | null = null;
	let sessionId: string | null = null;
	let disposed = false;
	let ownsComponentIdentityResolver = false;
	let queue: Promise<void> = Promise.resolve();
	const previousRequire = Object.getOwnPropertyDescriptor(
		globalThis,
		'require',
	);
	const previousHotUpdate = Object.getOwnPropertyDescriptor(
		globalThis,
		browserBundleHotUpdateName,
	);
	const bridge = {
		...assets.bridge,
		setHotRuntime: (runtime: BrowserBundleHotRuntime) => {
			hotRuntime = runtime;
		},
	};
	Object.defineProperty(globalThis, browserBundleHmrBridgeName, {
		configurable: true,
		value: bridge,
	});

	const getHotRuntime = (): BrowserBundleHotRuntime => {
		if (hotRuntime === null) {
			throw new Error('The browser bundle did not initialize its HMR runtime.');
		}

		return hotRuntime;
	};

	return {
		applyBundle: (bundle) => {
			const run = queue.then(async () => {
				if (disposed) {
					throw new Error('The browser bundle runtime was disposed.');
				}

				const update = bundle.fastRefresh;
				if (!update) {
					throw new Error(
						'Create the bundler with enableFastRefresh: true before applying bundles.',
					);
				}

				if (sessionId !== null && sessionId !== update.sessionId) {
					throw new Error(
						'The compiler session changed. Create a new preview runtime for the new project.',
					);
				}

				// Keep React Refresh out of production hosts using the one-shot loader.
				const {default: refresh} = await import('react-refresh/runtime');
				if (disposed) {
					throw new Error('The browser bundle runtime was disposed.');
				}

				if (typeof refresh.performReactRefresh !== 'function') {
					throw new Error(
						'Fast Refresh requires a development React renderer in the preview document.',
					);
				}

				if (scope === null) {
					const hook: unknown = Reflect.get(
						globalThis,
						'__REACT_DEVTOOLS_GLOBAL_HOOK__',
					);
					if (
						hook === null ||
						typeof hook !== 'object' ||
						!('renderers' in hook) ||
						!(hook.renderers instanceof Map) ||
						('isDisabled' in hook && hook.isDisabled)
					) {
						throw new Error(
							'Inject the React Refresh hook before importing the development preview renderer.',
						);
					}

					// Refresh's own hook tracks renderers privately. Its public map
					// is populated only when React DevTools supplies the hook.
					const renderers: unknown[] = [...hook.renderers.values()];
					if (
						renderers.length > 0 &&
						!renderers.some(
							(renderer) =>
								renderer !== null &&
								typeof renderer === 'object' &&
								'scheduleRefresh' in renderer &&
								typeof renderer.scheduleRefresh === 'function' &&
								'setRefreshHandler' in renderer &&
								typeof renderer.setRefreshHandler === 'function',
						)
					) {
						throw new Error(
							'Fast Refresh requires development React DOM. Inject the React Refresh hook before importing the preview renderer.',
						);
					}

					const initialScope = createBrowserModuleScope(
						new Map([['react-refresh/runtime', refresh]]),
					);
					Internals.setComponentIdentityResolver(
						(component) => refresh.getFamilyByType(component) ?? component,
					);
					ownsComponentIdentityResolver = true;
					Object.defineProperty(globalThis, 'require', {
						configurable: true,
						value: initialScope.resolveModule,
					});
					initialScope.evaluate(bundle.code);
					initialScope.getRoot();
					scope = initialScope;
					sessionId = update.sessionId;
				} else {
					const hot = getHotRuntime();
					if (hot.getHash() === update.hash) {
						return scope.getRoot();
					}

					if (hot.getHash() !== update.previousHash) {
						throw new Error(
							'Fast Refresh bundles must be applied in compilation order. A compiled update was skipped.',
						);
					}

					if (hot.status() !== 'idle') {
						throw new Error(
							`Cannot apply a Fast Refresh update while HMR is "${hot.status()}".`,
						);
					}

					assets.updateAssets(update.assets);
					scope.beginUpdate();
					const changedModules = await hot.check();
					if (disposed) {
						throw new Error('The browser bundle runtime was disposed.');
					}

					if (changedModules === null) {
						throw new Error('Rspack could not find the Fast Refresh update.');
					}

					await hot.apply();
					if (disposed) {
						throw new Error('The browser bundle runtime was disposed.');
					}

					refresh.performReactRefresh();
				}

				if (disposed) {
					throw new Error('The browser bundle runtime was disposed.');
				}

				if (getHotRuntime().getHash() !== update.hash) {
					throw new Error(
						'Rspack did not apply the expected Fast Refresh update.',
					);
				}

				return scope.getRoot();
			});
			queue = run.then(
				() => undefined,
				() => undefined,
			);
			return run;
		},
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			if (ownsComponentIdentityResolver) {
				Internals.setComponentIdentityResolver(null);
			}

			assets.dispose();
			Reflect.deleteProperty(globalThis, browserBundleHmrBridgeName);
			if (previousRequire) {
				Object.defineProperty(globalThis, 'require', previousRequire);
			} else {
				Reflect.deleteProperty(globalThis, 'require');
			}

			if (previousHotUpdate) {
				Object.defineProperty(
					globalThis,
					browserBundleHotUpdateName,
					previousHotUpdate,
				);
			} else {
				Reflect.deleteProperty(globalThis, browserBundleHotUpdateName);
			}
		},
	};
};
