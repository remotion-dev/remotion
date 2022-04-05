import {getRemotionEnvironment} from './get-environment';
import {DEFAULT_PUPPETEER_TIMEOUT} from './timeout';
import {truthy} from './truthy';

if (typeof window !== 'undefined') {
	window.ready = false;
}

let handles: number[] = [];
const timeouts: {[key: string]: number | NodeJS.Timeout} = {};

export const delayRender = (description?: string): number => {
	if (typeof description !== 'string' && typeof description !== 'undefined') {
		throw new Error(
			'The description parameter of delayRender() must be a string or undefined, got: ' +
				JSON.stringify(description)
		);
	}

	const handle = Math.random();
	handles.push(handle);
	const called = Error().stack?.replace(/^Error/g, '') ?? '';

	if (getRemotionEnvironment() === 'rendering') {
		const timeoutToUse =
			typeof window === 'undefined'
				? DEFAULT_PUPPETEER_TIMEOUT
				: window.remotion_puppeteerTimeout - 2000;
		timeouts[handle] = setTimeout(() => {
			const message = [
				`A delayRender()`,
				description ? `"${description}"` : null,
				`was called but not cleared after ${timeoutToUse}ms. See https://remotion.dev/docs/timeout for help. The delayRender was called: ${called}`,
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
