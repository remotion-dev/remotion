import {VERSION} from 'remotion/version';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {normalizeServeUrl} from './normalize-serve-url';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {redirectStatusCodes} from './redirect-status-codes';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

type SetPropsAndEnv = {
	inputProps: Record<string, unknown>;
	envVariables: Record<string, string> | undefined;
	page: Page;
	serveUrl: string;
	initialFrame: number;
	timeoutInMilliseconds: number | undefined;
	proxyPort: number;
	retriesRemaining: number;
	audioEnabled: boolean;
	videoEnabled: boolean;
};

const innerSetPropsAndEnv = async ({
	inputProps,
	envVariables,
	page,
	serveUrl,
	initialFrame,
	timeoutInMilliseconds,
	proxyPort,
	retriesRemaining,
	audioEnabled,
	videoEnabled,
}: SetPropsAndEnv): Promise<void> => {
	validatePuppeteerTimeout(timeoutInMilliseconds);
	const actualTimeout = timeoutInMilliseconds ?? DEFAULT_TIMEOUT;
	page.setDefaultTimeout(actualTimeout);
	page.setDefaultNavigationTimeout(actualTimeout);

	const urlToVisit = normalizeServeUrl(serveUrl);

	await page.evaluateOnNewDocument((timeout: number) => {
		window.remotion_puppeteerTimeout = timeout;
	}, actualTimeout);

	if (typeof inputProps === 'string') {
		throw new Error('Input props should be an object, not a string.');
	}

	if (inputProps) {
		await page.evaluateOnNewDocument((input: string) => {
			window.remotion_inputProps = input;
		}, JSON.stringify(inputProps));
	}

	if (envVariables) {
		await page.evaluateOnNewDocument((input: string) => {
			window.remotion_envVariables = input;
		}, JSON.stringify(envVariables));
	}

	await page.evaluateOnNewDocument((key: number) => {
		window.remotion_initialFrame = key;
	}, initialFrame);

	await page.evaluateOnNewDocument((port: number) => {
		window.remotion_proxyPort = port;
	}, proxyPort);

	await page.evaluateOnNewDocument((enabled: boolean) => {
		window.remotion_audioEnabled = enabled;
	}, audioEnabled);

	await page.evaluateOnNewDocument((enabled: boolean) => {
		window.remotion_videoEnabled = enabled;
	}, videoEnabled);

	const pageRes = await page.goto(urlToVisit);

	if (pageRes === null) {
		throw new Error(`Visited "${urlToVisit}" but got no response.`);
	}

	const status = pageRes.status();

	// S3 in rare occasions returns a 500 or 503 error code for GET operations.
	// Usually it is fixed by retrying.
	if (status >= 500 && status <= 504 && retriesRemaining > 0) {
		await new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 2000);
		});

		return innerSetPropsAndEnv({
			envVariables,
			initialFrame,
			inputProps,
			page,
			proxyPort,
			retriesRemaining: retriesRemaining - 1,
			serveUrl,
			timeoutInMilliseconds,
			audioEnabled,
			videoEnabled,
		});
	}

	if (!redirectStatusCodes.every((code) => code !== status)) {
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

	const siteVersion = await puppeteerEvaluateWithCatch<
		typeof window.siteVersion
	>({
		pageFunction: () => {
			return window.siteVersion;
		},
		args: [],
		frame: null,
		page,
	});

	const remotionVersion = await puppeteerEvaluateWithCatch<string>({
		pageFunction: () => {
			return window.remotion_version;
		},
		args: [],
		frame: null,
		page,
	});

	const requiredVersion: typeof window.siteVersion = '5';

	if (siteVersion !== requiredVersion) {
		throw new Error(
			`Incompatible site: When visiting ${urlToVisit}, a bundle was found, but one that is not compatible with this version of Remotion. Found version: ${siteVersion} - Required version: ${requiredVersion}. To resolve this error, please bundle and deploy again.`
		);
	}

	if (remotionVersion !== VERSION && process.env.NODE_ENV !== 'test') {
		if (remotionVersion) {
			console.warn(
				`The site was bundled with version ${remotionVersion} of @remotion/bundler, while @remotion/renderer is on version ${VERSION}. You may not have the newest bugfixes and features. Re-bundle the site to fix this issue.`
			);
		} else {
			console.warn(
				`The site was bundled with an old version of Remotion, while @remotion/renderer is on version ${VERSION}. You may not have the newest bugfixes and features. Re-bundle the site to fix this issue.`
			);
		}
	}
};

export const setPropsAndEnv = (params: SetPropsAndEnv) => {
	return Promise.race([
		innerSetPropsAndEnv(params),
		new Promise((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						'Timed out while setting up the headless browser - the browser seems to not respond. This error is thrown to trigger a retry.'
					)
				);
			}, 10000);
		}),
	]);
};
