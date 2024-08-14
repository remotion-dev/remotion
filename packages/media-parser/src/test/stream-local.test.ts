import {RenderInternals} from '@remotion/renderer';
import {expect, test} from 'bun:test';
import {nodeReader} from '../from-node';
import {parseMedia} from '../parse-media';

test('Should stream ISO base media', async () => {
	let videoTracks = 0;
	let audioTracks = 0;
	let videoSamples = 0;
	let audioSamples = 0;
	const result = await parseMedia({
		src: RenderInternals.exampleVideos.iphonevideo,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			dimensions: true,
			rotation: true,
			unrotatedDimension: true,
		},
		reader: nodeReader,
		onVideoTrack: (track) => {
			expect(track.timescale).toBe(600);
			videoTracks++;
			return () => {
				videoSamples++;
			};
		},
		onAudioTrack: () => {
			audioTracks++;
			return () => {
				audioSamples++;
			};
		},
	});
	expect(result.dimensions).toEqual({
		width: 2160,
		height: 3840,
	});
	expect(result.durationInSeconds).toBe(12.568333333333333);
	expect(result.fps).toBe(29.99602174777881);
	expect(result.videoCodec).toBe('h265');
	expect(result.audioCodec).toBe('aac');
	expect(result.videoTracks.length).toBe(1);
	expect(result.videoTracks[0].codec).toBe('hvc1.2.4.L150.b0');
	expect(result.rotation).toBe(-90);
	expect(result.unrotatedDimension).toEqual({
		height: 2160,
		width: 3840,
	});
	expect(videoTracks).toBe(1);
	expect(audioTracks).toBe(1);
	expect(videoSamples).toBe(377);
	expect(audioSamples).toBe(544);
});

test('Should stream WebM with no duration', async () => {
	let videoSamples = 0;
	const result = await parseMedia({
		src: RenderInternals.exampleVideos.nofps,
		fields: {
			fps: true,
			durationInSeconds: true,
			dimensions: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
		},
		reader: nodeReader,
		onVideoTrack: (track) => {
			expect(track.timescale).toBe(1000000);
			expect(track.codec).toBe('vp8');
			expect(track.trackId).toBe(1);
			return () => {
				videoSamples++;
			};
		},
	});

	expect(result.durationInSeconds).toBe(6.57);
	expect(result.dimensions).toEqual({
		width: 1470,
		height: 690,
	});
	expect(result.fps).toBe(null);
	expect(result.videoCodec).toBe('vp8');
	expect(result.audioCodec).toBe(null);
	expect(result.rotation).toBe(0);
	expect(result.videoTracks.length).toBe(1);
	expect(result.videoTracks[0].codec).toBe('vp8');
	expect(videoSamples).toBe(7);
});

test('Should stream AV1', async () => {
	let videoTracks = 0;
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			boxes: true,
		},
		reader: nodeReader,
		onVideoTrack: (track) => {
			expect(track.timescale).toBe(1000000);

			videoTracks++;
			return () => {
				videoSamples++;
			};
		},
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
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0]).toEqual({
		type: 'video',
		codec: 'av01.0.08M.08',
		description: undefined,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		samplePositions: [],
		timescale: 1000000,
		trackId: 1,
		codedHeight: 1080,
		codedWidth: 1920,
		height: 1080,
		width: 1920,
		displayAspectHeight: 1080,
		displayAspectWidth: 1920,
	});
	expect(parsed.audioTracks.length).toBe(0);
	expect(videoTracks).toBe(1);
	expect(videoSamples).toBe(25);
});

test('Should stream corrupted video', async () => {
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.corrupted,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
		},
		onVideoTrack: (track) => {
			expect(track.timescale).toBe(24000);
			return () => {
				videoSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(30.03);
	expect(parsed.fps).toBe(23.976023976023974);
	expect(parsed.dimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codec).toBe('avc1.640028');
	expect(parsed.rotation).toBe(0);
	expect(videoSamples).toBe(720);
});

test('Should stream screen recording video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.screenrecording,
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
	});

	expect(parsed.durationInSeconds).toBe(5.866666666666666);
	expect(parsed.fps).toBe(58.983050847457626);
	expect(parsed.dimensions).toEqual({
		height: 1766,
		width: 2874,
	});
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe(null);
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codec).toBe('avc1.4d0033');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(58.983050847457626);
});

test('Should stream ProRes video', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.prores,
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
	});

	expect(parsed.fps).toBe(60);
	expect(parsed.dimensions.width).toBe(1920);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.034);
	expect(parsed.videoCodec).toBe('prores');
	expect(parsed.audioCodec).toBe('aiff');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codec).toBe('ap4h');
	expect(parsed.rotation).toBe(0);
});

