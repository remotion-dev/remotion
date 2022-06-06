import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import {webpack} from '../../core/node_modules/webpack/types';

import {wdm} from './dev-middleware';
import {guessEditor} from './error-overlay/react-overlay/utils/open-in-editor';
import {getDesiredPort} from './get-port';
import {webpackHotMiddleware} from './hot-middleware';
import {webpackConfig} from './webpack-config';

export const startServerPure = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		inputProps?: object;
		envVariables?: Record<string, string>;
		port: number | null;
		maxTimelineTracks?: number;
	}
) => {
	const editorGuess = guessEditor();
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const config = webpackConfig({
		entry,
		userDefinedComponent,
		outDir: tmpDir,
		environment: 'development',
		webpackOverride:
			options?.webpackOverride ?? Internals.getWebpackOverrideFn(),
		inputProps: options?.inputProps ?? {},
		envVariables: options?.envVariables ?? {},
		maxTimelineTracks: options?.maxTimelineTracks ?? 15,
	});

	const compiler = webpack(config);

	const hash = `/static-${crypto.randomBytes(6).toString('hex')}`;

	/**
	 * TODO: Put static server
	 */

	const server = http.createServer((request, response) => {
		new Promise<void>((resolve) => {
			wdm(compiler)(request, response, () => {
				resolve();
			});
		}).then(() => {
			return new Promise<void>((resolve) => {
				webpackHotMiddleware(compiler)(request, response, () => {
					resolve();
				});
			});
		});

		// TODO: Rest of the routes
		// TODO: editor guess
	});

	const desiredPort = options?.port ?? undefined;

	const port = await getDesiredPort(desiredPort, 3000, 3100);

	server.listen(port);
	return port;
};
