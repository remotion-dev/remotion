import {existsSync} from 'node:fs';
import path from 'node:path';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {attachDownloadListenerToEmitter} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {getBundleMapUrlFromServeUrl} from './get-bundle-url-from-serve-url';
import {isServeUrl} from './is-serve-url';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {serveStatic} from './serve-static';
import type {AnySourceMapConsumer} from './symbolicate-stacktrace';
import {
	getSourceMapFromLocalFile,
	getSourceMapFromRemoteUrl,
} from './symbolicate-stacktrace';
import {waitForSymbolicationToBeDone} from './wait-for-symbolication-error-to-be-done';

export type RemotionServer = {
	serveUrl: string;
	closeServer: (force: boolean) => Promise<unknown>;
	offthreadPort: number;
	compositor: Compositor;
	sourceMap: Promise<AnySourceMapConsumer | null>;
	downloadMap: DownloadMap;
};

type PrepareServerOptions = {
	webpackConfigOrServeUrl: string;
	port: number | null;
	remotionRoot: string;
	concurrency: number;
	logLevel: LogLevel;
	indent: boolean;
	offthreadVideoCacheSizeInBytes: number | null;
};

export const prepareServer = async ({
	webpackConfigOrServeUrl,
	port,
	remotionRoot,
	concurrency,
	logLevel,
	indent,
	offthreadVideoCacheSizeInBytes,
}: PrepareServerOptions): Promise<RemotionServer> => {
	const downloadMap = makeDownloadMap();
	Log.verboseAdvanced(
		{indent, logLevel},
		'Created directory for temporary files',
		downloadMap.assetDir,
	);

	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {
			port: offthreadPort,
			close: closeProxy,
			compositor: comp,
		} = await serveStatic(null, {
			port,
			downloadMap,
			remotionRoot,
			concurrency,
			logLevel,
			indent,
			offthreadVideoCacheSizeInBytes,
		});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => {
				cleanDownloadMap(downloadMap);
				return closeProxy();
			},
			offthreadPort,
			compositor: comp,
			sourceMap: getSourceMapFromRemoteUrl(
				getBundleMapUrlFromServeUrl(webpackConfigOrServeUrl),
			).catch((err) => {
				Log.verbose(
					'Could not fetch sourcemap for ',
					webpackConfigOrServeUrl,
					err,
				);
				return null;
			}),
			downloadMap,
		});
	}

	// Check if the path has a `index.html` file
	const indexFile = path.join(webpackConfigOrServeUrl, 'index.html');
	const exists = existsSync(indexFile);
	if (!exists) {
		throw new Error(
			`Tried to serve the Webpack bundle on a HTTP server, but the file ${indexFile} does not exist. Is this a valid path to a Webpack bundle?`,
		);
	}

	const sourceMap = getSourceMapFromLocalFile(
		path.join(webpackConfigOrServeUrl, Internals.bundleName),
	);

	const {
		port: serverPort,
		close,
		compositor,
	} = await serveStatic(webpackConfigOrServeUrl, {
		port,
		downloadMap,
		remotionRoot,
		concurrency,
		logLevel,
		indent,
		offthreadVideoCacheSizeInBytes,
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
		sourceMap,
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
	},
): Promise<{
	server: RemotionServer;
	cleanupServer: (force: boolean) => Promise<unknown>;
}> => {
	if (server) {
		const cleanupOnDownload = attachDownloadListenerToEmitter(
			server.downloadMap,
			onDownload,
		);

		const cleanupError = server.downloadMap.emitter.addEventListener(
			'error',
			({detail: {error}}) => {
				onError(error);
			},
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
		newServer.downloadMap,
		onDownload,
	);

	const cleanupErrorNew = newServer.downloadMap.emitter.addEventListener(
		'error',
		({detail: {error}}) => {
			onError(error);
		},
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
