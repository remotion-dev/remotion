import {BundlerInternals, webpack} from '@remotion/bundler';
import {RenderInternals} from '@remotion/renderer';
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import {Internals, WebpackOverrideFn} from 'remotion';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import {handleRoutes} from './routes';

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
) => {
	const tmpDir = await fs.promises.mkdtemp(
		path.join(os.tmpdir(), 'react-motion-graphics')
	);

	const config = BundlerInternals.webpackConfig({
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

	const wdmMiddleware = wdm(compiler);
	const whm = webpackHotMiddleware(compiler);

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
				handleRoutes(hash, request, response);
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
	return port;
};
