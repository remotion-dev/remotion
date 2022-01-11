import {Page} from 'puppeteer-core';
import {Internals} from 'remotion';
import {normalizeServeUrl} from './normalize-serve-url';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

export const setPropsAndEnv = async ({
	inputProps,
	envVariables,
	page,
	serveUrl,
	initialFrame,
	timeoutInMilliseconds,
}: {
	inputProps: unknown;
	envVariables: Record<string, string> | undefined;
	page: Page;
	serveUrl: string;
	initialFrame: number;
	timeoutInMilliseconds: number | undefined;
}) => {
	await page.goto(normalizeServeUrl(serveUrl));
	validatePuppeteerTimeout(timeoutInMilliseconds);
	const actualTimeout =
		timeoutInMilliseconds ?? Internals.DEFAULT_PUPPETEER_TIMEOUT;
	page.setDefaultTimeout(actualTimeout);
	page.setDefaultNavigationTimeout(actualTimeout);
	await page.goto(`http://localhost:${port}/index.html`);
	await page.evaluate(
		(key, value) => {
			window.localStorage.setItem(key, value);
		},
		Internals.PUPPETEER_TIMEOUT_KEY,
		actualTimeout
	);
	if (inputProps) {
		await page.evaluate(
			(key, input) => {
				window.localStorage.setItem(key, input);
			},
			Internals.INPUT_PROPS_KEY,
			JSON.stringify(inputProps)
		);
	}

	if (envVariables) {
		await page.evaluate(
			(key, input) => {
				window.localStorage.setItem(key, input);
			},
			Internals.ENV_VARIABLES_LOCAL_STORAGE_KEY,
			JSON.stringify(envVariables)
		);
	}

	await page.evaluate(
		(key, value) => {
			window.localStorage.setItem(key, value);
		},
		Internals.INITIAL_FRAME_LOCAL_STORAGE_KEY,
		initialFrame
	);
};