test('Should stream variable fps video', async () => {
	let audioTracks = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.variablefps,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			unrotatedDimension: true,
			tracks: true,
			boxes: true,
		},
		reader: nodeReader,
		onAudioTrack: (track) => {
			expect(track.type).toBe('audio');
			expect(track.trackId).toBe(1);
			expect(track.codec).toBe('opus');
			expect(track.numberOfChannels).toBe(1);
			expect(track.sampleRate).toBe(48000);
			audioTracks++;
			// TODO: Get samples
			return null;
		},
	});

	expect(parsed.dimensions.width).toBe(1280);
	expect(parsed.dimensions.height).toBe(720);
	expect(parsed.unrotatedDimension.width).toBe(1280);
	expect(parsed.unrotatedDimension.height).toBe(720);
	expect(parsed.durationInSeconds).toBe(22.901);
	expect(parsed.videoCodec).toBe('vp8');
	expect(parsed.audioCodec).toBe('opus');
	expect(parsed.rotation).toBe(0);
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0]).toEqual({
		type: 'video',
		codec: 'vp8',
		description: undefined,
		sampleAspectRatio: {
			denominator: 1,
			numerator: 1,
		},
		samplePositions: [],
		timescale: 1000000,
		trackId: 2,
		codedHeight: 720,
		codedWidth: 1280,
		height: 720,
		width: 1280,
		displayAspectHeight: 720,
		displayAspectWidth: 1280,
	});
	expect(parsed.audioTracks.length).toBe(1);
	expect(parsed.audioTracks[0]).toEqual({
		type: 'audio',
		codec: 'opus',
		samplePositions: null,
		timescale: 1000000,
		trackId: 1,
		numberOfChannels: 1,
		sampleRate: 48000,
		description: undefined,
	});
	expect(audioTracks).toBe(1);
});

test('Should stream MKV video', async () => {
	let videoSamples = 0;
	let audioSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.matroskaPcm16,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			rotation: true,
			boxes: true,
			internalStats: true,
		},
		onVideoTrack: (track) => {
			expect(track.codec).toBe('avc1.640020');

			return () => {
				videoSamples++;
			};
		},
		onAudioTrack: (track) => {
			expect(track.codec).toBe('pcm-s16');
			return () => {
				audioSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.333);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('pcm');
	expect(parsed.rotation).toBe(0);
	expect(parsed.fps).toBe(null);

	expect(videoSamples).toBe(10);
	expect(audioSamples).toBe(16);
	expect(parsed.internalStats.samplesThatHadToBeQueued).toBe(0);
});

test('Should stream MP3 in MP4 video', async () => {
	let audioFrames = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.mp4withmp3,
		fields: {
			fps: true,
			dimensions: true,
			durationInSeconds: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			rotation: true,
			boxes: true,
		},
		onAudioTrack: (track) => {
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

	expect(parsed.dimensions.width).toBe(1080);
	expect(parsed.dimensions.height).toBe(1080);
	expect(parsed.durationInSeconds).toBe(0.337);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('mp3');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codec).toBe('avc1.640020');
	expect(parsed.audioTracks.length).toEqual(1);
	expect(parsed.audioTracks[0].codec).toBe('mp3');
	expect(parsed.rotation).toBe(0);
	expect(audioFrames).toBe(15);
});

test('Should get duration of HEVC video', async () => {
	let videoSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.iphonehevc,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			unrotatedDimension: true,
			videoCodec: true,
		},
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(parsed.durationInSeconds).toBe(3.4);
	expect(parsed.dimensions).toEqual({
		width: 1080,
		height: 1920,
	});
	expect(parsed.fps).toEqual(30);
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.rotation).toBe(-90);
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.videoTracks[0].codec).toBe('hvc1.2.4.L120.b0');
	expect(parsed.audioTracks.length).toBe(1);
	expect(parsed.audioTracks[0].codec).toBe('mp4a.40.02');
	expect(parsed.audioTracks[0].description).toEqual(new Uint8Array([18, 16]));
	expect(parsed.unrotatedDimension).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h265');
	expect(videoSamples).toBe(102);
});

test('Custom DAR', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.customDar,
		fields: {
			durationInSeconds: true,
			fps: true,
			videoCodec: true,
			audioCodec: true,
			tracks: true,
			dimensions: true,
			rotation: true,
			unrotatedDimension: true,
		},
		reader: nodeReader,
	});

	expect(parsed.videoTracks[0].sampleAspectRatio).toEqual({
		numerator: 56,
		denominator: 177,
	});
	expect(parsed.dimensions).toEqual({
		height: 720,
		width: 404.9717559814453,
	});
	expect(parsed.durationInSeconds).toBe(5.725);
	expect(parsed.fps).toBe(30);
	expect(parsed.videoCodec).toBe('h264');
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.videoTracks.length).toEqual(1);
	expect(parsed.videoTracks[0].codec).toBe('avc1.64001f');
	expect(parsed.videoTracks[0].width).toBe(405);
	expect(parsed.videoTracks[0].height).toBe(720);
	expect(parsed.videoTracks[0].codedWidth).toBe(1280);
	expect(parsed.videoTracks[0].codedHeight).toBe(720);
	expect(parsed.rotation).toBe(0);
	expect(parsed.unrotatedDimension).toEqual({
		height: 720,
		width: 404.9717559814453,
	});
});

