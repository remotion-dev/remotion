import fs from 'fs';
import os from 'os';
import path from 'path';
import type {WebpackOverrideFn} from 'remotion';
import {promisify} from 'util';
import webpack from 'webpack';
import {isMainThread} from 'worker_threads';
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

export type BundleOptions = {
	webpackOverride?: WebpackOverrideFn;
	outDir?: string;
	enableCaching?: boolean;
	publicPath?: string;
	rootDir?: string;
	publicDir?: string;
};

export const getConfig = ({
	entryPoint,
	outDir,
	resolvedRemotionRoot,
	onProgressUpdate,
	options,
}: {
	outDir: string;
	entryPoint: string;
	resolvedRemotionRoot: string;
	onProgressUpdate?: (progress: number) => void;
	options?: BundleOptions;
}) => {
	return webpackConfig({
		entry,
		userDefinedComponent: entryPoint,
		outDir,
		environment: 'production',
		webpackOverride: options?.webpackOverride ?? ((f) => f),
		onProgressUpdate,
		enableCaching: options?.enableCaching ?? true,
		maxTimelineTracks: 15,
		// For production, the variables are set dynamically
		envVariables: {},
		entryPoints: [],
		remotionRoot: resolvedRemotionRoot,
		keyboardShortcutsEnabled: false,
	});
};

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: BundleOptions
): Promise<string> => {
	const resolvedRemotionRoot = options?.rootDir ?? process.cwd();

	const outDir = await prepareOutDir(options?.outDir ?? null);

	// The config might use an override which might use
	// `process.cwd()`. The context should always be the Remotion root.
	// This is not supported in worker threads (used for tests)
	const currentCwd = process.cwd();
	if (isMainThread) {
		process.chdir(resolvedRemotionRoot);
	}

	const [, config] = getConfig({
		outDir,
		entryPoint,
		resolvedRemotionRoot,
		onProgressUpdate,
		options,
	});

	const output = await promisified([config]);
	if (isMainThread) {
		process.chdir(currentCwd);
	}

	if (!output) {
		throw new Error('Expected webpack output');
	}

	const {errors} = output.toJson();
	if (errors !== undefined && errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}

	const baseDir = options?.publicPath ?? '/';
	const staticHash =
		'/' +
		[trimTrailingSlash(trimLeadingSlash(baseDir)), 'public']
			.filter(Boolean)
			.join('/');

	const from = options?.publicDir
		? path.resolve(resolvedRemotionRoot, options.publicDir)
		: path.join(resolvedRemotionRoot, 'public');
	const to = path.join(outDir, 'public');
	if (fs.existsSync(from)) {
		await copyDir(from, to);
	}

	const html = indexHtml({
		staticHash,
		baseDir,
		editorName: null,
		inputProps: null,
		remotionRoot: resolvedRemotionRoot,
		previewServerCommand: null,
	});
	fs.writeFileSync(path.join(outDir, 'index.html'), html);

	return outDir;
};
