import type {WebpackOverrideFn} from '@remotion/bundler';
import {BundlerInternals, webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	GitSource,
	RenderDefaults,
	RenderJob,
} from '@remotion/studio-shared';
import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';
import type {IncomingMessage} from 'node:http';
import http from 'node:http';
import {handleRoutes} from '../routes';
import type {QueueMethods} from './api-types';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';

export const startServer = async (options: {
	entry: string;
	userDefinedComponent: string;
	webpackOverride: WebpackOverrideFn;
	getCurrentInputProps: () => object;
	getEnvVariables: () => Record<string, string>;
	port: number | null;
	maxTimelineTracks: number | null;
	bufferStateDelayInMilliseconds: number | null;
	remotionRoot: string;
	keyboardShortcutsEnabled: boolean;
	publicDir: string;
	userPassedPublicDir: string | null;
	poll: number | null;
	staticHash: string;
	staticHashPrefix: string;
	outputHash: string;
	outputHashPrefix: string;
	logLevel: LogLevel;
	getRenderQueue: () => RenderJob[];
	getRenderDefaults: () => RenderDefaults;
	numberOfAudioTags: number;
	queueMethods: QueueMethods;
	gitSource: GitSource | null;
}): Promise<{
	port: number;
	liveEventsServer: LiveEventsServer;
}> => {
	const [, config] = BundlerInternals.webpackConfig({
		entry: options.entry,
		userDefinedComponent: options.userDefinedComponent,
		outDir: null,
		environment: 'development',
		webpackOverride: options?.webpackOverride,
		maxTimelineTracks: options?.maxTimelineTracks ?? DEFAULT_TIMELINE_TRACKS,
		remotionRoot: options.remotionRoot,
		keyboardShortcutsEnabled: options.keyboardShortcutsEnabled,
		poll: options.poll,
		bufferStateDelayInMilliseconds: options.bufferStateDelayInMilliseconds,
	});

	const compiler = webpack(config);

	const wdmMiddleware = wdm(compiler);
	const whm = webpackHotMiddleware(compiler);

	const liveEventsServer = makeLiveEventsRouter();

	const server = http.createServer((request, response) => {
		new Promise<void>((resolve) => {
			wdmMiddleware(request as IncomingMessage, response, () => {
				resolve();
			});
		})
			.then(() => {
				return new Promise<void>((resolve) => {
					whm(request as IncomingMessage, response, () => {
						resolve();
					});
				});
			})
			.then(() => {
				handleRoutes({
					staticHash: options.staticHash,
					staticHashPrefix: options.staticHashPrefix,
					outputHash: options.outputHash,
					outputHashPrefix: options.outputHashPrefix,
					request: request as IncomingMessage,
					response,
					liveEventsServer,
					getCurrentInputProps: options.getCurrentInputProps,
					getEnvVariables: options.getEnvVariables,
					remotionRoot: options.remotionRoot,
					entryPoint: options.userDefinedComponent,
					publicDir: options.publicDir,
					logLevel: options.logLevel,
					getRenderQueue: options.getRenderQueue,
					getRenderDefaults: options.getRenderDefaults,
					numberOfAudioTags: options.numberOfAudioTags,
					queueMethods: options.queueMethods,
					gitSource: options.gitSource,
				});
			})
			.catch((err) => {
				RenderInternals.Log.error(`Error while calling ${request.url}`, err);
				if (!response.headersSent) {
					response.setHeader('content-type', 'application/json');
					response.writeHead(500);
				}

				if (!response.writableEnded) {
					response.end(
						JSON.stringify({
							err: (err as Error).message,
						}),
					);
				}
			});
	});

	const desiredPort =
		options?.port ??
		(process.env.PORT ? Number(process.env.PORT) : undefined) ??
		undefined;

	const maxTries = 5;

	const portConfig = RenderInternals.getPortConfig();

	for (let i = 0; i < maxTries; i++) {
		try {
			const selectedPort = await new Promise<number>((resolve, reject) => {
				RenderInternals.getDesiredPort({
					desiredPort,
					from: 3000,
					to: 3100,
					hostsToTry: portConfig.hostsToTry,
				})
					.then(({port, unlockPort}) => {
						server.listen({
							port,
							host: portConfig.host,
						});
						server.on('listening', () => {
							resolve(port);
							return unlockPort();
						});
						server.on('error', (err) => {
							reject(err);
						});
					})
					.catch((err) => reject(err));
			});
			return {port: selectedPort as number, liveEventsServer};
		} catch (err) {
			if (!(err instanceof Error)) {
				throw err;
			}

			const codedError = err as Error & {code: string; port: number};

			if (codedError.code === 'EADDRINUSE') {
				RenderInternals.Log.error(
					`Port ${codedError.port} is already in use. Trying another port...`,
				);
			} else {
				throw err;
			}
		}
	}

	throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};
