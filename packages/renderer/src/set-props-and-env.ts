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

	const status = pageRes.status();
	if (
		status !== 200 &&
		status !== 301 &&
		status !== 302 &&
		status !== 303 &&
		status !== 304
	) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was ${status} instead of 200. Does the site you specified exist?`
		);
	}

	const siteVersion = await page.evaluate(() => {
		return window.siteVersion;
	});

	if (siteVersion !== '2') {
		throw new Error(
			`Incompatible site: When visiting ${urlToVisit}, a bundle was found, but one that is not compatible with this version of Remotion. The bundle format changed in versions from March 2022 onwards. To resolve this error, please bundle and deploy again.`
		);
	}

	const isRemotionFn = await page.evaluate(() => {
		return window.getStaticCompositions;
	});
	if (isRemotionFn === undefined) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined. However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.`
		);
	}

	await page.evaluate((timeout) => {
		window.remotion_puppeteerTimeout = timeout;
	}, actualTimeout);

	if (inputProps) {
		await page.evaluate((input) => {
			window.remotion_inputProps = input;
		}, JSON.stringify(inputProps));
	}

	if (envVariables) {
		await page.evaluate((input) => {
			window.remotion_envVariables = input;
		}, JSON.stringify(envVariables));
	}

	await page.evaluate(
		(key, value) => {
			window.localStorage.setItem(key, value);
		},
		Internals.INITIAL_FRAME_LOCAL_STORAGE_KEY,
		initialFrame
	);
};
