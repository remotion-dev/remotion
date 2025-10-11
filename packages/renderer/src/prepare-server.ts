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
import {normalizeServeUrl} from './normalize-serve-url';
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
	offthreadVideoThreads: number;
	logLevel: LogLevel;
	indent: boolean;
	offthreadVideoCacheSizeInBytes: number | null;
	binariesDirectory: string | null;
	forceIPv4: boolean;
};

export const prepareServer = async ({
	webpackConfigOrServeUrl,
	port,
	remotionRoot,
	offthreadVideoThreads,
	logLevel,
	indent,
	offthreadVideoCacheSizeInBytes,
	binariesDirectory,
	forceIPv4,
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
			offthreadVideoThreads,
			logLevel,
			indent,
			offthreadVideoCacheSizeInBytes,
			binariesDirectory,
			forceIPv4,
		});

		const normalized = normalizeServeUrl(webpackConfigOrServeUrl);

		let remoteSourceMap: AnySourceMapConsumer | null = null;

		getSourceMapFromRemoteUrl(getBundleMapUrlFromServeUrl(normalized))
			.then((s) => {
				remoteSourceMap = s;
			})
			.catch((err) => {
				Log.verbose(
					{indent, logLevel},
					'Could not fetch sourcemap for ',
					normalized,
					err,
				);
			});

		return Promise.resolve({
			serveUrl: normalized,
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
		close,
		compositor,
	} = await serveStatic(webpackConfigOrServeUrl, {
		port,
		downloadMap,
		remotionRoot,
		offthreadVideoThreads,
		logLevel,
		indent,
		offthreadVideoCacheSizeInBytes,
		binariesDirectory,
		forceIPv4,
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
		// This should be kept localhost, even if the server is bound to ::1,
		// to prevent "Failed to load resource: net::ERR_FAILED  Access to image at 'http://localhost:3000/proxy?src=http%3A%2F%2F%5B%3A%3A%5D%3A3000%2Fpublic%2Fframer.webm&time=0&transparent=false' from origin 'http://[::]:3000' has been blocked by CORS policy: The request client is not a secure context and the resource is in more-private address space `local`".
		serveUrl: `http://localhost:${serverPort}`,
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
	}: {
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

		return {
			server,
			cleanupServer: () => {
				cleanupOnDownload();
				return Promise.resolve();
			},
		};
	}

	const newServer = await prepareServer(config);

	const cleanupOnDownloadNew = attachDownloadListenerToEmitter(
		newServer.downloadMap,
		onDownload,
	);

	return {
		server: newServer,
		cleanupServer: (force: boolean) => {
			cleanupOnDownloadNew();
			return Promise.all([newServer.closeServer(force)]);
		},
	};
};
