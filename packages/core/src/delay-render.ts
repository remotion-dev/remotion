import {cancelRenderInternal} from './cancel-render.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import type {LogLevel} from './log.js';
import {Log} from './log.js';
import type {RemotionEnvironment} from './remotion-environment-context.js';
import {truthy} from './truthy.js';

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
	remotion_cancelledError?: string;
};

let handles: number[] = [];
if (typeof window !== 'undefined') {
	window.remotion_renderReady = false;
	if (!window.remotion_delayRenderTimeouts) {
		window.remotion_delayRenderTimeouts = {};
	}
}

export const DELAY_RENDER_CALLSTACK_TOKEN = 'The delayRender was called:';
export const DELAY_RENDER_RETRIES_LEFT = 'Retries left: ';
export const DELAY_RENDER_RETRY_TOKEN =
	'- Rendering the frame will be retried.';
export const DELAY_RENDER_CLEAR_TOKEN = 'handle was cleared after';

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
export const delayRenderInternal = ({
	scope,
	environment,
	label,
	options,
}: {
	scope: DelayRenderScope;
	environment: RemotionEnvironment;
	label: string | null;
	options: DelayRenderOptions;
}): number => {
	if (typeof label !== 'string' && label !== null) {
		throw new Error(
			'The label parameter of delayRender() must be a string or undefined, got: ' +
				JSON.stringify(label),
		);
	}

	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (environment.isRendering) {
		const timeoutToUse =
			(options?.timeoutInMilliseconds ??
				scope.remotion_puppeteerTimeout ??
				defaultTimeout) - 2000;
		const retriesLeft = (options?.retries ?? 0) - (scope.remotion_attempt - 1);
		scope.remotion_delayRenderTimeouts[handle] = {
			label: label ?? null,
			startTime: Date.now(),
			timeout: setTimeout(() => {
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

				cancelRenderInternal(scope, Error(message));
			}, timeoutToUse),
		};
	}

	scope.remotion_renderReady = false;

	return handle;
};

/**
 * Internal function that accepts environment as parameter.
 * @private
 */
export const continueRenderInternal = ({
	scope,
	handle,
	environment,
	logLevel,
}: {
	scope: DelayRenderScope;
	handle: number;
	environment: RemotionEnvironment;
	logLevel: LogLevel;
}): void => {
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

	handles = handles.filter((h) => {
		if (h === handle) {
			if (environment.isRendering && scope !== undefined) {
				if (!scope.remotion_delayRenderTimeouts[handle]) {
					return false;
				}

				const {label, startTime, timeout} =
					scope.remotion_delayRenderTimeouts[handle];
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

			return false;
		}

		return true;
	});

	if (typeof scope !== 'undefined') {
		const scopeHasPendingHandles =
			Object.keys(scope.remotion_delayRenderTimeouts).length > 0;

		if (!scopeHasPendingHandles) {
			scope.remotion_renderReady = true;
		}
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
