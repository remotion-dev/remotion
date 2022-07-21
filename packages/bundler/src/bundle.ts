import fs from 'fs';
import os from 'os';
import path from 'path';
import type {WebpackOverrideFn} from 'remotion';
import {Internals} from 'remotion';
import {promisify} from 'util';
import webpack from 'webpack';
import {copyDir} from './copy-dir';
import {indexHtml} from './index-html';
import {webpackConfig} from './webpack-config';

const entry = require.resolve('./renderEntry');

const promisified = promisify(webpack);

const prepareOutDir = async (specified: string | null) => {
	if (specified) {
		await fs.promises.mkdir(specified, {recursive: true});
		return specified;
	}

	return fs.promises.mkdtemp(path.join(os.tmpdir(), 'react-motion-graphics'));
};

const trimLeadingSlash = (p: string): string => {
	if (p.startsWith('/')) {
		return trimLeadingSlash(p.substr(1));
	}

	return p;
};

const trimTrailingSlash = (p: string): string => {
	if (p.endsWith('/')) {
		return trimTrailingSlash(p.substr(0, p.length - 1));
	}

	return p;
};

type Options = {
	webpackOverride?: WebpackOverrideFn;
	outDir?: string;
	enableCaching?: boolean;
	publicPath?: string;
};

export const getConfig = (
	outDir: string,
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: Options
) => {
	return webpackConfig({
		entry,
		userDefinedComponent: entryPoint,
		outDir,
		environment: 'production',
		webpackOverride:
			options?.webpackOverride ?? Internals.defaultOverrideFunction,
		onProgressUpdate,
		enableCaching:
			options?.enableCaching ?? Internals.DEFAULT_WEBPACK_CACHE_ENABLED,
		maxTimelineTracks: 15,
		// For production, the variables are set dynamically
		envVariables: {},
		entryPoints: [],
	});
};

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: Options
): Promise<string> => {
	const outDir = await prepareOutDir(options?.outDir ?? null);

	const [, config] = getConfig(outDir, entryPoint, onProgressUpdate, options);

	const output = await promisified([config]);
	if (!output) {
		throw new Error('Expected webpack output');
	}

	const {errors} = output.toJson();
	if (errors !== undefined && errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}

	const baseDir = options?.publicPath ?? '/';
	const publicDir =
		'/' +
		[trimTrailingSlash(trimLeadingSlash(baseDir)), 'public']
			.filter(Boolean)
			.join('/');

	const from = path.join(process.cwd(), 'public');
	const to = path.join(outDir, 'public');
	if (fs.existsSync(from)) {
		await copyDir(from, to);
	}

	const html = indexHtml(publicDir, baseDir, null, null);
	fs.writeFileSync(path.join(outDir, 'index.html'), html);

	return outDir;
};
