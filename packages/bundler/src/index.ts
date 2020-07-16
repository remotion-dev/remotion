import express from 'express';
import webpack from 'webpack';
import os from 'os';
import fs from 'fs';
import path from 'path';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import {webpackConfig} from './webpack-config';

export const startServer = async (
	entry: string,
	userDefinedComponent: string
): Promise<void> => {
	const app = express();
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const config = webpackConfig({entry, userDefinedComponent, outDir: tmpDir});
	const compiler = webpack(config);

	app.use('/', express.static(path.join(__dirname, '..', 'web')));
	app.use(webpackDevMiddleware(compiler));
	app.use(
		webpackHotMiddleware(compiler, {
			path: '/__webpack_hmr',
			heartbeat: 10 * 1000,
		})
	);

	app.listen(3000);
	console.log('Server started');
};

export * from './bundler';
