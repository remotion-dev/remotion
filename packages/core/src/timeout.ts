export const DEFAULT_PUPPETEER_TIMEOUT = 30000;

export const PUPPETEER_TIMEOUT_KEY = 'remotion.puppeteerTimeout';

const getPuppeteerTimeout = (): number => {
	const param = localStorage.getItem(PUPPETEER_TIMEOUT_KEY);
	return param ? Number(param) : DEFAULT_PUPPETEER_TIMEOUT;
};

export const setupPuppeteerTimeout = () => {
	window.remotion_puppeteerTimeout = getPuppeteerTimeout();
};
