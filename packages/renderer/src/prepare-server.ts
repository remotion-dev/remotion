import {FfmpegExecutable} from 'remotion';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';

export const prepareServer = async ({
	downloadDir,
	ffmpegExecutable,
	onDownload,
	onError,
	webpackConfigOrServeUrl,
}: {
	webpackConfigOrServeUrl: string;
	downloadDir: string;
	onDownload: RenderMediaOnDownload;
	onError: (err: Error) => void;
	ffmpegExecutable: FfmpegExecutable;
}): Promise<{
	serveUrl: string;
	closeServer: () => Promise<unknown>;
	offthreadPort: number;
}> => {
	if (isServeUrl(webpackConfigOrServeUrl)) {
		const {port: offthreadPort, close: closeProxy} = await serveStatic(null, {
			downloadDir,
			onDownload,
			onError,
			ffmpegExecutable,
			port: null,
		});

		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => closeProxy(),
			offthreadPort,
		});
	}

	const {port, close} = await serveStatic(webpackConfigOrServeUrl, {
		downloadDir,
		onDownload,
		onError,
		ffmpegExecutable,
		port: null,
	});
	return Promise.resolve({
		closeServer: () => {
			return close();
		},
		serveUrl: `http://localhost:${port}`,
		offthreadPort: port,
	});
};
