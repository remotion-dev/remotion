import fs from 'fs';
import path from 'path';
import vm from 'vm';
import {isServeUrl} from './is-serve-url';

export const getCompositionsFromBundle = (bundle: string) => {
	if (isServeUrl(bundle)) {
		throw new Error('Can only use getCompositionFromBundle from a local file');
	}

	const content = fs.readFileSync(path.join(bundle, 'bundle.js'), 'utf-8');

	const context = {};
	vm.createContext(context);

	// TODO: Set props and env

	const code = content;
	vm.runInContext(code, context);

	vm.runInContext(
		(() => {
			window.setBundleMode({
				type: 'evaluation',
			});
		}).toString(),
		context
	);
};
