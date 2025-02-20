import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('multiple audio streams', async () => {
	const audio = await parseMedia({
		src: exampleVideos.separatedAudio,
		fields: {
			m3uStreams: true,
		},
		reader: nodeReader,
		acknowledgeRemotionLicense: true,
	});

	expect(audio).toEqual({
		m3uStreams: [
			{
				averageBandwidth: null,
				bandwidth: 5000000,
				codecs: ['avc1.42e00a', 'mp4a.40.2'],
				dedicatedAudioTracks: [
					{
						autoselect: true,
						channels: 1,
						default: true,
						groupId: 'aud1',
						language: 'en',
						name: 'English',
						uri: 'audio.m3u8',
					},
				],
				id: 0,
				resolution: {
					height: 1080,
					width: 1920,
				},
				url: 'video.m3u8',
			},
		],
	});
});
