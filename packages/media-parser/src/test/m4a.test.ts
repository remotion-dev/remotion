import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';

test('should work on voice note', async () => {
	let samples = 0;

	const {audioCodec} = await parseMedia({
		src: exampleVideos.m4a,
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
		onVideoTrack: () => {
			throw new Error('No video track');
		},
		fields: {
			audioCodec: true,
			videoCodec: true,
			container: true,
			dimensions: true,
			metadata: true,
			slowStructure: true,
		},
		onAudioTrack: (track) => {
			const trk = track.track;
			expect(trk).toEqual({
				startInSeconds: 0,
				type: 'audio',
				trackId: 1,
				originalTimescale: 48000,
				codec: 'mp4a.40.02',
				numberOfChannels: 1,
				sampleRate: 48000,
				description: new Uint8Array([17, 136]),
				codecData: {type: 'aac-config', data: new Uint8Array([17, 136])},
				codecEnum: 'aac',
				timescale: WEBCODECS_TIMESCALE,
				trackMediaTimeOffsetInTrackTimescale: 0,
			});

			return () => {
				samples++;
			};
		},
	});

	expect(audioCodec).toBe('aac');
	expect(samples).toBe(236);
});
