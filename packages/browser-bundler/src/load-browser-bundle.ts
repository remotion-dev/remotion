import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as JSXDevRuntime from 'react/jsx-dev-runtime';
import * as JSXRuntime from 'react/jsx-runtime';
import * as Remotion from 'remotion';
import * as RemotionNoReact from 'remotion/no-react';
import * as RemotionVersion from 'remotion/version';
import type {BrowserBundle} from './types.js';

/**
 * Executes a browser bundle and returns its registerRoot() component.
 * Only execute code you trust: this uses Function(), not a sandbox, and the
 * bundle has access to the page. React and Remotion are shared with the host.
 */
export const loadBrowserBundle = ({
	bundle,
}: {
	bundle: BrowserBundle;
}): React.FC => {
	let root: React.FC | null = null;
	const registerRoot = (component: React.FC) => {
		if (
			!component ||
			React.isValidElement(component) ||
			(typeof component !== 'function' &&
				(typeof component !== 'object' || !('$$typeof' in component)))
		) {
			throw new Error('registerRoot() must receive a React component.');
		}

		if (root !== null) {
			throw new Error('registerRoot() was called more than once.');
		}

		root = component;
	};

	const sharedModules = new Map<string, unknown>([
		['react', React],
		['react-dom', ReactDOM],
		['react-dom/client', ReactDOMClient],
		['react/jsx-runtime', JSXRuntime],
		['react/jsx-dev-runtime', JSXDevRuntime],
		['remotion', {...Remotion, registerRoot}],
		['remotion/no-react', RemotionNoReact],
		['remotion/version', RemotionVersion],
	]);

	try {
		// eslint-disable-next-line no-new-func
		const evaluate = new Function(
			'require',
			`${bundle.code}\n//# sourceURL=remotion-browser-bundle.js`,
		);
		evaluate((id: string) => {
			if (!sharedModules.has(id)) {
				throw new Error(
					`The browser bundle requested an unavailable shared module: "${id}".`,
				);
			}

			return sharedModules.get(id);
		});
	} catch (error) {
		throw new Error(
			`Could not evaluate the browser bundle: ${
				error instanceof Error ? error.message : String(error)
			}`,
			{cause: error},
		);
	}

	if (root === null) {
		throw new Error(
			'The browser bundle did not call registerRoot(). Use a normal Remotion project entry point.',
		);
	}

	return root;
};
