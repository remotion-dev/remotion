import {convertMedia} from '@remotion/webcodecs';
import {
	addTestWatcher,
	makeProgressReporter,
	TestStructure,
} from './test-structure';

export const runBigBuckBunny = (): TestStructure => {
	return addTestWatcher({
		name: 'convert mp4 to webm',
		async execute(onUpdate) {
			await convertMedia({
				src: 'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/riverside.mp4',
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

export const runBigBuckBunny2 = (): TestStructure => {
	return addTestWatcher({
		name: 'Live Photo + LPCM audio codec',
		async execute(onUpdate) {
			await convertMedia({
				src: 'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/livephoto-lpcm-audio.mov',
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};
