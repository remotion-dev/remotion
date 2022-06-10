import {indexHtml} from './index-html';
import {webpackConfig} from './webpack-config';
import esbuild = require('esbuild');
import webpack = require('webpack');

export const BundlerInternals = {
	esbuild,
	webpackConfig,
	indexHtml,
};

export {bundle} from './bundle';
export {webpack};
