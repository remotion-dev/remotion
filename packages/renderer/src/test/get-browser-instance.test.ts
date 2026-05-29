import {describe, expect, test} from 'bun:test';
import {getPageAndCleanupFn} from '../get-browser-instance';

describe('getPageAndCleanupFn', () => {
	test('awaits page.close when cleanup is invoked for a passed-in browser', async () => {
		let pageClosed = false;
		const fakePage = {
			close: async () => {
				pageClosed = true;
			},
		};

		const fakeBrowser = {
			newPage: async () => fakePage,
		};

		const {cleanupPage} = await getPageAndCleanupFn({
			passedInInstance: fakeBrowser as any,
			browserExecutable: null,
			chromiumOptions: {},
			forceDeviceScaleFactor: undefined,
			indent: false,
			logLevel: 'info',
			onBrowserDownload: (() => undefined) as any,
			chromeMode: 'headless-shell',
			pageIndex: 0,
			onBrowserLog: null,
			onLog: () => undefined,
		});

		await cleanupPage();
		expect(pageClosed).toBe(true);
	});
});
