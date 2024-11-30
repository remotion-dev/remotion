import {convertMedia} from '@remotion/webcodecs';
import {
	addTestWatcher,
	allowSafariAudioDrop,
	makeProgressReporter,
	TestStructure,
} from './test-structure';

export const runBigBuckBunny = (): TestStructure => {
	const src =
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/riverside.mp4';

	return addTestWatcher({
		name: 'convert mp4 to webm - patched audio bytes in chrome',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				audioCodec: 'opus',
				videoCodec: 'vp8',
				onAudioTrack: allowSafariAudioDrop,
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

export const runBigBuckBunny2 = (): TestStructure => {
	const src =
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/livephoto-lpcm-audio.mov';
	return addTestWatcher({
		name: 'Live Photo + LPCM audio codec',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onAudioTrack: allowSafariAudioDrop,
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};
