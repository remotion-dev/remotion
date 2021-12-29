import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import {promisify} from 'util';
import webpack from 'webpack';
import {copyDir} from './copy-dir';
import {indexHtml} from './static-preview';
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

export const bundle = async (
	entryPoint: string,
	onProgressUpdate?: (progress: number) => void,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		outDir?: string;
		enableCaching?: boolean;
		publicPath?: string;
	}
): Promise<string> => {
	const outDir = await prepareOutDir(options?.outDir ?? null);
	const output = await promisified([
		webpackConfig({
			entry,
			userDefinedComponent: entryPoint,
			outDir,
			environment: 'production',
			webpackOverride:
				options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
			onProgressUpdate,
			enableCaching: options?.enableCaching ?? Internals.getWebpackCaching(),
			maxTimelineTracks: 15,
		}),
	]);
	if (!output) {
		throw new Error('Expected webpack output');
	}

	const {errors} = output.toJson();
	if (errors !== undefined && errors.length > 0) {
		throw new Error(errors[0].message + '\n' + errors[0].details);
	}

	const baseDir = options?.publicPath ?? '/';
	const publicDir =
		'/' + [trimLeadingSlash(baseDir), 'public'].filter(Boolean).join('/');

	const from = path.join(process.cwd(), 'public');
	const to = path.join(outDir, 'public');
	if (fs.existsSync(from)) {
		await copyDir(from, to);
	}

	const html = indexHtml(publicDir, baseDir, null);
	fs.writeFileSync(path.join(outDir, 'index.html'), html);

	return outDir;
};
