import {existsSync} from 'node:fs';
import path from 'node:path';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {Compositor} from './compositor/compositor';
import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';
import {waitForSymbolicationToBeDone} from './wait-for-symbolication-error-to-be-done';

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
}: {
	webpackConfigOrServeUrl: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	port: number | null;
	downloadMap: DownloadMap;
	remotionRoot: string;
	concurrency: number;
	verbose: boolean;
	indent: boolean;
}): Promise<{
	serveUrl: string;
	closeServer: (force: boolean) => Promise<unknown>;
	offthreadPort: number;
	compositor: Compositor;
}> => {
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
			if (!force) {
				await waitForSymbolicationToBeDone();
			}

			return close();
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
		compositor,
	});
};
