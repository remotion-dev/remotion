import type {BrowserStudioDependencyResolution} from './types';

export const BROWSER_STUDIO_TRANSFORMERS_PACKAGE =
	'@huggingface/transformers' as const;

const getEsmShUrl = (version: string) => {
	const url = new URL(
		`https://esm.sh/${BROWSER_STUDIO_TRANSFORMERS_PACKAGE}@${version}`,
	);
	url.searchParams.set('dev', '');
	return url.href;
};

export const getBrowserStudioTransformersUrl = ({
	localUrl,
	resolution,
}: {
	readonly localUrl: string;
	readonly resolution: BrowserStudioDependencyResolution;
}) => {
	if (typeof resolution === 'string') {
		return resolution.startsWith('http://') || resolution.startsWith('https://')
			? resolution
			: getEsmShUrl(resolution);
	}

	if (resolution?.url) {
		return resolution.url;
	}

	if (resolution?.version) {
		return getEsmShUrl(resolution.version);
	}

	return localUrl;
};
