import {callApi} from '../components/call-api';

const faviconRequests = new Map<string, Promise<string[]>>();

export const getElementLibraryFavicons = ({
	url,
	canFetchHead,
}: {
	url: string;
	canFetchHead: boolean;
}): Promise<string[]> => {
	const parsedUrl = new URL(url);
	const {hostname, origin} = parsedUrl;
	const isLocal =
		!hostname.includes('.') ||
		['.localhost', '.local', '.internal', '.test'].some((suffix) =>
			hostname.endsWith(suffix),
		) ||
		/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
		hostname.startsWith('[');
	const key = `${canFetchHead}:${origin}`;
	const cached = faviconRequests.get(key);
	if (cached) return cached;

	const request = (async () => {
		const page =
			canFetchHead && !isLocal
				? await callApi('/api/element-library-favicon', {url}).catch(() => null)
				: null;
		const icons: {url: string; priority: number}[] = [];
		if (page) {
			const doc = new DOMParser().parseFromString(page.head, 'text/html');
			const baseHref = doc.querySelector('base[href]')?.getAttribute('href');
			let baseUrl = page.url;
			if (baseHref) {
				try {
					baseUrl = new URL(baseHref, page.url).href;
				} catch {
					baseUrl = page.url;
				}
			}

			for (const link of doc.querySelectorAll('link[rel][href]')) {
				const rel = link.getAttribute('rel')?.toLowerCase().split(/\s+/) ?? [];
				if (!rel.includes('icon') && !rel.includes('apple-touch-icon'))
					continue;
				try {
					const icon = new URL(link.getAttribute('href') as string, baseUrl);
					if (icon.protocol !== 'http:' && icon.protocol !== 'https:') continue;
					const isSvg =
						link.getAttribute('type') === 'image/svg+xml' ||
						icon.pathname.endsWith('.svg');
					icons.push({
						url: icon.href,
						priority: rel.includes('icon') ? (isSvg ? 0 : 1) : 2,
					});
				} catch {
					continue;
				}
			}
		}

		return [
			...new Set([
				...icons
					.sort((a, b) => a.priority - b.priority)
					.map((icon) => icon.url),
				new URL('/favicon.ico', page?.url ?? parsedUrl).href,
			]),
		];
	})();
	faviconRequests.set(key, request);
	return request;
};
