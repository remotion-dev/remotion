import {BundlerInternals} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {Log} from '../log';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';
import {handleRoutes} from './routes';

export const startServer = async (options: {
	entry: string;
	userDefinedComponent: string;
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

	const [, config] = BundlerInternals.viteConfig({
		outDir: tmpDir,
		environment: 'development',
		remotionRoot: options.remotionRoot,
	});

	const liveEventsServer = makeLiveEventsRouter();
	const viteServer = await BundlerInternals.vite.createServer({
		...config,
		root: require.resolve('..'),
		server: {...config.server, middlewareMode: true},
		optimizeDeps: {
			include: [require.resolve('../previewEntry')],
		},
		appType: 'custom',
	});
	const server = http.createServer((request, response) => {
		new Promise<void>((resolve) => {
			viteServer.middlewares(request, response, () => {
				resolve();
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
					viteDevServer: viteServer,
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
