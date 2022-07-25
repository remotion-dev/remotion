import {BundlerInternals, webpack} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
// eslint-disable-next-line no-restricted-imports
import type {WebpackOverrideFn} from 'remotion';
import {ConfigInternals} from '../config';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';
import {handleRoutes} from './routes';

export const startServer = async (
	entry: string,
	userDefinedComponent: string,
	options: {
		webpackOverride?: WebpackOverrideFn;
		getCurrentInputProps: () => object;
		envVariables?: Record<string, string>;
		port: number | null;
		maxTimelineTracks?: number;
		remotionRoot: string;
	}
): Promise<{
	port: number;
	liveEventsServer: LiveEventsServer;
}> => {
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const [, config] = BundlerInternals.webpackConfig({
		entry,
		userDefinedComponent,
		outDir: tmpDir,
		environment: 'development',
		webpackOverride:
			options?.webpackOverride ?? ConfigInternals.getWebpackOverrideFn(),
		envVariables: options?.envVariables ?? {},
		maxTimelineTracks: options?.maxTimelineTracks ?? 15,
		entryPoints: [
			require.resolve('./hot-middleware/client'),
			require.resolve('./error-overlay/entry-basic.js'),
		],
		remotionRoot: options.remotionRoot,
	});

	const compiler = webpack(config);

	const hashPrefix = '/static-';
	const hash = `${hashPrefix}${crypto.randomBytes(6).toString('hex')}`;

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
				handleRoutes({
					hash,
					hashPrefix,
					request,
					response,
					liveEventsServer,
					getCurrentInputProps: options.getCurrentInputProps,
					remotionRoot: options.remotionRoot,
				});
			})
			.catch((err) => {
				response.setHeader('content-type', 'application/json');
				response.writeHead(500);
				response.end(
					JSON.stringify({
						err: (err as Error).message,
					})
				);
			});
	});

	const desiredPort = options?.port ?? undefined;

	const port = await RenderInternals.getDesiredPort(desiredPort, 3000, 3100);

	server.listen(port);
	return {port, liveEventsServer};
};
