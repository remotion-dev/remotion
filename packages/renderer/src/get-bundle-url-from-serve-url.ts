import {Internals} from 'remotion';
import {isServeUrl} from './is-serve-url';
import path from 'path';

const map = (webpackBundleOrServeUrl: string, suffix: string) => {
	if (isServeUrl(webpackBundleOrServeUrl)) {
		const parsed = new URL(webpackBundleOrServeUrl);
		const idx = parsed.pathname.lastIndexOf('/');
		if (idx === -1) {
			return parsed.origin + '/' + suffix;
		}

		return parsed.origin + parsed.pathname.substring(0, idx + 1) + suffix;
	}

	const index = webpackBundleOrServeUrl.lastIndexOf(path.sep);
	const url = webpackBundleOrServeUrl.substring(0, index + 1) + suffix;
	return url;
};

export const getBundleUrlFromServeUrl = (serveUrl: string) => {
	return map(serveUrl, Internals.bundleName);
};

export const getBundleMapUrlFromServeUrl = (serveUrl: string) => {
	return map(serveUrl, Internals.bundleMapName);
};
