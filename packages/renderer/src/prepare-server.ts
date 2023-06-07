import {existsSync} from 'node:fs';
import path from 'node:path';
import {Internals} from 'remotion';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {isServeUrl} from './is-serve-url';
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
};

type PrepareServerOptions = {
	webpackConfigOrServeUrl: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	port: number | null;
	downloadMap: DownloadMap;
	remotionRoot: string;
	concurrency: number;
	verbose: boolean;
	indent: boolean;
};

export const prepareServer = async ({
	onDownload,
	onError,
	webpackConfigOrServeUrl,
	port,
	downloadMap,
	remotionRoot,
	concurrency,
	verbose,
	indent,
}: PrepareServerOptions): Promise<RemotionServer> => {
	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {
			port: offthreadPort,
			close: closeProxy,
			compositor: comp,
		} = await serveStatic(null, {
			onDownload,
			onError,
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
				return closeProxy();
			},
			offthreadPort,
			compositor: comp,
			sourceMap: null,
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
	} = await serveStatic(webpackConfigOrServeUrl, {
		onDownload,
		onError,
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
			if (!force) {
				await waitForSymbolicationToBeDone();
			}

			return close();
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
		compositor,
		sourceMap: await sourceMap,
	});
};

export const makeOrReuseServer = async (
	server: RemotionServer | undefined,
	config: PrepareServerOptions
): Promise<{
	server: RemotionServer;
	cleanupServer: (force: boolean) => Promise<unknown>;
}> => {
	const onError = (err: Error) => {
		if (config.onError) {
			config.onError(err);
		}
	};

	if (server) {
		return {
			server,
			cleanupServer: () => Promise.resolve(undefined),
		};
	}

	const newServer = await prepareServer({...config, onError});
	return {
		server: newServer,
		cleanupServer: (force: boolean) => newServer.closeServer(force),
	};
};
