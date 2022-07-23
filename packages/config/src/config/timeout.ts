import {RenderInternals} from '@remotion/renderer';

let currentTimeout: number = RenderInternals.DEFAULT_TIMEOUT;

export const setPuppeteerTimeout = (newPuppeteerTimeout: number) => {
	if (typeof newPuppeteerTimeout !== 'number') {
		throw new Error(
			'--timeout flag / setTimeoutInMilliseconds() must be a number, but got ' +
				JSON.stringify(newPuppeteerTimeout)
		);
	}

	currentTimeout = newPuppeteerTimeout;
};

export const getCurrentPuppeteerTimeout = (): number => {
	return currentTimeout;
};
