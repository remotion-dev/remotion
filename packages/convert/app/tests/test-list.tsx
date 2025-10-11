import {convertMedia} from '@remotion/webcodecs';
import {flipVideoFrame} from '~/components/flip-video';
import type {TestStructure} from './test-structure';
import {addTestWatcher, isSafari, makeProgressReporter} from './test-structure';

const basicMp4ToWebM = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/bigbuckbunny.mp4';

	return addTestWatcher({
		name: 'Basic MP4 to WebM',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const av1WebmToMp4 = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/av1-bbb.webm';

	return addTestWatcher({
		name: 'AV1 WebM to MP4',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'mp4',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const av1WebmToMp4H265 = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/av1-bbb.webm';

	return addTestWatcher({
		name: 'AV1 WebM to MP4 (H.265)',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'mp4',
				videoCodec: 'h265',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const weirdMp4aConfig = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/riverside.mp4';

	return addTestWatcher({
		name: 'weird mp4a config',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				audioCodec: 'opus',
				videoCodec: 'vp8',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const convertToWav = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/riverside.mp4';

	return addTestWatcher({
		name: 'convert to wav',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'wav',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const lpcmLivePhoto = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/livephoto-lpcm-audio.mov';
	return addTestWatcher({
		name: 'HEVC Live Photo + LPCM audio codec',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const aviToMp4ReEncode = (): TestStructure => {
	const src = 'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/example.avi';
	return addTestWatcher({
		name: 'AVI to MP4 (Re-Encode)',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'mp4',
				onProgress: makeProgressReporter(onUpdate),
				onVideoTrack: () => {
					return {type: 'reencode', videoCodec: 'h264'};
				},
				onAudioTrack: () => {
					if (isSafari()) {
						return {
							type: 'drop',
						};
					}

					return {
						type: 'reencode',
						audioCodec: 'aac',
						bitrate: 128000,
						sampleRate: null,
					};
				},
			});
		},
	});
};

const aviToMp4 = (): TestStructure => {
	const src = 'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/example.avi';
	return addTestWatcher({
		name: 'AVI to MP4',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'mp4',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const rotatedVideo = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/iphone-hevc.mov';

	return addTestWatcher({
		name: 'Rotated video',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const vpxEncodingError = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/vpx-encoding-error.mp4';
	return addTestWatcher({
		name: 'Flipping a video',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
				onVideoFrame: ({frame}) => {
					return flipVideoFrame({frame, horizontal: true, vertical: false});
				},
			});
		},
	});
};

const offsetTimestamps = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/very-offset-timestamps.mp4';

	return addTestWatcher({
		name: 'Convert a video with offset video and audio timestamps',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const transportStream = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/transportstream.ts';

	return addTestWatcher({
		name: 'Convert a .ts file to .webm',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const remuxUnevenDim = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/unevendim.webm';

	return addTestWatcher({
		name: 'Remux uneven dim',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				onAudioTrack: () => {
					return {type: 'copy'};
				},
				onVideoCodec: () => {
					return {type: 'copy'};
				},
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const remuxToughTimestamps = (): TestStructure => {
	const src =
		'https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/tough-timestamps.mp4';

	return addTestWatcher({
		name: 'Resize Recorder WebM with tough timestamps',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'webm',
				resize: {
					maxHeight: 1080,
					mode: 'max-height',
				},
				onAudioTrack: () => {
					return {type: 'copy'};
				},
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

const tsWithSmallAudioOnEend = (): TestStructure => {
	const src =
		'https://test-streams.mux.dev/x36xhzz/url_0/url_525/193039199_mp4_h264_aac_hd_7.ts';

	return addTestWatcher({
		name: '.ts with 16 Byte audio sample at the end',
		src,
		async execute(onUpdate) {
			await convertMedia({
				src,
				container: 'mp4',
				onVideoTrack: () => ({type: 'drop'}),
				onProgress: makeProgressReporter(onUpdate),
			});
		},
	});
};

export const testList: TestStructure[] = [
	basicMp4ToWebM(),
	av1WebmToMp4(),
	aviToMp4(),
	aviToMp4ReEncode(),
	av1WebmToMp4H265(),
	convertToWav(),
	weirdMp4aConfig(),
	rotatedVideo(),
	lpcmLivePhoto(),
	vpxEncodingError(),
	offsetTimestamps(),
	transportStream(),
	remuxUnevenDim(),
	remuxToughTimestamps(),
	tsWithSmallAudioOnEend(),
];
