import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import type {MediaParserAudioCodec} from '../get-tracks';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('Should stream WebM with no duration', async () => {
	let videoSamples = 0;
	const result = await parseMedia({
		src: exampleVideos.nofps,
		fields: {
			fps: true,
			durationInSeconds: true,
			dimensions: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			slowFps: true,
		},
		reader: nodeReader,
		onVideoTrack: ({track}) => {
			expect(track.timescale).toBe(1000000);
			expect(track.codec).toBe('vp8');
			expect(track.trackId).toBe(1);
			return () => {
				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(result.durationInSeconds).toBe(6.57);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
	expect(result.fps).toBe(null);
	expect(result.slowFps).toBe(0.9968433294567203);
	expect(result.videoCodec).toBe('vp8');
	expect(result.audioCodec).toBe(null);
	expect(result.rotation).toBe(0);
	expect(result.tracks.videoTracks.length).toBe(1);
	expect(result.tracks.videoTracks[0].codec).toBe('vp8');
	expect(videoSamples).toBe(7);
});

test('Should stream AV1', async () => {
	let videoTracks = 0;
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			structure: true,
		},
		reader: nodeReader,
		onVideoTrack: ({track}) => {
			expect(track.timescale).toBe(1000000);

			videoTracks++;
			return () => {
				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.durationInSeconds).toBe(1);
	expect(parsed.fps).toBe(null);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('av1');
	expect(parsed.audioCodec).toBe(null);
	expect(parsed.rotation).toBe(0);
	expect(parsed.tracks.videoTracks.length).toBe(1);
	expect(parsed.tracks.videoTracks[0]).toEqual({
		type: 'video',
		codec: 'av01.0.08M.08',
		description: undefined,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		timescale: 1000000,
		trackId: 1,
		codedHeight: 1080,
		codedWidth: 1920,
		height: 1080,
		width: 1920,
		displayAspectHeight: 1080,
		displayAspectWidth: 1920,
		rotation: 0,
		trakBox: null,
		codecPrivate: new Uint8Array([
			129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0, 8, 8, 8, 8, 32,
		]),
		color: {
			fullRange: null,
			transferCharacteristics: 'bt709',
			matrixCoefficients: 'bt709',
			primaries: 'bt709',
		},
		codecWithoutConfig: 'av1',
		fps: null,
	});
	expect(parsed.tracks.audioTracks.length).toBe(0);
	expect(videoTracks).toBe(1);
	expect(videoSamples).toBe(25);
});

test('Should stream corrupted video', async () => {
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: exampleVideos.corrupted,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		onVideoTrack: ({track}) => {
			expect(track.timescale).toBe(24000);
			return () => {
				videoSamples++;
			};
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.durationInSeconds).toBe(30.03);
	expect(parsed.fps).toBe(23.976023976023974);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.tracks.videoTracks.length).toEqual(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('avc1.640028');
	expect(parsed.rotation).toBe(0);
	expect(videoSamples).toBe(720);
});

test('Should stream screen recording video', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.screenrecording,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.durationInSeconds).toBe(5.866666666666666);
	expect(parsed.fps).toBe(58.983050847457626);
	expect(parsed.dimensions).toEqual({
		height: 1766,
		width: 2874,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe(null);
	expect(parsed.tracks.videoTracks.length).toEqual(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('avc1.4d0033');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(58.983050847457626);
});

test('Should stream ProRes video', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.prores,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(parsed.fps).toBe(60);
	expect(parsed.dimensions?.width).toBe(1920);
	expect(parsed.dimensions?.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.034);
	expect(parsed.videoCodec).toBe('prores');
	expect(parsed.audioCodec).toBe('aiff');
	expect(parsed.tracks.videoTracks.length).toEqual(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('ap4h');
	expect(parsed.rotation).toBe(0);
});

test(
	'Should stream variable fps video',
	async () => {
		let audioTracks = 0;
		let samples = 0;
		const parsed = await parseMedia({
			src: exampleVideos.variablefps,
			fields: {
				fps: true,
				dimensions: true,
				durationInSeconds: true,
				videoCodec: true,
				audioCodec: true,
				rotation: true,
				unrotatedDimensions: true,
				tracks: true,
				structure: true,
			},
			acknowledgeRemotionLicense: true,
			reader: nodeReader,
			onAudioTrack: ({track: track_}) => {
				expect(track_.type).toBe('audio');
				expect(track_.trackId).toBe(1);
				expect(track_.codec).toBe('opus');
				expect(track_.numberOfChannels).toBe(1);
				expect(track_.sampleRate).toBe(48000);
				audioTracks++;
				return () => {
					samples++;
				};
			},
		});

		expect(parsed.dimensions?.width).toBe(1280);
		expect(parsed.dimensions?.height).toBe(720);
		expect(parsed.unrotatedDimensions?.width).toBe(1280);
		expect(parsed.unrotatedDimensions?.height).toBe(720);
		expect(parsed.durationInSeconds).toBe(22.901);
		expect(parsed.videoCodec).toBe('vp8');
		expect(parsed.audioCodec).toBe('opus');
		expect(parsed.rotation).toBe(0);
		expect(parsed.tracks.videoTracks.length).toBe(1);
		expect(parsed.tracks.videoTracks[0]).toEqual({
			type: 'video',
			codec: 'vp8',
			description: undefined,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			timescale: 1000000,
			trackId: 2,
			codedHeight: 720,
			codedWidth: 1280,
			height: 720,
			width: 1280,
			displayAspectHeight: 720,
			displayAspectWidth: 1280,
			rotation: 0,
			trakBox: null,
			codecPrivate: null,
			color: {
				fullRange: null,
				transferCharacteristics: null,
				matrixCoefficients: null,
				primaries: null,
			},
			codecWithoutConfig: 'vp8',
			fps: null,
		});
		expect(parsed.tracks.audioTracks.length).toBe(1);
		expect(parsed.tracks.audioTracks[0]).toEqual({
			type: 'audio',
			codec: 'opus',
			timescale: 1000000,
			trackId: 1,
			numberOfChannels: 1,
			sampleRate: 48000,
			description: undefined,
			trakBox: null,
			codecPrivate: new Uint8Array([
				79, 112, 117, 115, 72, 101, 97, 100, 1, 1, 0, 0, 128, 187, 0, 0, 0, 0,
				0,
			]),
			codecWithoutConfig: 'opus',
		});
		expect(audioTracks).toBe(1);
		expect(samples).toBe(381);
	},
	{timeout: 10000},
);

test('Should stream MKV video', async () => {
	let videoSamples = 0;
	let audioSamples = 0;
	const parsed = await parseMedia({
		src: exampleVideos.matroskaPcm16,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			structure: true,
			internalStats: true,
			slowFps: true,
			slowNumberOfFrames: true,
		},
		acknowledgeRemotionLicense: true,
		onVideoTrack: ({track}) => {
			expect(track.codec).toBe('avc1.640020');

			return () => {
				videoSamples++;
			};
		},
		onAudioTrack: ({track}) => {
			expect(track.codec).toBe('pcm-s16');
			return () => {
				audioSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions?.width).toBe(1080);
	expect(parsed.dimensions?.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.333);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('pcm-s16');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(null);
	expect(parsed.slowFps).toBe(30);

	expect(videoSamples).toBe(10);
	expect(audioSamples).toBe(16);
	expect(parsed.slowNumberOfFrames).toBe(10);
});

test('Should stream MP3 in MP4 video', async () => {
	let audioFrames = 0;
	const parsed = await parseMedia({
		src: exampleVideos.mp4withmp3,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		onAudioTrack: ({track}) => {
			expect(track.type).toBe('audio');
			expect(track.codec).toBe('mp3');
			expect(track.sampleRate).toBe(48000);
			expect(typeof track.description).toBe('undefined');
			return () => {
				audioFrames++;
			};
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions?.width).toBe(1080);
	expect(parsed.dimensions?.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.337);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('mp3');
	expect(parsed.tracks.videoTracks.length).toEqual(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('avc1.640020');
	expect(parsed.tracks.audioTracks.length).toEqual(1);
	expect(parsed.tracks.audioTracks[0].codec).toBe('mp3');
	expect(parsed.rotation).toBe(0);
	expect(audioFrames).toBe(15);
});

test('Custom DAR', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.customDar,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			dimensions: true,
			rotation: true,
			unrotatedDimensions: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.tracks.videoTracks[0].sampleAspectRatio).toEqual({
		numerator: 56,
		denominator: 177,
	});
	expect(parsed.dimensions).toEqual({
		height: 720,
		width: 405,
	});
	expect(parsed.durationInSeconds).toBe(5.725);
	expect(parsed.fps).toBe(30);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.tracks.videoTracks.length).toEqual(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('avc1.64001f');
	expect(parsed.tracks.videoTracks[0].width).toBe(405);
	expect(parsed.tracks.videoTracks[0].height).toBe(720);
	expect(parsed.tracks.videoTracks[0].codedWidth).toBe(1280);
	expect(parsed.tracks.videoTracks[0].codedHeight).toBe(720);
	expect(parsed.rotation).toBe(0);
	expect(parsed.unrotatedDimensions).toEqual({
		height: 720,
		width: 405,
	});
});

test('Get tracks from an AV1 if no info is requested', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.av1mp4,
		fields: {
			tracks: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});
	expect(parsed.tracks.videoTracks.length).toBe(1);
	// This is true, there are no audio tracks
});

test('Should get correct avc1 string from matroska', async () => {
	const parsed = await parseMedia({
		src: exampleVideos.matroskaPcm16,
		fields: {
			tracks: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(parsed.tracks.videoTracks[0].codec).toBe('avc1.640020');
});

test('VP8 Vorbis', async () => {
	let videoSamples = 0;
	let audioSamples = 0;

	const {audioCodec} = await parseMedia({
		src: exampleVideos.vp8Vorbis,
		onVideoTrack: ({track}) => {
			expect(track.codec).toBe('vp8');
			expect(track.timescale).toBe(1000000);
			expect(track.codedHeight).toBe(360);
			expect(track.codedWidth).toBe(640);
			expect(typeof track.description).toBe('undefined');
			return () => {
				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
		fields: {
			audioCodec: true,
		},
		onAudioTrack: ({track}) => {
			expect(track.codec).toBe('vorbis');
			expect(track.timescale).toBe(1000000);
			expect(track.description?.length).toBe(3097);

			return () => {
				audioSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(videoSamples).toBe(812);
	expect(audioSamples).toBe(1496);

	expect(audioCodec).toBe('vorbis');
});

test('VP9', async () => {
	let videoSamples = 0;
	await parseMedia({
		src: exampleVideos.vp9,
		onVideoTrack: ({track}) => {
			expect(track.codec).toBe('vp09.00.10.08');
			return () => {
				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(videoSamples).toBe(300);
});

test('Stretched VP8', async () => {
	// stretched-vp8.webm was recorded in 1440x1080 and stretched to 1920x1080
	const {tracks} = await parseMedia({
		src: exampleVideos.stretchedVp8,
		fields: {
			tracks: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	const {trakBox, ...track} = tracks.videoTracks[0];
	expect(track).toEqual({
		codec: 'vp8',
		codedHeight: 1080,
		codedWidth: 1440,
		description: undefined,
		height: 1080,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		timescale: 1000000,
		trackId: 1,
		type: 'video',
		width: 1920,
		displayAspectHeight: 1080,
		displayAspectWidth: 1920,
		rotation: 0,
		codecPrivate: null,
		color: {
			fullRange: null,
			transferCharacteristics: null,
			matrixCoefficients: null,
			primaries: null,
		},
		codecWithoutConfig: 'vp8',
		fps: null,
	});
});

test('HEVC and AAC in Matroska', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	const parsed = await parseMedia({
		src: exampleVideos.matroskaH265Aac,
		fields: {
			tracks: true,
			videoCodec: true,
			audioCodec: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onAudioTrack: ({track: audioTrack}) => {
			expect(audioTrack.codec).toEqual('mp4a.40.02');
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: ({track: videoTrack}) => {
			expect(videoTrack.codec).toEqual('hvc1.1.6.L93.90');
			return () => {
				videoSamples++;
			};
		},
	});

	expect(parsed.videoCodec).toEqual('h265');
	expect(parsed.audioCodec).toEqual('aac');
	expect(parsed.tracks.videoTracks.length).toBe(1);
	expect(parsed.tracks.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(159);
	expect(videoSamples).toBe(100);
});

test('MP3 in matroska', async () => {
	let videoSamples = 0;
	let audioSamples = 0;

	const parsed = await parseMedia({
		src: exampleVideos.matroskaMp3,
		fields: {
			tracks: true,
			videoCodec: true,
			audioCodec: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onAudioTrack: ({track: audioTrack}) => {
			expect(audioTrack.codec).toEqual('mp3');
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: ({track: videoTrack}) => {
			expect(videoTrack.codec).toEqual('avc1.64001f');
			return () => {
				videoSamples++;
			};
		},
	});

	expect(parsed.videoCodec).toEqual('h264');
	expect(parsed.audioCodec).toEqual('mp3');
	expect(parsed.tracks.videoTracks.length).toBe(1);
	expect(parsed.tracks.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(140);
	expect(videoSamples).toBe(100);
});

test('Should stream OPUS', async () => {
	let audioSamples = 0;
	let audioCodec: MediaParserAudioCodec | null = null;
	const parsed = await parseMedia({
		src: exampleVideos.opusWebm,
		fields: {
			tracks: true,
			audioCodec: true,
		},
		acknowledgeRemotionLicense: true,
		onAudioCodec: (codec) => {
			audioCodec = codec;
		},
		reader: nodeReader,
		onAudioTrack: ({track}) => {
			expect(track.codec).toEqual('opus');
			expect(typeof track.description).toEqual('undefined');
			return (samples) => {
				expect(samples.type).toEqual('key');
				audioSamples++;
			};
		},
	});

	// @ts-expect-error
	expect(audioCodec).toEqual('opus');
	expect(parsed.tracks.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(167);
});

test('Should stream transparent video', async () => {
	let videoTracks = 0;
	let audioTracks = 0;
	let videoSamples = 0;
	let keyFrames = 0;

	await parseMedia({
		src: exampleVideos.transparentwithdar,
		reader: nodeReader,
		onVideoTrack: ({track}) => {
			expect(track.codedHeight).toBe(512);
			expect(track.codedWidth).toBe(512);
			videoTracks++;
			return (sample) => {
				// https://ffmpeg.org/pipermail/ffmpeg-devel/2015-June/173825.html
				// For Blocks, keyframes is
				// inferred by the absence of ReferenceBlock element (as done by matroskadec).
				if (sample.type === 'key') {
					keyFrames++;
				}

				videoSamples++;
			};
		},
		acknowledgeRemotionLicense: true,
		onAudioTrack: () => {
			audioTracks++;
			return null;
		},
		fields: {
			tracks: true,
		},
	});

	expect(videoTracks).toBe(1);
	expect(audioTracks).toBe(0);
	expect(videoSamples).toBe(39);
	expect(keyFrames).toBe(1);
});
