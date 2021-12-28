// @ts-expect-error
import webpackDevMiddleware from '@jonny/webpack-dev-middleware';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import webpack from 'webpack';
// @ts-expect-error
import webpackHotMiddleware from 'webpack-hot-middleware';
import {getDesiredPort} from './get-port';
import {getProjectInfo} from './project-info';
import {isUpdateAvailableWithTimeout} from './update-available';
import {webpackConfig} from './webpack-config';
import crypto from 'crypto';
import {indexHtml} from './static-preview';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './error-overlay/react-overlay/utils/open-in-editor';
import {StackFrame} from './error-overlay/react-overlay/utils/stack-frame';

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		inputProps?: object;
		envVariables?: Record<string, string>;
		port?: number;
		maxTimelineTracks?: number;
	}
): Promise<number> => {
	const app = express();
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

	app.use(hash, express.static(path.join(process.cwd(), 'public')));
	app.use(webpackDevMiddleware(compiler));
	app.use(
		webpackHotMiddleware(compiler, {
			path: '/__webpack_hmr',
			heartbeat: 10 * 1000,
		})
	);

	app.get('/api/update', (req, res) => {
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

	app.get('/api/project-info', (req, res) => {
		getProjectInfo()
			.then((data) => {
				res.json(data);
			})
			.catch((err) => {
				res.status(500).json({
					err: err.message,
				});
			});
	});

	app.use(express.json());
	app.post('/api/open-in-editor', async (req, res) => {
		try {
			const body = req.body as {stack: StackFrame};
			if (!('stack' in body)) {
				throw new TypeError('Need to pass stack');
			}

			const stack = body.stack as StackFrame;

			const guess = await editorGuess;
			const didOpen = await launchEditor(
				path.resolve(process.cwd(), stack._originalFileName as string),
				stack._originalLineNumber as number,
				stack._originalColumnNumber as number,
				guess[0]
			);
			res.json({
				success: didOpen,
			});
		} catch (err) {
			res.json({
				success: false,
			});
		}
	});

	app.use('favicon.png', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'web', 'favicon.png'));
	});

	const edit = await editorGuess;
	const displayName = getDisplayNameForEditor(edit[0]);

	app.use('*', (_, res) => {
		res.set('content-type', 'text/html');
		res.end(indexHtml(hash, displayName));
	});

	const desiredPort = options?.port ?? Internals.getServerPort();

	const port = await getDesiredPort(desiredPort, 3000, 3100);

	app.listen(port);
	return port;
};
