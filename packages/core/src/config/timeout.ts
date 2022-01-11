import {DEFAULT_PUPPETEER_TIMEOUT} from '../timeout';

let currentTimeout: number = DEFAULT_PUPPETEER_TIMEOUT;

export const setPuppeteerTimeout = (newPuppeteerTimeout: number) => {
	if (typeof newPuppeteerTimeout !== 'number') {
		throw new Error('--concurrency flag must be a number.');
	}

	currentTimeout = newPuppeteerTimeout;
};

export const getCurrentPuppeteerTimeout = (): number => {
	return currentTimeout;
};
