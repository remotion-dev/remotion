import type {ApiRoutes} from '@remotion/studio-shared';
import {httpGet} from '../../helpers/http-get';
import type {ApiHandler} from '../api-types';
import {ensureRemoteUrlIsAllowed} from './download-remote-asset';

export const elementLibraryFaviconHandler: ApiHandler<
	ApiRoutes['/api/element-library-favicon']['Request'],
	ApiRoutes['/api/element-library-favicon']['Response']
> = async ({input}) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 5000);
	try {
		const response = await httpGet({
			url: new URL(input.url),
			headers: {accept: 'text/html'},
			signal: controller.signal,
			maxSize: 1024 * 1024,
			tooLargeMessage: 'Element library page exceeds the size limit',
			maxRedirects: 5,
			validateUrl: ensureRemoteUrlIsAllowed,
		});
		if (response.statusCode < 200 || response.statusCode >= 300) return null;
		const html = new TextDecoder().decode(response.body);
		const headEnd = html.search(/<\/head\s*>/i);
		if (headEnd === -1) return null;
		const head =
			html
				.slice(0, headEnd)
				.match(/<(?:link|base)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)
				?.join('') ?? '';
		return {head, url: response.url.href};
	} catch {
		return null;
	} finally {
		clearTimeout(timeout);
	}
};
