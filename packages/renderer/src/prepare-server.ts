import {existsSync} from 'node:fs';
import path from 'node:path';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {attachDownloadListenerToEmitter} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {isServeUrl} from './is-serve-url';
import {Log} from './logger';
import type {OffthreadVideoServerEmitter} from './offthread-video-server';
import {serveStatic} from './serve-static';
import type {AnySourceMapConsumer} from './symbolicate-stacktrace';
import {getSourceMapFromLocalFile} from './symbolicate-stacktrace';
import {waitForSymbolicationToBeDone} from './wait-for-symbolication-error-to-be-done';

export type RemotionServer = {
	serveUrl: string;
	closeServer: (force: boolean) => Promise<unknown>;
	offthreadPort: number;
	compositor: Compositor;
	sourceMap: AnySourceMapConsumer | null;
	events: OffthreadVideoServerEmitter;
	downloadMap: DownloadMap;
};

type PrepareServerOptions = {
	webpackConfigOrServeUrl: string;
	port: number | null;
	remotionRoot: string;
	concurrency: number;
	verbose: boolean;
	indent: boolean;
};

export const prepareServer = async ({
	webpackConfigOrServeUrl,
	port,
	remotionRoot,
	concurrency,
	verbose,
	indent,
}: PrepareServerOptions): Promise<RemotionServer> => {
	const downloadMap = makeDownloadMap();
	Log.verboseAdvanced(
		{indent, logLevel: verbose ? 'verbose' : 'info'},
		'Created directory for temporary files',
		downloadMap.assetDir
	);

	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {
			port: offthreadPort,
			close: closeProxy,
			compositor: comp,
			events,
		} = await serveStatic(null, {
			port,
			downloadMap,
			remotionRoot,
			concurrency,
			verbose,
			indent,
		});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => {
				cleanDownloadMap(downloadMap);
				return closeProxy();
			},
			offthreadPort,
			compositor: comp,
			sourceMap: null,
			events,
			downloadMap,
		});
	}

	// Check if the path has a `index.html` file
	const indexFile = path.join(webpackConfigOrServeUrl, 'index.html');
	const exists = existsSync(indexFile);
	if (!exists) {
		throw new Error(
			`Tried to serve the Webpack bundle on a HTTP server, but the file ${indexFile} does not exist. Is this a valid path to a Webpack bundle?`
		);
	}

	const sourceMap = getSourceMapFromLocalFile(
		path.join(webpackConfigOrServeUrl, Internals.bundleName)
	);

	const {
		port: serverPort,
		close,
		compositor,
		events: newEvents,
	} = await serveStatic(webpackConfigOrServeUrl, {
		port,
		downloadMap,
		remotionRoot,
		concurrency,
		verbose,
		indent,
	});

	return Promise.resolve({
		closeServer: async (force: boolean) => {
			sourceMap.then((s) => s?.destroy());
			cleanDownloadMap(downloadMap);
			if (!force) {
				await waitForSymbolicationToBeDone();
			}

			return close();
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
		compositor,
		sourceMap: await sourceMap,
		events: newEvents,
		downloadMap,
	});
};

export const makeOrReuseServer = async (
	server: RemotionServer | undefined,
	config: PrepareServerOptions,
	{
		onDownload,
		onError,
	}: {
		onError: (err: Error) => void;
		onDownload: RenderMediaOnDownload | null;
	}
): Promise<{
	server: RemotionServer;
	cleanupServer: (force: boolean) => Promise<unknown>;
}> => {
	if (server) {
		const cleanupOnDownload = attachDownloadListenerToEmitter(
			server.events,
			onDownload
		);

		const cleanupError = server.events.addEventListener(
			'error',
			({detail: {error}}) => {
				onError(error);
			}
		);

		return {
			server,
			cleanupServer: () => {
				cleanupOnDownload();
				cleanupError();
				return Promise.resolve();
			},
		};
	}

	const newServer = await prepareServer(config);

	const cleanupOnDownloadNew = attachDownloadListenerToEmitter(
		newServer.events,
		onDownload
	);

	const cleanupErrorNew = newServer.events.addEventListener(
		'error',
		({detail: {error}}) => {
			onError(error);
		}
	);

	return {
		server: newServer,
		cleanupServer: (force: boolean) => {
			newServer.closeServer(force);
			cleanupOnDownloadNew();
			cleanupErrorNew();
			return Promise.resolve();
		},
	};
};
