import express from 'express';
import fs from 'fs';
import getPort from 'get-port';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {overrideWebpackConfig} from './override-webpack';
import {isUpdateAvailable} from './update-available';
import {webpackConfig} from './webpack-config';

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
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
		isUpdateAvailable()
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

	const port = await getPort({port: getPort.makeRange(3000, 3100)});
	app.listen(port);
	return port;
};

export * from './bundler';
export {cacheExists, clearCache} from './webpack-cache';
export {overrideWebpackConfig};
