import {reloadUrl} from '../helpers/url-state';
import {didUnmountReactApp, startReportingRuntimeErrors} from './react-overlay';
import {mountRemotionOverlay} from './remotion-overlay';
import {setErrorsRef} from './remotion-overlay/Overlay';

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

export const startErrorOverlay = () => {
	startReportingRuntimeErrors(() => {
		if (__webpack_module__.hot) {
			__webpack_module__.hot.addStatusHandler((status) => {
				if (status === 'apply') {
					if (didUnmountReactApp()) {
						return reloadUrl();
					}

					setErrorsRef.current?.setErrors({
						type: 'clear',
					});
				}
			});
		}
	});
	mountRemotionOverlay();
};
