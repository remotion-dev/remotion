import type {Page} from './browser/BrowserPage';
import type {HTTPResponse} from './browser/HTTPResponse';

export const gotoPageOrThrow = async (
	page: Page,
	urlToVisit: string,
	actualTimeout: number,
): Promise<[HTTPResponse, null] | [null, Error]> => {
	try {
		const pageRes = await page.goto({url: urlToVisit, timeout: actualTimeout});
		if (pageRes === null) {
			return [null, new Error(`Visited "${urlToVisit}" but got no response.`)];
		}

		return [pageRes, null];
	} catch (err) {
		return [null, err as Error];
	}
};
