import {exampleVideos} from '@remotion/example-videos';
import {afterEach, beforeEach, expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

beforeEach(() => {
	process.env.DISABLE_CONTENT_RANGE = 'true';
});

afterEach(() => {
	process.env.DISABLE_CONTENT_RANGE = 'false';
});

test('Should get duration of HEVC video', async () => {
	let hdrCalled = false;
	const parsed = await parseMedia({
		src: exampleVideos.iphonehevc,
		fields: {
			durationInSeconds: true,
			dimensions: true,
			fps: true,
			audioCodec: true,
			rotation: true,
			tracks: true,
			unrotatedDimensions: true,
			videoCodec: true,
			isHdr: true,
		},
		onIsHdr: (isHdr) => {
			hdrCalled = true;
			expect(isHdr).toBe(true);
		},
		reader: nodeReader,
	});

	expect(hdrCalled).toBe(true);
	expect(parsed.isHdr).toBe(true);
	expect(parsed.durationInSeconds).toBe(3.4);
	expect(parsed.dimensions).toEqual({
		width: 1080,
		height: 1920,
	});
	expect(parsed.fps).toEqual(30);
	expect(parsed.audioCodec).toBe('aac');
	expect(parsed.rotation).toBe(-90);
	expect(parsed.tracks.videoTracks.length).toBe(1);
	expect(parsed.tracks.videoTracks[0].codec).toBe('hvc1.2.4.L120.b0');
	expect(parsed.tracks.videoTracks[0].color).toEqual({
		matrixCoefficients: 'bt2020',
		primaries: 'bt2020',
		transferCharacteristics: 'arib-std-b67',
		fullRange: false,
	});
	expect(parsed.tracks.audioTracks.length).toBe(1);
	expect(parsed.tracks.audioTracks[0].codec).toBe('mp4a.40.02');
	expect(parsed.tracks.audioTracks[0].description).toEqual(
		new Uint8Array([18, 16]),
	);
	expect(parsed.unrotatedDimensions).toEqual({
		width: 1920,
		height: 1080,
	});
	expect(parsed.videoCodec).toBe('h265');
});

test('Should not be able to get HEVC while also asking for samples', () => {
	expect(
		parseMedia({
			src: exampleVideos.iphonehevc,
			onVideoTrack: () => {
				return () => {};
			},
			reader: nodeReader,
		}),
	).rejects.toThrowError(/Source does not support reading partially/);
});
