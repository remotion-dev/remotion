import fs from 'fs';
import path from 'path';
import type {ComponentType} from 'react';
import type {TCompMetadata} from 'remotion';
import {getCompositionsFromMarkup, Internals} from 'remotion';
import vm from 'vm';
import type {GetCompositionsConfig} from './get-compositions';
import {isServeUrl} from './is-serve-url';

export const getCompositionsFromBundle = (
	bundle: string,
	options: GetCompositionsConfig
): {
	compositions: TCompMetadata[];
	root: ComponentType;
} => {
	const bundleFile = path.join(bundle, 'bundle.js');

	if (isServeUrl(bundle)) {
		throw new Error('Can only use getCompositionFromBundle from a local file');
	}

	const content = fs.readFileSync(bundleFile, 'utf-8');

	// @ts-éxpect-error
	process.env.REMOTION_SERVER_RENDERING = 'true';

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
		Buffer,
		console,
	};
	const vmContext = vm.createContext(context);

	// TODO: Set props and env

	const code = content;
	vm.runInContext(code, vmContext, {
		filename: bundleFile,
		breakOnSigint: true,
	});

	const theRoot = Internals.getRoot();

	if (!theRoot) {
		throw new Error(
			'Did not call getRoot() in the bundle. Delaying the calling of getRoot() is not supported in server-side-rendering.'
		);
	}

	const Comp = theRoot as ComponentType;
	const comps = getCompositionsFromMarkup(Comp);

	Internals.clearRoot();

	return {compositions: comps, root: Comp};
};
