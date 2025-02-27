import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
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
				averageBandwidth: null,
				bandwidth: 5000000,
				codecs: ['avc1.42e00a', 'mp4a.40.2'],
				associatedPlaylists: [
					{
						autoselect: true,
						channels: 1,
						default: true,
						groupId: 'aud1',
						language: 'en',
						name: 'English',
						url: 'audio.m3u8',
						id: 0,
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
			url: 'video/10000kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 10285391,
			codecs: ['avc1.4d4033', 'mp4a.40.2'],
			resolution: {width: 4096, height: 1744},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					url: 'audio/surround/en/320kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 0,
		},
		{
			url: 'video/6000kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 6214307,
			codecs: ['avc1.4d4028', 'mp4a.40.2'],
			resolution: {width: 1921, height: 818},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					url: 'audio/surround/en/320kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 1,
		},
		{
			url: 'video/4000kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 4149264,
			codecs: ['avc1.4d4028', 'mp4a.40.2'],
			resolution: {width: 1921, height: 818},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					url: 'audio/surround/en/320kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 2,
		},
		{
			url: 'video/1500kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 1558322,
			codecs: ['avc1.4d401f', 'mp4a.40.2'],
			resolution: {width: 1277, height: 554},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					url: 'audio/surround/en/320kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 3,
		},
		{
			url: 'video/1100kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 1144430,
			codecs: ['avc1.4d401f', 'mp4a.40.2'],
			resolution: {width: 958, height: 408},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'surround',
					language: 'en',
					name: 'English',
					url: 'audio/surround/en/320kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'surround',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 4,
		},
		{
			url: 'video/800kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 831270,
			codecs: ['avc1.4d4015', 'mp4a.40.2'],
			resolution: {width: 638, height: 272},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					url: 'audio/stereo/en/128kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 5,
		},
		{
			url: 'video/500kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 520929,
			codecs: ['avc1.4d4015', 'mp4a.40.2'],
			resolution: {width: 638, height: 272},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					url: 'audio/stereo/en/128kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 6,
		},
		{
			url: 'video/250kbit.m3u8',
			averageBandwidth: null,
			bandwidth: 258157,
			codecs: ['avc1.4d400d', 'mp4a.40.2'],
			resolution: {width: 422, height: 180},
			associatedPlaylists: [
				{
					autoselect: true,
					channels: null,
					default: true,
					groupId: 'stereo',
					language: 'en',
					name: 'English',
					url: 'audio/stereo/en/128kbit.m3u8',
					id: 0,
				},
				{
					autoselect: true,
					channels: null,
					default: false,
					groupId: 'stereo',
					language: 'dubbing',
					name: 'Dubbing',
					url: 'audio/stereo/none/128kbit.m3u8',
					id: 1,
				},
			],
			id: 7,
		},
	]);
});
