import {getRemotionEnvironment} from './get-environment';
import {truthy} from './truthy';

if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];
const timeouts: {[key: string]: number | NodeJS.Timeout} = {};
export const DELAY_RENDER_CALLSTACK_TOKEN = 'The delayRender was called:';

/**
 * Call this function to tell Remotion to wait before capturing this frame until data has loaded. Use continueRender() to unblock the render.
 * @param label _optional_ A label to identify the call in case it does time out.
 * @returns {number} An identifier to be passed to continueRender().
 * @link https://www.remotion.dev/docs/delay-render
 */
export const delayRender = (label?: string): number => {
	if (typeof label !== 'string' && typeof label !== 'undefined') {
		throw new Error(
			'The label parameter of delayRender() must be a string or undefined, got: ' +
				JSON.stringify(label)
		);
	}

	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (getRemotionEnvironment() === 'rendering') {
		const timeoutToUse =
			typeof window === 'undefined'
				? 30000
				: window.remotion_puppeteerTimeout - 2000;
		timeouts[handle] = setTimeout(() => {
			const message = [
				`A delayRender()`,
				label ? `"${label}"` : null,
				`was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help.`,
				DELAY_RENDER_CALLSTACK_TOKEN,
				called,
			]
				.filter(truthy)
				.join(' ');

			throw new Error(message);
		}, timeoutToUse);
	}

	if (typeof window !== 'undefined') {
		window.ready = false;
	}

	return handle;
};

/**
 * Unblock a render that has been blocked by delayRender()
 * @param handle The return value of delayRender().
 * @link https://www.remotion.dev/docs/continue-render
 */
export const continueRender = (handle: number): void => {
	if (typeof handle === 'undefined') {
		throw new TypeError(
			'The continueRender() method must be called with a parameter that is the return value of delayRender(). No value was passed.'
		);
	}

	if (typeof handle !== 'number') {
		throw new TypeError(
			'The parameter passed into continueRender() must be the return value of delayRender() which is a number. Got: ' +
				JSON.stringify(handle)
		);
	}

	handles = handles.filter((h) => {
		if (h === handle) {
			if (getRemotionEnvironment() === 'rendering') {
				clearTimeout(timeouts[handle] as number);
			}

			return false;
		}

		return true;
	});
	if (handles.length === 0 && typeof window !== 'undefined') {
		window.ready = true;
	}
};
