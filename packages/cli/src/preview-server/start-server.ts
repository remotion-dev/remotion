import type { WebpackOverrideFn} from '@remotion/bundler';
import {BundlerInternals, webpack} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {ConfigInternals} from '../config';
import {Log} from '../log';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';
import {handleRoutes} from './routes';

export const startServer = async (options: {
	entry: string;
	userDefinedComponent: string;
	webpackOverride: WebpackOverrideFn;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	port: number | null;
	maxTimelineTracks?: number;
	remotionRoot: string;
	keyboardShortcutsEnabled: boolean;
	publicDir: string;
	userPassedPublicDir: string | null;
	poll: number | null;
	hash: string;
	hashPrefix: string;
}): Promise<{
	port: number;
	liveEventsServer: LiveEventsServer;
}> => {
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const [, config] = BundlerInternals.webpackConfig({
		entry: options.entry,
		userDefinedComponent: options.userDefinedComponent,
		outDir: tmpDir,
		environment: 'development',
		webpackOverride:
			options?.webpackOverride ?? ConfigInternals.getWebpackOverrideFn(),
		envVariables: options?.getEnvVariables() ?? {},
		maxTimelineTracks: options?.maxTimelineTracks ?? 15,
		entryPoints: [
			require.resolve('./hot-middleware/client'),
			require.resolve('./error-overlay/entry-basic.js'),
		],
		remotionRoot: options.remotionRoot,
		keyboardShortcutsEnabled: options.keyboardShortcutsEnabled,
		poll: options.poll,
	});

	const compiler = webpack(config);

	const wdmMiddleware = wdm(compiler);
	const whm = webpackHotMiddleware(compiler);

	const liveEventsServer = makeLiveEventsRouter();

	const server = http.createServer((request, response) => {
		new Promise<void>((resolve) => {
			wdmMiddleware(request, response, () => {
				resolve();
			});
		})
			.then(() => {
				return new Promise<void>((resolve) => {
					whm(request, response, () => {
						resolve();
					});
				});
			})
			.then(() => {
				return handleRoutes({
					hash: options.hash,
					hashPrefix: options.hashPrefix,
					request,
					response,
					liveEventsServer,
					getCurrentInputProps: options.getCurrentInputProps,
					getEnvVariables: options.getEnvVariables,
					remotionRoot: options.remotionRoot,
					publicDir: options.publicDir,
				});
			})
			.catch((err) => {
				Log.error(`Error while calling ${request.url}`, err);
				if (!response.headersSent) {
					response.setHeader('content-type', 'application/json');
					response.writeHead(500);
				}

				if (!response.writableEnded) {
					response.end(
						JSON.stringify({
							err: (err as Error).message,
						})
					);
				}
			});
	});

	const desiredPort = options?.port ?? undefined;

	const {port, didUsePort} = await RenderInternals.getDesiredPort(
		desiredPort,
		3000,
		3100
	);

	server.listen(port);
	server.on('listening', () => didUsePort());

	return {port, liveEventsServer};
};