test('Get tracks from an AV1 if no info is requested', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.av1mp4,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
	});
	expect(parsed.videoTracks.length).toBe(1);
	// This is true, there are no audio tracks
});

test('Should get correct avc1 string from matroska', async () => {
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.matroskaPcm16,
		fields: {
			tracks: true,
			boxes: true,
		},
		reader: nodeReader,
	});

	expect(parsed.videoTracks[0].codec).toBe('avc1.640020');
});

test('VP8 Vorbis', async () => {
	let videoSamples = 0;
	let audioSamples = 0;

	const {audioCodec} = await parseMedia({
		src: RenderInternals.exampleVideos.vp8Vorbis,
		onVideoTrack: (track) => {
			expect(track.codec).toBe('vp8');
			expect(track.timescale).toBe(1000000);
			expect(track.codedHeight).toBe(360);
			expect(track.codedWidth).toBe(640);
			expect(typeof track.description).toBe('undefined');
			return () => {
				videoSamples++;
			};
		},
		fields: {
			audioCodec: true,
		},
		onAudioTrack: (track) => {
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
		src: RenderInternals.exampleVideos.vp9,
		onVideoTrack: (track) => {
			expect(track.codec).toBe('vp09.00.10.08');
			return () => {
				videoSamples++;
			};
		},
		reader: nodeReader,
	});

	expect(videoSamples).toBe(300);
});

test('Stretched VP8', async () => {
	// stretched-vp8.webm was recorded in 1440x1080 and stretched to 1920x1080
	const {videoTracks} = await parseMedia({
		src: RenderInternals.exampleVideos.stretchedVp8,
		fields: {
			tracks: true,
		},
		reader: nodeReader,
	});

	expect(videoTracks).toEqual([
		{
			codec: 'vp8',
			codedHeight: 1080,
			codedWidth: 1440,
			description: undefined,
			height: 1080,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			samplePositions: [],
			timescale: 1000000,
			trackId: 1,
			type: 'video',
			width: 1920,
			displayAspectHeight: 1080,
			displayAspectWidth: 1920,
		},
	]);
});

test('HEVC and AAC in Matroska', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.matroskaH265Aac,
		fields: {
			tracks: true,
			videoCodec: true,
			audioCodec: true,
			boxes: true,
		},
		reader: nodeReader,
		onAudioTrack: (audioTrack) => {
			expect(audioTrack.codec).toEqual('mp4a.40.02');
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: (videoTrack) => {
			expect(videoTrack.codec).toEqual('hvc1.1.6.L93.90');
			return () => {
				videoSamples++;
			};
		},
	});

	expect(parsed.videoCodec).toEqual('h265');
	expect(parsed.audioCodec).toEqual('aac');
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(159);
	expect(videoSamples).toBe(100);
});

test('MP3 in matroska', async () => {
	let videoSamples = 0;
	let audioSamples = 0;

	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.matroskaMp3,
		fields: {
			tracks: true,
			videoCodec: true,
			audioCodec: true,
			boxes: true,
		},
		reader: nodeReader,
		onAudioTrack: (audioTrack) => {
			expect(audioTrack.codec).toEqual('mp3');
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: (videoTrack) => {
			expect(videoTrack.codec).toEqual('avc1.64001f');
			return () => {
				videoSamples++;
			};
		},
	});

	expect(parsed.videoCodec).toEqual('h264');
	expect(parsed.audioCodec).toEqual('mp3');
	expect(parsed.videoTracks.length).toBe(1);
	expect(parsed.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(139);
	expect(videoSamples).toBe(100);
});

test('Should stream OPUS', async () => {
	let audioSamples = 0;
	const parsed = await parseMedia({
		src: RenderInternals.exampleVideos.opusWebm,
		fields: {
			tracks: true,
			audioCodec: true,
		},
		reader: nodeReader,
		onAudioTrack: (track) => {
			expect(track.codec).toEqual('opus');
			expect(typeof track.description).toEqual('undefined');
			return (samples) => {
				expect(samples.type).toEqual('key');
				audioSamples++;
			};
		},
	});

	expect(parsed.audioCodec).toEqual('opus');
	expect(parsed.audioTracks.length).toBe(1);
	expect(audioSamples).toBe(166);
});
