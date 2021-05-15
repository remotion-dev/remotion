import {downloadAndMapAssetsToFileUrl} from '../assets/download-and-map-assets-to-file';

test('Should sanitize weird file names when downloading', async () => {
	const newAsset = await downloadAndMapAssetsToFileUrl({
		localhostAsset: {
			src:
				'http://localhost:3000/gtts-api.miniggiodev.fr/Ici+Japon+Corp.?lang=ja',
			frame: 0,
			id: 'japon',
			isRemote: false,
			mediaFrame: 1,
			type: 'video',
			volume: 1,
			playbackRate: 1,
		},
		webpackBundle: '/var/tmp',
		onDownload: () => undefined,
	});
	expect(newAsset.src).toBe(
		process.platform === 'win32'
			? '\\var\\tmp\\gtts-api.miniggiodev.frIci+Japon+Corp'
			: '/var/tmp/gtts-api.miniggiodev.frIci+Japon+Corp'
	);
});
