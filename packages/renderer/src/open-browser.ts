import os from 'os';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
import {Browser, Internals} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-browser-executable';

const validRenderers = ['angle', 'egl', 'swiftshader'] as const;

type OpenGlRenderer = typeof validRenderers[number];

export type ChromiumOptions = {
	ignoreCertificateErrors?: boolean;
	disableWebSecurity?: boolean;
	gl?: OpenGlRenderer;
	headless?: boolean;
};

const getOpenGlRenderer = (option?: OpenGlRenderer): OpenGlRenderer => {
	const renderer = option ?? Internals.DEFAULT_OPENGL_RENDERER;
	Internals.validateOpenGlRenderer(renderer);
	return renderer;
};

export const openBrowser = async (
	browser: Browser,
	options?: {
		shouldDumpIo?: boolean;
		browserExecutable?: string | null;
		chromiumOptions?: ChromiumOptions;
	}
): Promise<puppeteer.Browser> => {
	if (browser === 'firefox' && !Internals.FEATURE_FLAG_FIREFOX_SUPPORT) {
		throw new TypeError(
			'Firefox supported is not yet turned on. Stay tuned for the future.'
		);
	}

	await ensureLocalBrowser(browser, options?.browserExecutable ?? null);

	const executablePath = await getLocalBrowserExecutable(
		browser,
		options?.browserExecutable ?? null
	);
	const browserInstance = await puppeteer.launch({
		executablePath,
		product: browser,
		dumpio: options?.shouldDumpIo ?? false,
		headless: options?.chromiumOptions?.headless ?? true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			`--use-gl=${getOpenGlRenderer(options?.chromiumOptions?.gl)}`,
			'--disable-background-media-suspend',
			process.platform === 'linux' ? '--single-process' : null,
			options?.chromiumOptions?.ignoreCertificateErrors
				? '--ignore-certificate-errors'
				: null,
			...(options?.chromiumOptions?.disableWebSecurity
				? [
						'--disable-web-security',
						'--user-data-dir=' +
							(await fs.promises.mkdtemp(
								path.join(os.tmpdir(), 'chrome-user-dir')
							)),
				  ]
				: []),
		].filter(Boolean) as string[],
	});
	return browserInstance;
};
