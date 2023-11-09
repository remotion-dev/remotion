import type {ChromiumOptions, LogLevel, openBrowser} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {Await} from '../../shared/await';
import {executablePath} from './get-chromium-executable-path';

type LaunchedBrowser = {
	instance: Await<ReturnType<typeof openBrowser>>;
	configurationString: string;
};

const makeConfigurationString = (
	options: ChromiumOptions,
	logLevel: LogLevel,
): string => {
	return [
		`web-security-${Boolean(options.disableWebSecurity)}`,
		`multi-process-${Boolean(options.enableMultiProcessOnLinux)}`,
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
					resolve();
				} else {
					check();
				}
			}, 16);

		setTimeout(() => reject(new Error('Timeout launching browser')), 5000);
		check();
	});
};

export const forgetBrowserEventLoop = (logLevel: LogLevel) => {
	RenderInternals.Log.infoAdvanced(
		{indent: false, logLevel},
		'Keeping browser open for next invocation',
	);
	_browserInstance?.instance.forgetEventLoop();
};

export const getBrowserInstance = async (
	logLevel: LogLevel,
	indent: boolean,
	chromiumOptions: ChromiumOptions,
): Promise<LaunchedBrowser> => {
	const actualChromiumOptions: ChromiumOptions = {
		...chromiumOptions,
		// Override the `null` value, which might come from CLI with swANGLE
		gl: chromiumOptions.gl ?? 'swangle',
	};
	const configurationString = makeConfigurationString(
		actualChromiumOptions,
		logLevel,
	);

	if (launching) {
		RenderInternals.Log.info('Already waiting for browser launch...');
		await waitForLaunched();
		if (!_browserInstance) {
			throw new Error('expected to launch');
		}
	}

	if (!_browserInstance) {
		RenderInternals.Log.info(
			'Cold Lambda function, launching new Lambda function',
		);
		launching = true;

		const execPath = executablePath();

		const instance = await RenderInternals.internalOpenBrowser({
			browser: 'chrome',
			browserExecutable: execPath,
			chromiumOptions: actualChromiumOptions,
			forceDeviceScaleFactor: undefined,
			indent: false,
			viewport: null,
			logLevel,
		});
		instance.on('disconnected', () => {
			console.log('Browser disconnected / crashed');
			_browserInstance?.instance
				?.close(true, logLevel, indent)
				.catch(() => undefined);
			_browserInstance = null;
		});
		_browserInstance = {
			instance,
			configurationString,
		};

		launching = false;
		return _browserInstance;
	}

	if (_browserInstance.configurationString !== configurationString) {
		RenderInternals.Log.info(
			'Warm Lambda function, but Browser configuration changed. Killing old browser instance.',
		);
		_browserInstance.instance.rememberEventLoop();
		await _browserInstance.instance.close(true, logLevel, indent);
		_browserInstance = null;
		return getBrowserInstance(logLevel, indent, chromiumOptions);
	}

	RenderInternals.Log.info('Warm Lambda function, reusing browser instance');
	_browserInstance.instance.rememberEventLoop();
	return _browserInstance;
};
