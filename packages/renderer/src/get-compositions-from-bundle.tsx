import fs from 'fs';
import path from 'path';
import type {ComponentType} from 'react';
import vm from 'vm';
import type {GetCompositionsConfig} from './get-compositions';
import {getCompositionsFromMarkup} from './get-compositions-on-server';
import {isServeUrl} from './is-serve-url';

export const getCompositionsFromBundle = (
	bundle: string,
	options: GetCompositionsConfig
) => {
	const bundleFile = path.join(bundle, 'bundle.js');

	if (isServeUrl(bundle)) {
		throw new Error('Can only use getCompositionFromBundle from a local file');
	}

	const content = fs.readFileSync(bundleFile, 'utf-8');

	const context = {
		window: {
			remotion_envVariables: options.envVariables,
		},
		clearTimeout: () => {
			console.trace(
				'clearTimeout() called inside a server-side bundle. This is not supported.'
			);
		},
		setTimeout: () => {
			console.trace(
				'setTimeout() called inside a server-side bundle. This is not supported.'
			);
		},
		process: {
			env: {
				REMOTION_SERVER_RENDERING: true,
			},
		},
		require,
	};
	vm.createContext(context);

	// TODO: Set props and env

	const code = content;
	vm.runInContext(code, context, {
		filename: bundleFile,
		breakOnSigint: true,
	});

	const script = (() => {
		return window.remotion_getRoot();
	}).toString();

	const theRoot = vm.runInContext(`(${script})();`, context);

	if (!theRoot) {
		throw new Error(
			'Did not call getRoot() in the bundle. Delaying the calling of getRoot() is not supported in server-side-rendering.'
		);
	}

	const Comp = theRoot as ComponentType;

	const comps = getCompositionsFromMarkup(Comp);

	return comps;
};
