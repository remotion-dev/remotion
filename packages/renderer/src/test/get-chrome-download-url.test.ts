import {expect, test} from 'bun:test';
import {getExpectedVersion} from '../browser/BrowserFetcher';
import {
	getChromeDownloadUrl,
	TESTED_VERSION,
} from '../browser/get-chrome-download-url';

test('downloads the Remotion Chromium fork by default on Apple Silicon', () => {
	expect(
		getChromeDownloadUrl({
			platform: 'mac-arm64',
			version: null,
			chromeMode: 'headless-shell',
		}),
	).toBe(
		`https://remotion.media/chromium-headless-shell-mac-arm64-${TESTED_VERSION}.zip?clear`,
	);
});

test('keeps explicit Apple Silicon Chromium versions on the official CDN', () => {
	expect(
		getChromeDownloadUrl({
			platform: 'mac-arm64',
			version: '148.0.0.0',
			chromeMode: 'headless-shell',
		}),
	).toBe(
		'https://storage.googleapis.com/chrome-for-testing-public/148.0.0.0/mac-arm64/chrome-headless-shell-mac-arm64.zip',
	);
});

test('keeps Chrome for Testing on the official CDN', () => {
	expect(
		getChromeDownloadUrl({
			platform: 'mac-arm64',
			version: null,
			chromeMode: 'chrome-for-testing',
		}),
	).toBe(
		`https://storage.googleapis.com/chrome-for-testing-public/${TESTED_VERSION}/mac-arm64/chrome-mac-arm64.zip`,
	);
});

test('uses a distinct cache marker for the Remotion Apple Silicon build', () => {
	expect(
		getExpectedVersion({
			platform: 'mac-arm64',
			version: null,
			chromeMode: 'headless-shell',
		}),
	).toBe(`${TESTED_VERSION}-remotion-v2`);
	expect(
		getExpectedVersion({
			platform: 'mac-arm64',
			version: TESTED_VERSION,
			chromeMode: 'headless-shell',
		}),
	).toBe(TESTED_VERSION);
	expect(
		getExpectedVersion({
			platform: 'linux64',
			version: null,
			chromeMode: 'headless-shell',
		}),
	).toBe(TESTED_VERSION);
});
