import {VERSION} from 'remotion/version';
import type {Page} from './browser/BrowserPage';
import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {normalizeServeUrl} from './normalize-serve-url';
import {puppeteerEvaluateWithCatch} from './puppeteer-evaluate';
import {redirectStatusCodes} from './redirect-status-codes';
import {validatePuppeteerTimeout} from './validate-puppeteer-timeout';

type SetPropsAndEnv = {
	serializedInputPropsWithCustomSchema: string;
	envVariables: Record<string, string> | undefined;
	page: Page;
	serveUrl: string;
	initialFrame: number;
	timeoutInMilliseconds: number | undefined;
	proxyPort: number;
	retriesRemaining: number;
	audioEnabled: boolean;
	videoEnabled: boolean;
	indent: boolean;
	logLevel: LogLevel;
};

const innerSetPropsAndEnv = async ({
	serializedInputPropsWithCustomSchema,
	envVariables,
	page,
	serveUrl,
	initialFrame,
	timeoutInMilliseconds,
	proxyPort,
	retriesRemaining,
	audioEnabled,
	videoEnabled,
	indent,
	logLevel,
}: SetPropsAndEnv): Promise<void> => {
	validatePuppeteerTimeout(timeoutInMilliseconds);
	const actualTimeout = timeoutInMilliseconds ?? DEFAULT_TIMEOUT;
	page.setDefaultTimeout(actualTimeout);
	page.setDefaultNavigationTimeout(actualTimeout);

	const urlToVisit = normalizeServeUrl(serveUrl);

	await page.evaluateOnNewDocument((timeout: number) => {
		window.remotion_puppeteerTimeout = timeout;
	}, actualTimeout);

	await page.evaluateOnNewDocument((input: string) => {
		window.remotion_inputProps = input;
	}, serializedInputPropsWithCustomSchema);

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

	const pageRes = await page.goto({url: urlToVisit, timeout: actualTimeout});

	if (pageRes === null) {
		throw new Error(`Visited "${urlToVisit}" but got no response.`);
	}

	const status = pageRes.status();

	const retry = async () => {
		await new Promise<void>((resolve) => {
			setTimeout(() => {
				resolve();
			}, 2000);
		});

		return innerSetPropsAndEnv({
			envVariables,
			initialFrame,
			serializedInputPropsWithCustomSchema,
			page,
			proxyPort,
			retriesRemaining: retriesRemaining - 1,
			serveUrl,
			timeoutInMilliseconds,
			audioEnabled,
			videoEnabled,
			indent,
			logLevel,
		});
	};

	// S3 in rare occasions returns a 500 or 503 error code for GET operations.
	// Usually it is fixed by retrying.
	if (status >= 500 && status <= 504 && retriesRemaining > 0) {
		return retry();
	}

	if (!redirectStatusCodes.every((code) => code !== status)) {
		throw new Error(
			`Error while getting compositions: Tried to go to ${urlToVisit} but the status code was ${status} instead of 200. Does the site you specified exist?`,
		);
	}

	const {value: isRemotionFn} = await puppeteerEvaluateWithCatch<
		(typeof window)['getStaticCompositions']
	>({
		pageFunction: () => {
			return window.getStaticCompositions;
		},
		args: [],
		frame: null,
		page,
		timeoutInMilliseconds: actualTimeout,
	});

	if (typeof isRemotionFn === 'undefined') {
		const {value: body} = await puppeteerEvaluateWithCatch<
			typeof document.body.innerHTML
		>({
			pageFunction: () => {
				return document.body.innerHTML;
			},
			args: [],
			frame: null,
			page,
			timeoutInMilliseconds: actualTimeout,
		});

		// AWS shakyness
		if (body.includes('We encountered an internal error.')) {
			return retry();
		}

		const errorMessage = [
			`Error while getting compositions: Tried to go to ${urlToVisit} and verify that it is a Remotion project by checking if window.getStaticCompositions is defined.`,
			'However, the function was undefined, which indicates that this is not a valid Remotion project. Please check the URL you passed.',
			'The page loaded contained the following markup:',
			body.substring(0, 500) + (body.length > 500 ? '...' : ''),
			'Does this look like a foreign page? If so, try to stop this server.',
		].join('\n');

		throw new Error(errorMessage);
	}

	const {value: siteVersion} = await puppeteerEvaluateWithCatch<
		typeof window.siteVersion
	>({
		pageFunction: () => {
			return window.siteVersion;
		},
		args: [],
		frame: null,
		page,
		timeoutInMilliseconds: actualTimeout,
	});

	const {value: remotionVersion} = await puppeteerEvaluateWithCatch<string>({
		pageFunction: () => {
			return window.remotion_version;
		},
		args: [],
		frame: null,
		page,
		timeoutInMilliseconds: actualTimeout,
	});

	const requiredVersion: typeof window.siteVersion = '10';

	if (siteVersion !== requiredVersion) {
		throw new Error(
			[
				`Incompatible site: When visiting ${urlToVisit}, a bundle was found, but one that is not compatible with this version of Remotion. Found version: ${siteVersion} - Required version: ${requiredVersion}. To resolve this error:`,
				'When using server-side rendering:',
				` ▸ Use 'bundle()' with '@remotion/bundler' of version ${VERSION} to create a compatible bundle.`,
				'When using the Remotion Lambda:',
				' ▸ Use `npx remotion lambda sites create` to redeploy the site with the latest version.',
				' ℹ Use --site-name with the same name as before to overwrite your site.',
				' ▸ Use `deploySite()` if you are using the Node.JS APIs.',
			].join('\n'),
		);
	}

	if (remotionVersion !== VERSION && process.env.NODE_ENV !== 'test') {
		if (remotionVersion) {
			Log.warn(
				{
					indent,
					logLevel,
				},
				[
					`The site was bundled with version ${remotionVersion} of @remotion/bundler, while @remotion/renderer is on version ${VERSION}. You may not have the newest bugfixes and features.`,
					`To resolve this warning:`,
					'▸ Use `npx remotion lambda sites create` to redeploy the site with the latest version.',
					'  ℹ Use --site-name with the same name as before to overwrite your site.',
					'▸ Use `deploySite()` if you are using the Node.JS APIs.',
				].join('\n'),
			);
		} else {
			Log.warn(
				{
					indent,
					logLevel,
				},
				`The site was bundled with an old version of Remotion, while @remotion/renderer is on version ${VERSION}. You may not have the newest bugfixes and features. Re-bundle the site to fix this issue.`,
			);
		}
	}
};

export const setPropsAndEnv = async (params: SetPropsAndEnv) => {
	let timeout: NodeJS.Timeout | null = null;

	try {
		const result = await Promise.race([
			innerSetPropsAndEnv(params),
			new Promise((_, reject) => {
				timeout = setTimeout(() => {
					reject(
						new Error(
							`Timed out after ${params.timeoutInMilliseconds} while setting up the headless browser. This could be because the you specified takes a long time to load (or network resources that it includes like fonts) or because the browser is not responding. Optimize the site or increase the browser timeout.`,
						),
					);
				}, params.timeoutInMilliseconds);
			}),
		]);

		return result;
	} finally {
		if (timeout !== null) {
			clearTimeout(timeout);
		}
	}
};
