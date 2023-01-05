import {existsSync} from 'fs';
import path from 'path';
import type {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import type {DownloadMap} from './assets/download-map';
import type {FfmpegExecutable} from './ffmpeg-executable';
import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';
import {waitForSymbolicationToBeDone} from './wait-for-symbolication-error-to-be-done';

export const prepareServer = async ({
	ffmpegExecutable,
	ffprobeExecutable,
	onDownload,
	onError,
	browserWebpackConfigOrServeUrl,
	port,
	downloadMap,
	remotionRoot,
}: {
	browserWebpackConfigOrServeUrl: string | null;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	port: number | null;
	downloadMap: DownloadMap;
	remotionRoot: string;
}): Promise<{
	serveUrl: string | null;
	closeServer: () => Promise<unknown>;
	offthreadPort: number;
}> => {
	if (
		!browserWebpackConfigOrServeUrl ||
		isServeUrl(browserWebpackConfigOrServeUrl)
	) {
		const {port: offthreadPort, close: closeProxy} = await serveStatic(null, {
			onDownload,
			onError,
			ffmpegExecutable,
			ffprobeExecutable,
			port,
			downloadMap,
			remotionRoot,
		});

		return Promise.resolve({
			serveUrl: browserWebpackConfigOrServeUrl,
			closeServer: () => {
				return closeProxy();
			},
			offthreadPort,
		});
	}

	// Check if the path has a `index.html` file
	const indexFile = path.join(browserWebpackConfigOrServeUrl, 'index.html');
	const exists = existsSync(indexFile);
	if (!exists) {
		throw new Error(
			`Tried to serve the Webpack bundle on a HTTP server, but the file ${indexFile} does not exist. Is this a valid path to a Webpack bundle?`
		);
	}

	const {port: serverPort, close} = await serveStatic(
		browserWebpackConfigOrServeUrl,
		{
			onDownload,
			onError,
			ffmpegExecutable,
			ffprobeExecutable,
			port,
			downloadMap,
			remotionRoot,
		}
	);
	return Promise.resolve({
		closeServer: () => {
			return waitForSymbolicationToBeDone().then(() => close());
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
	});
};
