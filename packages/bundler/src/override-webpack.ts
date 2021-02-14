import {Config, WebpackOverrideFn} from 'remotion';

/**
 * Please use Config.Bundler.overrideWebpack() from now on.
 * See: https://www.remotion.dev/docs/webpack/
 * @deprecated
 */
export const overrideWebpackConfig = (fn: WebpackOverrideFn) => {
	console.warn('bundler.overrideWebpackConfig has been deprecated.');
	console.warn('Please migrate to Config.Bundler.overrideWebpack().');
	console.warn('See: https://www.remotion.dev/docs/webpack/');

	Config.Bundling.overrideWebpackConfig(fn);
};
