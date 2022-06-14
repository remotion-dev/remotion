import {FfmpegExecutable} from 'remotion';
import {AddRenderCleanupFunction} from './assets/cleanup-assets';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';

export const prepareServer = async ({
	downloadDir,
	ffmpegExecutable,
	ffprobeExecutable,
	onDownload,
	onError,
	webpackConfigOrServeUrl,
	port,
	addCleanupFunction,
}: {
	webpackConfigOrServeUrl: string;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	ffmpegExecutable: FfmpegExecutable;
	ffprobeExecutable: FfmpegExecutable;
	port: number | null;
	addCleanupFunction: AddRenderCleanupFunction;
}): Promise<{
	serveUrl: string;
	closeServer: () => Promise<void>;
	offthreadPort: number;
}> => {
	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {port: offthreadPort, close: closeProxy} = await serveStatic(null, {
			downloadDir,
			onDownload,
			onError,
			ffmpegExecutable,
			ffprobeExecutable,
			port,
			addCleanupFunction,
		});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => closeProxy(),
			offthreadPort,
		});
	}

	const {port: serverPort, close} = await serveStatic(webpackConfigOrServeUrl, {
		downloadDir,
		onDownload,
		onError,
		ffmpegExecutable,
		ffprobeExecutable,
		port,
		addCleanupFunction,
	});
	return Promise.resolve({
		closeServer: () => {
			return close();
		},
		serveUrl: `http://localhost:${serverPort}`,
		offthreadPort: serverPort,
	});
};
