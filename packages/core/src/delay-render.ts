import {
	cancelRenderInternal,
	getErrorStackWithMessage,
} from './cancel-render.js';
import {
	DELAY_RENDER_CALLSTACK_TOKEN,
	DELAY_RENDER_CLEAR_TOKEN,
	DELAY_RENDER_RETRIES_LEFT,
	DELAY_RENDER_RETRY_TOKEN,
} from './delay-render-constants.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import type {LogLevel} from './log.js';
import {Log} from './log.js';
import type {RemotionEnvironment} from './remotion-environment-context.js';
import {truthy} from './truthy.js';

export {
	DELAY_RENDER_CALLSTACK_TOKEN,
	DELAY_RENDER_CLEAR_TOKEN,
	DELAY_RENDER_RETRIES_LEFT,
	DELAY_RENDER_RETRY_TOKEN,
} from './delay-render-constants.js';

export type DelayRenderScope = {
	remotion_renderReady: boolean;
	remotion_delayRenderTimeouts: {
		[key: string]: {
			label: string | null;
			timeout: number | Timer;
			startTime: number;
		};
	};
	remotion_puppeteerTimeout: number;
	remotion_attempt: number;
	remotion_delayRenderHandles: number[];
	remotion_cancelledError?: string;
};

if (typeof window !== 'undefined') {
	window.remotion_renderReady = false;
	if (!window.remotion_delayRenderTimeouts) {
		window.remotion_delayRenderTimeouts = {};
	}

	window.remotion_delayRenderHandles = [];
}

type TimeoutSuspensionState = {
	active: number;
	startedAt: number;
	elapsed: number;
	handles: Map<number, {suspend: () => () => void; cancel: () => void}>;
};

const timeoutSuspensions = new WeakMap<
	DelayRenderScope,
	TimeoutSuspensionState
>();

export const getDelayRenderSuspendedTime = (
	scope: DelayRenderScope,
): number => {
	const state = timeoutSuspensions.get(scope);
	return state
		? state.elapsed + (state.active > 0 ? Date.now() - state.startedAt : 0)
		: 0;
};

export const suspendDelayRenderTimeout = (
	scope: DelayRenderScope,
	handle: number,
): (() => void) => {
	return (
		timeoutSuspensions.get(scope)?.handles.get(handle)?.suspend() ?? (() => {})
	);
};

const defaultTimeout = 30000;

export type DelayRenderOptions = {
	timeoutInMilliseconds?: number;
	retries?: number;
};

/**
 * Internal function that accepts environment as parameter.
 * This allows useDelayRender to control its own environment source.
 * @private
 */
type DelayRenderInternalOptions = {
	scope: DelayRenderScope;
	environment: RemotionEnvironment;
	label: string | null;
	options: DelayRenderOptions;
};

