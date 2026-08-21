import ReactRefreshRuntime from 'react-refresh/runtime';

ReactRefreshRuntime.injectIntoGlobalHook(globalThis);

const projectBundleUrl = new URL(import.meta.url).searchParams.get(
	'projectBundleUrl',
);
if (!projectBundleUrl) {
	throw new Error('Browser Studio project bundle URL was not provided');
}

import('./browser-studio-vendor-runtime').then(
	({initializeBrowserStudioVendor}) =>
		initializeBrowserStudioVendor(projectBundleUrl),
);
