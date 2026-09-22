import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import * as JSXDevRuntime from 'react/jsx-dev-runtime';
import * as JSXRuntime from 'react/jsx-runtime';
import * as Remotion from 'remotion';
import * as RemotionNoReact from 'remotion/no-react';
import * as RemotionVersion from 'remotion/version';

export const createBrowserModuleScope = (
	additionalModules: ReadonlyMap<string, unknown> | null,
) => {
	let root: React.FC | null = null;
	let registrations = 0;
	const registerRoot = (component: React.FC) => {
		if (
			!component ||
			React.isValidElement(component) ||
			(typeof component !== 'function' &&
				(typeof component !== 'object' || !('$$typeof' in component)))
		) {
			throw new Error('registerRoot() must receive a React component.');
		}

		if (registrations > 0) {
			throw new Error('registerRoot() was called more than once.');
		}

		registrations++;
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
		...(additionalModules ?? []),
	]);

	const resolveModule = (id: string) => {
		if (!sharedModules.has(id)) {
			throw new Error(
				`The browser bundle requested an unavailable shared module: "${id}".`,
			);
		}

		return sharedModules.get(id);
	};

	return {
		resolveModule,
		beginUpdate: () => {
			registrations = 0;
		},
		getRoot: (): React.FC => {
			if (root === null) {
				throw new Error(
					'The browser bundle did not call registerRoot(). Use a normal Remotion project entry point.',
				);
			}

			return root;
		},
		evaluate: (code: string) => {
			registrations = 0;
			try {
				// eslint-disable-next-line no-new-func
				const evaluate = new Function(
					'require',
					`${code}\n//# sourceURL=remotion-browser-bundle.js`,
				);
				evaluate(resolveModule);
			} catch (error) {
				throw new Error(
					`Could not evaluate the browser bundle: ${
						error instanceof Error ? error.message : String(error)
					}`,
					{cause: error},
				);
			}
		},
	};
};
