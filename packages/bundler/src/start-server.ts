import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import webpack from 'webpack';
import {wdm} from './dev-middleware';
import {getFileSource} from './error-overlay/react-overlay/utils/get-file-source';
import {
	getDisplayNameForEditor,
	guessEditor,
	launchEditor,
} from './error-overlay/react-overlay/utils/open-in-editor';
import {SymbolicatedStackFrame} from './error-overlay/react-overlay/utils/stack-frame';
import {getDesiredPort} from './get-port';
import {webpackHotMiddleware} from './hot-middleware';
import {getProjectInfo} from './project-info';
import {indexHtml} from './static-preview';
import {isUpdateAvailableWithTimeout} from './update-available';
import {webpackConfig} from './webpack-config';

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options?: {
		webpackOverride?: WebpackOverrideFn;
		inputProps?: object;
		envVariables?: Record<string, string>;
		port: number | null;
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

	app.use(
		hash,
		express.static(path.join(process.cwd(), 'public'), {
			cacheControl: true,
			dotfiles: 'allow',
			etag: true,
			extensions: false,
			fallthrough: false,
			immutable: false,
			index: false,
			lastModified: true,
			maxAge: 0,
			redirect: true,
		})
	);
	app.use(wdm(compiler));
	app.use(webpackHotMiddleware(compiler));

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
	app.get('/api/file-source', (req, res) => {
		const {f} = req.query;
		if (typeof f !== 'string') {
			throw new Error('must pass `f` parameter');
		}

		getFileSource(decodeURIComponent(f))
			.then((data) => {
				res.write(data);
				return res.end();
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
			const body = req.body as {stack: SymbolicatedStackFrame};
			if (!('stack' in body)) {
				throw new TypeError('Need to pass stack');
			}

			const stack = body.stack as SymbolicatedStackFrame;

			const guess = await editorGuess;
			const didOpen = await launchEditor({
				colNumber: stack.originalColumnNumber as number,
				editor: guess[0],
				fileName: path.resolve(process.cwd(), stack.originalFileName as string),
				lineNumber: stack.originalLineNumber as number,
				vsCodeNewWindow: false,
			});
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
		res.end(indexHtml(hash, '/', displayName));
	});

	const desiredPort = options?.port ?? undefined;

	const port = await getDesiredPort(desiredPort, 3000, 3100);

	app.listen(port);
	return port;
};
