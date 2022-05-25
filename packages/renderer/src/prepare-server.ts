import {FfmpegExecutable} from 'remotion';
import {RenderMediaOnDownload} from './assets/download-and-map-assets-to-file';
import {isServeUrl} from './is-serve-url';
import {startOffthreadVideoServer} from './offthread-video-server';
import {serveStatic} from './serve-static';

export const prepareServer = async (
	webpackConfigOrServeUrl: string,
	downloadDir: string,
	onDownload: RenderMediaOnDownload,
	onError: (err: Error) => void,
	ffmpegExecutable: FfmpegExecutable
): Promise<{
	serveUrl: string;
	closeServer: () => Promise<unknown>;
	offthreadPort: number;
}> => {
	const {close: offthreadClose, port: offthreadPort} =
		await startOffthreadVideoServer(
			ffmpegExecutable,
			downloadDir,
			onDownload,
			onError
		);
	if (isServeUrl(webpackConfigOrServeUrl)) {
		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => {
				return Promise.resolve(offthreadClose());
			},
			offthreadPort: 0,
		});
	}

	const {port, close} = await serveStatic(webpackConfigOrServeUrl);
	return Promise.resolve({
		closeServer: () => {
			return Promise.all([close(), offthreadClose()]);
		},
		serveUrl: `http://localhost:${port}`,
		offthreadPort,
	});
};
