export const DEFAULT_PUPPETEER_TIMEOUT = 30000;

const getPuppeteerTimeout = (): number => {
	const param = window.remotion_puppeteerTimeout;
	return param ? Number(param) : DEFAULT_PUPPETEER_TIMEOUT;
};

export const setupPuppeteerTimeout = () => {
	window.remotion_puppeteerTimeout = getPuppeteerTimeout();
};
