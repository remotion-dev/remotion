import type {FC} from 'react';
import {createBrowserModuleScope} from './browser-module-scope';
import type {BrowserBundle} from './types.js';

/**
 * Executes a browser bundle and returns its registerRoot() component.
 * Only execute code you trust: this uses Function(), not a sandbox, and the
 * bundle has access to the page. React and Remotion are shared with the host.
 */
export const loadBrowserBundle = ({bundle}: {bundle: BrowserBundle}): FC => {
	if (bundle.fastRefresh) {
		throw new Error(
			'Use createBrowserBundleRuntime() to load a Fast Refresh bundle.',
		);
	}

	const scope = createBrowserModuleScope(null);
	scope.evaluate(bundle.code);
	return scope.getRoot();
};
