import {existsSync} from 'node:fs';
import path from 'node:path';
import {NoReactInternals} from 'remotion/no-react';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {attachDownloadListenerToEmitter} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import {cleanDownloadMap, makeDownloadMap} from './assets/download-map';
import type {SourceMapGetter} from './browser/source-map-getter';
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
	sourceMap: SourceMapGetter;
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
	Log.verbose(
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

		let remoteSourceMap: AnySourceMapConsumer | null = null;

		getSourceMapFromRemoteUrl(
			getBundleMapUrlFromServeUrl(webpackConfigOrServeUrl),
		)
			.then((s) => {
				remoteSourceMap = s;
			})
			.catch((err) => {
				Log.verbose(
					{indent, logLevel},
					'Could not fetch sourcemap for ',
					webpackConfigOrServeUrl,
					err,
				);
			});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => {
				cleanDownloadMap(downloadMap);
				remoteSourceMap?.destroy();
				remoteSourceMap = null;
				return closeProxy();
			},
			offthreadPort,
			compositor: comp,
			sourceMap: () => remoteSourceMap,
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

	let localSourceMap: AnySourceMapConsumer | null = null;

	getSourceMapFromLocalFile(
		path.join(webpackConfigOrServeUrl, NoReactInternals.bundleName),
	)
		.then((s) => {
			localSourceMap = s;
		})
		.catch((err) => {
			Log.verbose(
				{indent, logLevel},
				'Could not fetch sourcemap for ',
				webpackConfigOrServeUrl,
				err,
			);
		});

	const {
		port: serverPort,
		host,
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
			localSourceMap?.destroy();
			localSourceMap = null;
			cleanDownloadMap(downloadMap);
			if (!force) {
				await waitForSymbolicationToBeDone();
			}

			return close();
		},
		serveUrl: `http://${
			host.startsWith(':') ? `[${host}]` : host
		}:${serverPort}`,
		offthreadPort: serverPort,
		compositor,
		sourceMap: () => localSourceMap,
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
			cleanupOnDownloadNew();
			cleanupErrorNew();
			return Promise.all([newServer.closeServer(force)]);
		},
	};
};
