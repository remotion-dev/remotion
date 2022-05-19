import fs from 'fs';
import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer-core';
import {Browser, Internals} from 'remotion';
import {
	ensureLocalBrowser,
	getLocalBrowserExecutable,
} from './get-local-browser-executable';

const validRenderers = ['swangle', 'angle', 'egl', 'swiftshader'] as const;

type OpenGlRenderer = typeof validRenderers[number];

export type ChromiumOptions = {
	ignoreCertificateErrors?: boolean;
	disableWebSecurity?: boolean;
	gl?: OpenGlRenderer | null;
	headless?: boolean;
};

const getOpenGlRenderer = (option?: OpenGlRenderer | null): string[] => {
	const renderer = option ?? Internals.DEFAULT_OPENGL_RENDERER;
	Internals.validateOpenGlRenderer(renderer);
	if (renderer === 'swangle') {
		return [`--use-gl=angle`, `--use-angle=swiftshader`];
	}

	if (renderer === null) {
		return [];
	}

	return [`--use-gl=${renderer}`];
};

const browserInstances: puppeteer.Browser[] = [];

export const killAllBrowsers = async () => {
	for (const browser of browserInstances) {
		try {
			await browser.close();
		} catch (err) {}
	}
};

export const openBrowser = async (
	browser: Browser,
	options?: {
		shouldDumpIo?: boolean;
		browserExecutable?: string | null;
		chromiumOptions?: ChromiumOptions;
		forceDeviceScaleFactor?: number;
	}
): Promise<puppeteer.Browser> => {
	if (browser === 'firefox' && !Internals.FEATURE_FLAG_FIREFOX_SUPPORT) {
		throw new TypeError(
			'Firefox supported is not yet turned on. Stay tuned for the future.'
		);
	}

	await ensureLocalBrowser(browser, options?.browserExecutable ?? null);

	const executablePath = getLocalBrowserExecutable(
		browser,
		options?.browserExecutable ?? null
	);

	const customGlRenderer = getOpenGlRenderer(
		options?.chromiumOptions?.gl ?? null
	);

	const browserInstance = await puppeteer.launch({
		executablePath,
		product: browser,
		dumpio: options?.shouldDumpIo ?? false,
		ignoreDefaultArgs: true,
		args: [
			'about:blank',
			'--allow-pre-commit-input', // TODO(crbug.com/1320996): neither headful nor headless should rely on this flag.
			'--disable-background-networking',
			'--enable-features=NetworkService,NetworkServiceInProcess',
			'--disable-background-timer-throttling',
			'--disable-backgrounding-occluded-windows',
			'--disable-breakpad',
			'--disable-client-side-phishing-detection',
			'--disable-component-extensions-with-background-pages',
			'--disable-default-apps',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--no-proxy-server',
			"--proxy-server='direct://'",
			'--proxy-bypass-list=*',
			// TODO: remove AvoidUnnecessaryBeforeUnloadCheckSync below
			// once crbug.com/1324138 is fixed and released.
			'--disable-features=Translate,BackForwardCache,AvoidUnnecessaryBeforeUnloadCheckSync',
			'--disable-hang-monitor',
			'--disable-ipc-flooding-protection',
			'--disable-popup-blocking',
			'--disable-prompt-on-repost',
			'--disable-renderer-backgrounding',
			'--disable-sync',
			'--force-color-profile=srgb',
			'--metrics-recording-only',
			'--no-first-run',
			'--video-threads=16',
			'--enable-automation',
			'--password-store=basic',
			'--use-mock-keychain',
			// TODO(sadym): remove '--enable-blink-features=IdleDetection'
			// once IdleDetection is turned on by default.
			'--enable-blink-features=IdleDetection',
			'--export-tagged-pdf',
			'--intensive-wake-up-throttling-policy=0',
			options?.chromiumOptions?.headless ?? true ? '--headless' : null,
			'--no-sandbox',
			'--disable-setuid-sandbox',
			...customGlRenderer,
			'--disable-background-media-suspend',
			process.platform === 'linux' ? '--single-process' : null,
			'--allow-running-insecure-content', // https://source.chromium.org/search?q=lang:cpp+symbol:kAllowRunningInsecureContent&ss=chromium
			'--disable-component-update', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableComponentUpdate&ss=chromium
			'--disable-domain-reliability', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableDomainReliability&ss=chromium
			'--disable-features=AudioServiceOutOfProcess,IsolateOrigins,site-per-process', // https://source.chromium.org/search?q=file:content_features.cc&ss=chromium
			'--disable-print-preview', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisablePrintPreview&ss=chromium
			'--disable-site-isolation-trials', // https://source.chromium.org/search?q=lang:cpp+symbol:kDisableSiteIsolation&ss=chromium
			'--disk-cache-size=268435456', // https://source.chromium.org/search?q=lang:cpp+symbol:kDiskCacheSize&ss=chromium
			'--hide-scrollbars', // https://source.chromium.org/search?q=lang:cpp+symbol:kHideScrollbars&ss=chromium
			'--no-default-browser-check', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoDefaultBrowserCheck&ss=chromium
			'--no-pings', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoPings&ss=chromium
			'--no-zygote', // https://source.chromium.org/search?q=lang:cpp+symbol:kNoZygote&ss=chromium,
			options?.forceDeviceScaleFactor
				? `--force-device-scale-factor=${options.forceDeviceScaleFactor}`
				: null,
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
	const pages = await browserInstance.pages();
	pages.forEach((p) => p.close());
	browserInstances.push(browserInstance);
	return browserInstance;
};
