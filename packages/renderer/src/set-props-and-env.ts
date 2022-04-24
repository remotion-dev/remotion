import {Page} from 'puppeteer-core';
import {Internals} from 'remotion';
import {normalizeServeUrl} from './normalize-serve-url';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
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

	await page.evaluateOnNewDocument(
		(timeout: number) => {
			window.remotion_puppeteerTimeout = timeout;
		},
		[actualTimeout]
	);

	if (inputProps) {
		await page.evaluateOnNewDocument(
			(input: string) => {
				window.remotion_inputProps = input;
			},
			[JSON.stringify(inputProps)]
		);
	}

	if (envVariables) {
		await page.evaluateOnNewDocument(
			(input: string) => {
				window.remotion_envVariables = input;
			},
			[JSON.stringify(envVariables)]
		);
	}

	await page.evaluateOnNewDocument(
		(key: string, value: string) => {
			window.localStorage.setItem(key, value);
		},
		[Internals.INITIAL_FRAME_LOCAL_STORAGE_KEY, initialFrame]
	);

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

	const isRemotionFn = await puppeteerEvaluateWithCatch<
		typeof window['getStaticCompositions']
	>({
		pageFunction: () => {
			return window.getStaticCompositions;
		},
		args: [],
		frame: null,
		page,
	});
	if (isRemotionFn === undefined) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined. However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.`
		);
	}

	const siteVersion = await puppeteerEvaluateWithCatch<'2'>({
		pageFunction: () => {
			return window.siteVersion;
		},
		args: [],
		frame: null,
		page,
	});

	if (siteVersion !== '2') {
		throw new Error(
			`Incompatible site: When visiting ${urlToVisit}, a bundle was found, but one that is not compatible with this version of Remotion. The bundle format changed in versions from March 2022 onwards. To resolve this error, please bundle and deploy again.`
		);
	}
};
