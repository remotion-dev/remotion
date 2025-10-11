import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import path from 'path';
import {nodeReader} from '../node';
import {parseMedia} from '../parse-media';

test('separate video and  audio streams', async () => {
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
				averageBandwidthInBitsPerSec: null,
				bandwidthInBitsPerSec: 5000000,
				codecs: ['avc1.42e00a', 'mp4a.40.2'],
				associatedPlaylists: [
					{
						autoselect: true,
						channels: 1,
						default: true,
						groupId: 'aud1',
						language: 'en',
						name: 'English',
						src: path.resolve(
							path.dirname(exampleVideos.separatedAudio),
							'audio.m3u8',
						),
						id: 0,
						isAudio: true,
					},
				],
				id: 0,
				dimensions: {
					height: 1080,
					width: 1920,
				},
				src: path.resolve(
					path.dirname(exampleVideos.separatedAudio),
					'video.m3u8',
				),
			},
		],
	});
});

test('multiple audio streams', async () => {
	const {m3uStreams} = await parseMedia({
		src: exampleVideos.multipleAudio,
		acknowledgeRemotionLicense: true,
		fields: {
			m3uStreams: true,
		},
		reader: nodeReader,
	});

	expect(m3uStreams).toEqual([
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/10000kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 10285391,
			codecs: ['avc1.4d4033', 'mp4a.40.2'],
			dimensions: {width: 4096, height: 1744},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/surround/en/320kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 0,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/6000kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 6214307,
			codecs: ['avc1.4d4028', 'mp4a.40.2'],
			dimensions: {width: 1921, height: 818},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/surround/en/320kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 1,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/4000kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 4149264,
			codecs: ['avc1.4d4028', 'mp4a.40.2'],
			dimensions: {width: 1921, height: 818},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/surround/en/320kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 2,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/1500kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 1558322,
			codecs: ['avc1.4d401f', 'mp4a.40.2'],
			dimensions: {width: 1277, height: 554},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/surround/en/320kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 3,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/1100kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 1144430,
			codecs: ['avc1.4d401f', 'mp4a.40.2'],
			dimensions: {width: 958, height: 408},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/surround/en/320kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					isAudio: true,
					id: 1,
				},
			],
			id: 4,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/800kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 831270,
			codecs: ['avc1.4d4015', 'mp4a.40.2'],
			dimensions: {width: 638, height: 272},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/en/128kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 5,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/500kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 520929,
			codecs: ['avc1.4d4015', 'mp4a.40.2'],
			dimensions: {width: 638, height: 272},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/en/128kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 6,
		},
		{
			src: path.resolve(
				path.dirname(exampleVideos.separatedAudio),
				'video/250kbit.m3u8',
			),
			averageBandwidthInBitsPerSec: null,
			bandwidthInBitsPerSec: 258157,
			codecs: ['avc1.4d400d', 'mp4a.40.2'],
			dimensions: {width: 422, height: 180},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/en/128kbit.m3u8',
					),
					id: 0,
					isAudio: true,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					src: path.resolve(
						path.dirname(exampleVideos.separatedAudio),
						'audio/stereo/none/128kbit.m3u8',
					),
					id: 1,
					isAudio: true,
				},
			],
			id: 7,
		},
	]);
});
