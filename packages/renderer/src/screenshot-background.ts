import type {Page} from './browser/BrowserPage';

const transparentBackgrounds = new WeakSet<Page>();

export const setScreenshotBackground = async (
	page: Page,
	omitBackground: boolean,
) => {
	if (transparentBackgrounds.has(page) === omitBackground) {
		return;
	}

	if (omitBackground) {
		await page._client().send('Emulation.setDefaultBackgroundColorOverride', {
			color: {r: 0, g: 0, b: 0, a: 0},
		});
		transparentBackgrounds.add(page);
	} else {
		await page._client().send('Emulation.setDefaultBackgroundColorOverride');
		transparentBackgrounds.delete(page);
	}
};
