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
	validatePuppeteerTimeout(timeoutInMilliseconds);
	const actualTimeout =
		timeoutInMilliseconds ?? Internals.DEFAULT_PUPPETEER_TIMEOUT;
	page.setDefaultTimeout(actualTimeout);
	page.setDefaultNavigationTimeout(actualTimeout);

	const urlToVisit = normalizeServeUrl(serveUrl);
	const pageRes = await page.goto(urlToVisit);

	if (pageRes.status() !== 200) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was ${pageRes.status()} instead of 200. Does the site you specified exist?`
		);
	}

	const isRemotionFn = await page.evaluate('window.getStaticCompositions');
	if (isRemotionFn === undefined) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined. However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.`
		);
	}

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
