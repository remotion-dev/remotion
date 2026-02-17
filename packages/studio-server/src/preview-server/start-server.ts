import type {WebpackOverrideFn} from '@remotion/bundler';
import {BundlerInternals, webpack} from '@remotion/bundler';
import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import type {
	GitSource,
	RenderDefaults,
	RenderJob,
} from '@remotion/studio-shared';
import type {IncomingMessage} from 'node:http';
import http from 'node:http';
import {detectRemotionServer} from '../detect-remotion-server';
import {handleRoutes} from '../routes';
import type {QueueMethods} from './api-types';
import {wdm} from './dev-middleware';
import {webpackHotMiddleware} from './hot-middleware';
import type {LiveEventsServer} from './live-events';
import {makeLiveEventsRouter} from './live-events';

export type StartServerResult =
	| {
			type: 'started';
			port: number;
			liveEventsServer: LiveEventsServer;
			close: () => Promise<void>;
	  }
	| {
			type: 'already-running';
			port: number;
	  };

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
	experimentalClientSideRenderingEnabled: boolean;
	publicDir: string;
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
	binariesDirectory: string | null;
	forceIPv4: boolean;
	audioLatencyHint: AudioContextLatencyCategory | null;
	enableCrossSiteIsolation: boolean;
	askAIEnabled: boolean;
	forceNew: boolean;
}): Promise<StartServerResult> => {
	const desiredPort =
		options?.port ??
		(process.env.PORT ? Number(process.env.PORT) : undefined) ??
		undefined;

	const portConfig = RenderInternals.getPortConfig(options.forceIPv4);

	const onPortUnavailable = options.forceNew
		? undefined
		: async (port: number): Promise<'continue' | 'stop'> => {
				const detection = await detectRemotionServer({
					port,
					cwd: options.remotionRoot,
					hostname: portConfig.hostsToTry[0],
				});
				return detection.type === 'match' ? 'stop' : 'continue';
			};

	const [, config] = await BundlerInternals.webpackConfig({
		entry: options.entry,
		userDefinedComponent: options.userDefinedComponent,
		outDir: null,
		environment: 'development',
		webpackOverride: options?.webpackOverride,
		maxTimelineTracks: options?.maxTimelineTracks ?? null,
		remotionRoot: options.remotionRoot,
		keyboardShortcutsEnabled: options.keyboardShortcutsEnabled,
		experimentalClientSideRenderingEnabled:
			options.experimentalClientSideRenderingEnabled,
		poll: options.poll,
		bufferStateDelayInMilliseconds: options.bufferStateDelayInMilliseconds,
		askAIEnabled: options.askAIEnabled,
	});

	const compiler = webpack(config);

	const wdmMiddleware = wdm(compiler, options.logLevel);
	const whm = webpackHotMiddleware(compiler, options.logLevel);

	const liveEventsServer = makeLiveEventsRouter(options.logLevel);

	const server = http.createServer((request, response) => {
		if (options.enableCrossSiteIsolation) {
			response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
			response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
		}

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
				return handleRoutes({
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
					binariesDirectory: options.binariesDirectory,
					audioLatencyHint: options.audioLatencyHint,
					enableCrossSiteIsolation: options.enableCrossSiteIsolation,
				});
			})
			.catch((err) => {
				RenderInternals.Log.error(
					{indent: false, logLevel: options.logLevel},
					`Error while calling ${request.url}`,
					err,
				);
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

	const maxTries = 5;

	for (let i = 0; i < maxTries; i++) {
		try {
			const {port, unlockPort, didUsePort} =
				await RenderInternals.getDesiredPort({
					desiredPort,
					from: 3000,
					to: 3100,
					hostsToTry: portConfig.hostsToTry,
					onPortUnavailable,
				});

			if (didUsePort) {
				unlockPort();
				await Promise.all([
					new Promise<void>((resolve) => {
						server.close(() => resolve());
					}),
					new Promise<void>((resolve) => {
						compiler.close(() => resolve());
					}),
				]);
				return {
					type: 'already-running' as const,
					port,
				};
			}

			const selectedPort = await new Promise<number>((resolve, reject) => {
				RenderInternals.Log.verbose(
					{indent: false, logLevel: options.logLevel},
					`Binding server to host ${portConfig.host}, port ${port}`,
				);
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
			});

			return {
				type: 'started' as const,
				port: selectedPort as number,
				liveEventsServer,
				close: async () => {
					server.closeAllConnections();
					await Promise.all([
						new Promise<void>((resolve) => {
							server.close(() => {
								resolve();
							});
						}),
						new Promise<void>((resolve) => {
							compiler.close(() => {
								resolve();
							});
						}),
					]);
				},
			};
		} catch (err) {
			if (!(err instanceof Error)) {
				throw err;
			}

			const codedError = err as Error & {code: string; port: number};

			if (codedError.code === 'EADDRINUSE') {
				RenderInternals.Log.error(
					{indent: false, logLevel: options.logLevel},
					`Port ${codedError.port} is already in use. Trying another port...`,
				);
			} else {
				throw err;
			}
		}
	}

	throw new Error(`Tried ${maxTries} times to find a free port. Giving up.`);
};
