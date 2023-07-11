import {Internals} from 'remotion';

export const getBundleUrlFromServeUrl = (serveUrl: string) => {
	const index = serveUrl.lastIndexOf('/');
	const url = serveUrl.substring(0, index + 1) + Internals.bundleName;
	return url;
};

export const getBundleMapUrlFromServeUrl = (serveUrl: string) => {
	const index = serveUrl.lastIndexOf('/');
	const url = serveUrl.substring(0, index + 1) + Internals.bundleMapName;
	return url;
};
