import {convertMedia} from '@remotion/webcodecs';
import {
	addTestWatcher,
	allowSafariAudioDrop,
	makeProgressReporter,
	TestStructure,
} from './test-structure';

export const basicMp4ToWebM = (): TestStructure => {
	const src =
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/bigbuckbunny.mp4';

	return addTestWatcher({
		name: 'Basic MP4 to WebM',
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

export const weirdMp4aConfig = (): TestStructure => {
	const src =
		'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/riverside.mp4';

	return addTestWatcher({
		name: 'weird mp4a config',
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

export const lpcmLivePhoto = (): TestStructure => {
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

export const testList: TestStructure[] = [
	basicMp4ToWebM(),
	weirdMp4aConfig(),
	lpcmLivePhoto(),
];
