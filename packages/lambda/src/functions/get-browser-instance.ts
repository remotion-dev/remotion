import type {Await} from '@remotion/lambda-client';
import type {ChromiumOptions, LogLevel, openBrowser} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {VERSION} from 'remotion/version';
import {getChromiumPath} from './helpers/get-chromium-path';

export type LaunchedBrowser = {
	instance: Await<ReturnType<typeof openBrowser>>;
	configurationString: string;
};

const makeConfigurationString = (
	options: ChromiumOptions,
	logLevel: LogLevel,
): string => {
	return [
		`web-security-${Boolean(options.disableWebSecurity)}`,
		`multi-process-${options.enableMultiProcessOnLinux ?? true}`,
		`ignore-certificate-errors-${Boolean(options.ignoreCertificateErrors)}`,
		`log-level-${logLevel}`,
		`gl-${options.gl ?? null}`,
		`userAgent-${options.userAgent ?? null}`,
		`headless-${options.headless ?? false}`,
	].join('/');
};

let _browserInstance: LaunchedBrowser | null;

let launching = false;

const waitForLaunched = () => {
	return new Promise<void>((resolve, reject) => {
		const check = () =>
			setTimeout(() => {
				if (launching) {
					check();
				} else {
					resolve();
				}
			}, 16);

		setTimeout(() => reject(new Error('Timeout launching browser')), 5000);
		check();
	});
};

export const forgetBrowserEventLoop = ({
	logLevel,
	launchedBrowser,
}: {
	logLevel: LogLevel;
	launchedBrowser: LaunchedBrowser;
}) => {
	RenderInternals.Log.info(
		{indent: false, logLevel},
		'Keeping browser open for next invocation',
	);
	launchedBrowser.instance.runner.forgetEventLoop();
	launchedBrowser.instance.runner.deleteBrowserCaches();
};

export const closeBrowserInstance = async ({
	launchedBrowser,
}: {
	launchedBrowser: LaunchedBrowser;
}) => {
	if (_browserInstance === launchedBrowser) {
		_browserInstance = null;
	}

	await launchedBrowser.instance.close({silent: true});
};

export const getBrowserInstance = async ({
	logLevel,
	indent,
	chromiumOptions,
}: {
	logLevel: LogLevel;
	indent: boolean;
	chromiumOptions: ChromiumOptions;
}): Promise<LaunchedBrowser> => {
	const actualChromiumOptions: ChromiumOptions = {
		...chromiumOptions,
		// The CLI can pass null; Lambda still needs software rendering.
		gl: chromiumOptions.gl ?? 'swangle',
		enableMultiProcessOnLinux: false,
		darkMode: chromiumOptions.darkMode ?? false,
		disableWebSecurity: chromiumOptions.disableWebSecurity ?? false,
		headless: chromiumOptions.headless ?? true,
		userAgent: chromiumOptions.userAgent ?? null,
		ignoreCertificateErrors: chromiumOptions.ignoreCertificateErrors ?? false,
	};
	const configurationString = makeConfigurationString(
		actualChromiumOptions,
		logLevel,
	);
	RenderInternals.Log.info(
		{indent: false, logLevel},
		`Rendering with Remotion v${VERSION}.`,
	);

	if (launching) {
		RenderInternals.Log.info(
			{indent: false, logLevel},
			'Already waiting for browser launch...',
		);
		await waitForLaunched();
		if (!_browserInstance) {
			throw new Error('expected to launch');
		}
	}

	if (!_browserInstance) {
		RenderInternals.Log.info(
			{indent: false, logLevel},
			'Cold function, launching new browser instance',
		);
		launching = true;

		try {
			const execPath = getChromiumPath();

			const instance = await RenderInternals.internalOpenBrowser({
				browser: 'chrome',
				browserExecutable: execPath,
				chromiumOptions: actualChromiumOptions,
				forceDeviceScaleFactor: undefined,
				indent: false,
				viewport: null,
				logLevel,
				onBrowserDownload: () => {
					throw new Error('Should not download a browser in serverless');
				},
				chromeMode: 'headless-shell',
			});
			const launchedBrowser = {
				instance,
				configurationString,
			};
			_browserInstance = launchedBrowser;
			instance.on('disconnected', () => {
				if (_browserInstance !== launchedBrowser) {
					return;
				}

				_browserInstance = null;
				RenderInternals.Log.info(
					{indent: false, logLevel},
					'Browser disconnected or crashed.',
				);
				forgetBrowserEventLoop({
					logLevel,
					launchedBrowser,
				});
				launchedBrowser.instance.close({silent: true}).catch((err) => {
					RenderInternals.Log.info(
						{indent: false, logLevel},
						'Could not close browser instance',
						err,
					);
				});
			});

			return launchedBrowser;
		} finally {
			launching = false;
		}
	}

	if (_browserInstance.configurationString !== configurationString) {
		RenderInternals.Log.info(
			{indent: false, logLevel},
			'Warm function, but Browser configuration changed. Killing old browser instance.',
		);
		_browserInstance.instance.runner.rememberEventLoop();
		await _browserInstance.instance.close({silent: true});
		_browserInstance = null;
		return getBrowserInstance({
			logLevel,
			indent,
			chromiumOptions,
		});
	}

	RenderInternals.Log.info(
		{indent: false, logLevel},
		'Warm function, reusing browser instance',
	);
	_browserInstance.instance.runner.rememberEventLoop();
	return _browserInstance;
};
