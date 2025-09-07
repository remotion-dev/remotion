import {cancelRender} from './cancel-render.js';
import type {RemotionEnvironment} from './get-remotion-environment.js';
import {getRemotionEnvironment} from './get-remotion-environment.js';
import {Log} from './log.js';
import {truthy} from './truthy.js';

if (typeof window !== 'undefined') {
	window.remotion_renderReady = false;
}

let handles: number[] = [];
if (typeof window !== 'undefined') {
	window.remotion_delayRenderTimeouts = {};
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
export const delayRenderInternal = (
	environment: RemotionEnvironment,
	label?: string,
	options?: DelayRenderOptions,
): number => {
	if (typeof label !== 'string' && typeof label !== 'undefined') {
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
				(typeof window === 'undefined'
					? defaultTimeout
					: (window.remotion_puppeteerTimeout ?? defaultTimeout))) - 2000;
		if (typeof window !== 'undefined') {
			const retriesLeft =
				(options?.retries ?? 0) - (window.remotion_attempt - 1);
			window.remotion_delayRenderTimeouts[handle] = {
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

					cancelRender(Error(message));
				}, timeoutToUse),
			};
		}
	}

	if (typeof window !== 'undefined') {
		window.remotion_renderReady = false;
	}

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
	return delayRenderInternal(getRemotionEnvironment(), label, options);
};

/**
 * Internal function that accepts environment as parameter.
 * @private
 */
export const continueRenderInternal = (
	handle: number,
	environment: RemotionEnvironment,
): void => {
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
			if (environment.isRendering) {
				if (!window.remotion_delayRenderTimeouts[handle]) {
					return false;
				}

				const {label, startTime, timeout} =
					window.remotion_delayRenderTimeouts[handle];
				clearTimeout(timeout);
				const message = [
					label ? `delayRender() "${label}"` : 'A delayRender()',
					DELAY_RENDER_CLEAR_TOKEN,
					`${Date.now() - startTime}ms`,
				]
					.filter(truthy)
					.join(' ');
				Log.verbose(window.remotion_logLevel, message);
				delete window.remotion_delayRenderTimeouts[handle];
			}

			return false;
		}

		return true;
	});
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.remotion_renderReady = true;
	}
};

/*
 * @description Unblock a render that has been blocked by delayRender().
 * @see [Documentation](https://remotion.dev/docs/continue-render)
 */
export const continueRender = (handle: number): void => {
	continueRenderInternal(handle, getRemotionEnvironment());
};