export const delayRenderInternal = ({
	scope,
	environment,
	label,
	options,
}: DelayRenderInternalOptions): number => {
	if (typeof label !== 'string' && label !== null) {
		throw new Error(
			'The label parameter of delayRender() must be a string or undefined, got: ' +
				JSON.stringify(label),
		);
	}

	const handle = Math.random();
	scope.remotion_delayRenderHandles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (environment.isRendering) {
		const timeoutToUse = Math.max(
			0,
			(options?.timeoutInMilliseconds ??
				scope.remotion_puppeteerTimeout ??
				defaultTimeout) - 2000,
		);
		const retriesLeft = (options?.retries ?? 0) - (scope.remotion_attempt - 1);
		let remaining = timeoutToUse;
		let startedAt = Date.now();
		let suspensionDepth = 0;
		let registered = true;
		const state = timeoutSuspensions.get(scope) ?? {
			active: 0,
			startedAt: 0,
			elapsed: 0,
			handles: new Map(),
		};
		timeoutSuspensions.set(scope, state);
		const endSuspension = () => {
			state.active--;
			if (state.active === 0) {
				state.elapsed += Date.now() - state.startedAt;
			}
		};
		const cancel = () => {
			if (!registered) {
				return;
			}
			registered = false;
			if (suspensionDepth > 0) {
				endSuspension();
			}
			state.handles.delete(handle);
		};
		const onTimeout = () => {
			cancel();
			const message = [
				`A delayRender()`,
				label ? `"${label}"` : null,
				`was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help.`,
				retriesLeft > 0 ? DELAY_RENDER_RETRIES_LEFT + retriesLeft : null,
				retriesLeft > 0 ? DELAY_RENDER_RETRY_TOKEN : null,
				DELAY_RENDER_CALLSTACK_TOKEN,
				called,
			]
				.filter(truthy)
				.join(' ');

			// in client-side rendering, don't throw (would be uncaught from setTimeout)
			if (environment.isClientSideRendering) {
				scope.remotion_cancelledError = getErrorStackWithMessage(
					Error(message),
				);
			} else {
				cancelRenderInternal(scope, Error(message));
			}
		};
		scope.remotion_delayRenderTimeouts[handle] = {
			label: label ?? null,
			startTime: Date.now(),
			timeout: setTimeout(onTimeout, remaining),
		};
		state.handles.set(handle, {
			cancel,
			suspend: () => {
				if (suspensionDepth++ === 0) {
					clearTimeout(scope.remotion_delayRenderTimeouts[handle].timeout);
					remaining = Math.max(0, remaining - (Date.now() - startedAt));
					if (state.active++ === 0) {
						state.startedAt = Date.now();
					}
				}
				let resumed = false;
				return () => {
					if (resumed || !registered) {
						return;
					}
					resumed = true;
					if (--suspensionDepth === 0) {
						endSuspension();
						startedAt = Date.now();
						scope.remotion_delayRenderTimeouts[handle].timeout = setTimeout(
							onTimeout,
							remaining,
						);
					}
				};
			},
		});
	}

	scope.remotion_renderReady = false;

	return handle;
};

/*
 * @description Call this function to signal that a frame should not be rendered until an asynchronous task (such as data fetching) is complete. Use continueRender(handle) to proceed with rendering once the task is complete.
 * @see [Documentation](https://remotion.dev/docs/delay-render)
 */
export const delayRender = (
	label?: string,
	options?: DelayRenderOptions,
): number => {
	if (typeof window === 'undefined') {
		return Math.random();
	}

	return delayRenderInternal({
		scope: window,
		environment: getRemotionEnvironment(),
		label: label ?? null,
		options: options ?? {},
	});
};

/**
 * Internal function that accepts environment as parameter.
 * @private
 */
type ContinueRenderInternalOptions = {
	scope: DelayRenderScope;
	handle: number;
	environment: RemotionEnvironment;
	logLevel: LogLevel;
};

export const continueRenderInternal = ({
	scope,
	handle,
	environment,
	logLevel,
}: ContinueRenderInternalOptions): void => {
	if (typeof handle === 'undefined') {
		throw new TypeError(
			'The continueRender() method must be called with a parameter that is the return value of delayRender(). No value was passed.',
		);
	}

	if (typeof handle !== 'number') {
		throw new TypeError(
			'The parameter passed into continueRender() must be the return value of delayRender() which is a number. Got: ' +
				JSON.stringify(handle),
		);
	}

	const handleExists = scope.remotion_delayRenderHandles.includes(handle);
	const timeoutEntry = scope.remotion_delayRenderTimeouts[handle];
	if (handleExists && environment.isRendering && timeoutEntry) {
		const {label, startTime, timeout} = timeoutEntry;
		timeoutSuspensions.get(scope)?.handles.get(handle)?.cancel();
		clearTimeout(timeout);
		const message = [
			label ? `"${label}"` : 'A handle',
			DELAY_RENDER_CLEAR_TOKEN,
			`${Date.now() - startTime}ms`,
		]
			.filter(truthy)
			.join(' ');
		Log.verbose({logLevel, tag: 'delayRender()'}, message);
		delete scope.remotion_delayRenderTimeouts[handle];
	}

	scope.remotion_delayRenderHandles = scope.remotion_delayRenderHandles.filter(
		(h) => h !== handle,
	);

	if (scope.remotion_delayRenderHandles.length === 0) {
		scope.remotion_renderReady = true;
	}
};

/*
 * @description Unblock a render that has been blocked by delayRender().
 * @see [Documentation](https://remotion.dev/docs/continue-render)
 */
export const continueRender = (handle: number): void => {
	if (typeof window === 'undefined') {
		return;
	}

	continueRenderInternal({
		scope: window,
		handle,
		environment: getRemotionEnvironment(),
		logLevel: window.remotion_logLevel ?? 'info',
	});
};
