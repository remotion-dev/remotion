import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {getTraks} from '../containers/iso-base-media/traversal';
import {trakBoxContainsVideo} from '../get-fps';
import {getAv1CBox} from '../get-sample-aspect-ratio';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

// bun segfaults here
if (process.platform !== 'win32') {
	test('AV1 in MP4', async () => {
		const parsed = await parseMedia({
			acknowledgeRemotionLicense: true,
			src: exampleVideos.av1mp4,
			fields: {
				durationInSeconds: true,
				fps: true,
				videoCodec: true,
				tracks: true,
				audioCodec: true,
				dimensions: true,
				rotation: true,
				structure: true,
			},
			reader: nodeReader,
		});

		if (parsed.structure.type !== 'iso-base-media') {
			throw new Error('Not an ISO base media file');
		}

		const {structure} = parsed;

		const moovBox = structure.boxes.find((s) => s.type === 'moov-box');
		if (!moovBox || moovBox.type !== 'moov-box') {
			throw new Error('No moov box');
		}

		const traks = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
		const avc1Box = getAv1CBox(traks);
		expect(avc1Box).toEqual({
			type: 'av1C-box',
			privateData: new Uint8Array([
				129, 8, 12, 0, 10, 11, 0, 0, 0, 66, 171, 191, 195, 119, 111, 228, 1,
			]),
		});
		expect(avc1Box).toBeTruthy();

		expect(parsed.durationInSeconds).toBe(10);
		expect(parsed.fps).toBe(30);
		expect(parsed.videoCodec).toBe('av1');
		expect(parsed.tracks.videoTracks[0].codec).toEqual('av01.0.08M.08');
		// This is true, there are no audio tracks
		expect(parsed.tracks.audioTracks).toEqual([]);
		expect(parsed.audioCodec).toEqual(null);
		expect(parsed.dimensions).toEqual({
			width: 1920,
			height: 1080,
		});
		expect(parsed.rotation).toBe(0);
	});

	test('AV1 in MP4 with colr atom', async () => {
		let tracks = 0;
		let samples = 0;

		const parsed = await parseMedia({
			acknowledgeRemotionLicense: true,
			src: exampleVideos.av1mp4WithColr,
			fields: {
				durationInSeconds: true,
				fps: true,
				videoCodec: true,
				tracks: true,
				audioCodec: true,
				dimensions: true,
				rotation: true,
				structure: true,
			},
			reader: nodeReader,
			onVideoTrack: () => {
				tracks++;
				return () => {
					samples++;
				};
			},
		});

		if (parsed.structure.type !== 'iso-base-media') {
			throw new Error('Not an ISO base media file');
		}

		const {structure} = parsed;

		if (structure.type !== 'iso-base-media') {
			throw new Error('Expected iso-base-media');
		}

		const moovBox = structure.boxes.find((s) => s.type === 'moov-box');
		if (!moovBox || moovBox.type !== 'moov-box') {
			throw new Error('No moov box');
		}

		const traks = getTraks(moovBox).filter((t) => trakBoxContainsVideo(t))[0];
		const avc1Box = getAv1CBox(traks);
		expect(avc1Box).toEqual({
			type: 'av1C-box',
			privateData: new Uint8Array([
				129, 8, 12, 0, 10, 14, 0, 0, 0, 66, 171, 191, 195, 118, 0, 8, 8, 8, 8,
				32,
			]),
		});
		expect(avc1Box).toBeTruthy();

		expect(parsed.durationInSeconds).toBe(1);
		expect(parsed.fps).toBe(25);
		expect(parsed.videoCodec).toBe('av1');
		expect(parsed.tracks.videoTracks[0].codec).toEqual('av01.0.08M.08');
		// This is true, there are no audio tracks
		expect(parsed.tracks.audioTracks).toEqual([]);
		expect(parsed.audioCodec).toEqual(null);
		expect(parsed.dimensions).toEqual({
			width: 1920,
			height: 1080,
		});
		expect(parsed.rotation).toBe(0);
		expect(tracks).toBe(1);
		expect(samples).toBe(25);
	});
}
