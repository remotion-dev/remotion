import type * as RspackBrowser from '@rspack/browser';

export const createBrowserDependencyPlugin = ({
	rspack,
	resolvedUrls,
	resolvedVersions,
	resolvePackage,
	external,
	development,
}: {
	rspack: typeof RspackBrowser;
	resolvedUrls: Record<string, string>;
	resolvedVersions: Record<string, string>;
	resolvePackage: ((request: string) => string | null) | null;
	external: string[];
	development: boolean;
}) => {
	const postprocess = (url: URL) => {
		if (development) {
			url.searchParams.set('dev', '');
		}

		url.searchParams.set('external', external.join(','));
	};

	return new rspack.BrowserHttpImportEsmPlugin({
		dependencyUrl: ({request}) => {
			if (
				request.startsWith('.') ||
				request.startsWith('/') ||
				request.startsWith('http://') ||
				request.startsWith('https://') ||
				request.includes('!')
			) {
				return undefined;
			}

			const packageName = request.startsWith('@')
				? request.split('/').slice(0, 2).join('/')
				: request.split('/')[0];
			const resolvedUrl =
				resolvedUrls[packageName] ?? resolvePackage?.(request);
			if (resolvedUrl) {
				return resolvedUrl;
			}

			const version =
				resolvedVersions[packageName] ??
				(packageName.startsWith('@remotion/')
					? resolvedVersions.remotion
					: null) ??
				'latest';
			const subpath = request.slice(packageName.length);
			const url = new URL(
				`${packageName}@${version}${subpath}`,
				'https://esm.sh/',
			);
			postprocess(url);
			return url.href;
		},
		dependencyVersions: resolvedVersions,
		domain: 'https://esm.sh',
		postprocess: ({url}) => postprocess(url),
	});
};
