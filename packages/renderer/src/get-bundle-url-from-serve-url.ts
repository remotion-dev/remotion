import {Internals} from 'remotion';

export const getBundleUrlFromServeUrl = (serveUrl: string) => {
	const index = serveUrl.lastIndexOf('/');
	const url = serveUrl.substring(0, index + 1) + Internals.bundleName;
	return url;
};
