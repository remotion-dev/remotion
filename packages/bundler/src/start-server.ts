// @ts-expect-error
import webpackDevMiddleware from '@jonny/webpack-dev-middleware';
import express from 'express';
import fs from 'fs';
import getPort from 'get-port';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import webpack from 'webpack';
// @ts-expect-error
import webpackHotMiddleware from 'webpack-hot-middleware';
import {isUpdateAvailableWithTimeout} from './update-available';
import {webpackConfig} from './webpack-config';

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		inputProps?: object;
		envVariables?: Record<string, string>;
		previewServerPort?: number;
	}
): Promise<number> => {
	const app = express();
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
	});
	const compiler = webpack(config);

	app.use(express.static(path.join(__dirname, '..', 'web')));
	app.use(webpackDevMiddleware(compiler));
	app.use(
		webpackHotMiddleware(compiler, {
			path: '/__webpack_hmr',
			heartbeat: 10 * 1000,
		})
	);

	app.get('/update', (req, res) => {
		isUpdateAvailableWithTimeout()
			.then((data) => {
				res.json(data);
			})
			.catch((err) => {
				res.status(500).json({
					err: err.message,
				});
			});
	});

	app.use('favicon.png', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'web', 'favicon.png'));
	});

	app.use('*', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'web', 'index.html'));
	});

	const desiredPort =
		options?.previewServerPort ?? Internals.getPreviewServerPort();

	const port = await getPort({
		port: desiredPort ?? getPort.makeRange(3000, 3100),
	});

	// If did specify a port but did not get that one, fail hard.
	if (desiredPort && desiredPort !== port) {
		throw new Error(
			`You specified port ${desiredPort} to be used for the preview server, but it is not available. Choose a different port or remove the setting to let Remotion automatically select a free port.`
		);
	}

	app.listen(port);
	return port;
};
