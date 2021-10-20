import type {bundle} from '@remotion/bundler';

// don't import @remotion/bundle at top so the bundler module can
// be omitted if you are using esbuild to bundle.
// eventually we could make a lambda-client that only exports browser-supported functions

// or we export it as an ECMAscript module and allow a treeshake.
export const bundleSite: typeof bundle = async (...args) => {
	const bundler = require('@remotion/bundler').bundle as typeof bundle;
	return bundler(...args);
};
