import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('parse m3u8', async () => {
	let audioSamples = 0;
	let videoSamples = 0;

	const {
		dimensions,
		durationInSeconds,
		tracks,
		audioCodec,
		container,
		fps,
		images,
		internalStats,
		isHdr,
		keyframes,
		location,
		metadata,
		mimeType,
		name,
		m3uStreams,
	} = await parseMedia({
		src: exampleVideos.m3u8,
		reader: nodeReader,
		onAudioTrack: () => {
			return () => {
				audioSamples++;
			};
		},
		onVideoTrack: () => {
			return () => {
				videoSamples++;
			};
		},
		fields: {
			structure: true,
			durationInSeconds: true,
			dimensions: true,
			tracks: true,
			audioCodec: true,
			container: true,
			fps: true,
			images: true,
			internalStats: true,
			isHdr: true,
			keyframes: true,
			location: true,
			metadata: true,
			mimeType: true,
			name: true,
			rotation: true,
			sampleRate: true,
			videoCodec: true,
			size: true,
			numberOfAudioChannels: true,
			m3uStreams: true,
		},
		acknowledgeRemotionLicense: true,
	});

	expect(durationInSeconds).toBe(5.06667);
	expect(dimensions).toEqual({
		width: 1000,
		height: 1000,
	});
	expect(tracks.videoTracks).toEqual([
		{
			type: 'video',
			codec: 'avc1.640028',
			codecPrivate: new Uint8Array([
				1, 100, 0, 40, 255, 225, 0, 30, 103, 100, 0, 40, 172, 217, 0, 252, 31,
				249, 101, 192, 91, 129, 1, 2, 160, 0, 0, 3, 0, 42, 131, 166, 128, 1,
				227, 6, 50, 192, 1, 0, 4, 104, 234, 239, 44,
			]),
			codecWithoutConfig: 'h264',
			codedHeight: 1000,
			codedWidth: 1000,
			color: {
				matrixCoefficients: 'bt470bg',
				transferCharacteristics: null,
				primaries: null,
				fullRange: true,
			},
			description: undefined,
			displayAspectHeight: 1000,
			displayAspectWidth: 1000,
			fps: null,
			height: 1000,
			rotation: 0,
			sampleAspectRatio: {
				denominator: 1,
				numerator: 1,
			},
			timescale: 90000,
			trackId: 256,
			trakBox: null,
			width: 1000,
		},
	]);
	expect(tracks.audioTracks).toEqual([
		{
			codec: 'mp4a.40.2',
			codecPrivate: new Uint8Array([9, 144]),
			codecWithoutConfig: 'aac',
			description: undefined,
			numberOfChannels: 2,
			sampleRate: 48000,
			timescale: 90000,
			trackId: 257,
			trakBox: null,
			type: 'audio',
		},
	]);
	expect(audioCodec).toBe('aac');
	expect(container).toBe('m3u8');
	expect(fps).toBe(null);
	expect(images).toEqual([]);
	expect(internalStats).toEqual({
		finalCursorOffset: 2223,
		skippedBytes: 0,
	});
	expect(isHdr).toBe(false);
	expect(keyframes).toEqual(null);
	expect(location).toBe(null);
	expect(metadata).toEqual([]);
	expect(mimeType).toBe(null);
	expect(name).toBe('video.m3u8');
	expect(audioSamples).toBe(240);
	expect(videoSamples).toBe(151);
	expect(m3uStreams).toEqual([
		{
			url: 'https://manifest-gcp-us-east1-vop1.fastly.mux.com/UqxOz1B6t4myu5KZe7MDjWu016z5VlzgCUBS1rtL01urP02qlsm01e4EsjTX9VvmK1kGrbfLfM7LUAUitI004Rxhmy3y8WPtYN6mW/rendition.m3u8?cdn=fastly&expires=1740218400&skid=default&signature=NjdiOWEwMjBfZDc5OGQzZTI3ZGZiOTE5NGJhZTQwZjdhN2I0NTJkMWQ1NjY4ZmFhYWIyNGE5OGRjYTA3ZjE4MDE3ZjQ1NWJhZA==&vsid=v9o00gTIN00tMihOSsY8x8QNDtZhn33IVc3j4OrbbrCA8ERnuLCE18iQQFBQqdhQToj3rbKtOeKdY',
			averageBandwidth: 1057100,
			bandwidth: 1057100,
			codecs: ['mp4a.40.2', 'avc1.640028'],
			resolution: {width: 1000, height: 1000},
			id: 3,
		},
		{
			url: 'https://manifest-gcp-us-east1-vop1.fastly.mux.com/YGMjPlHfWgy7lDqN01VVW8zCR200O4o0200R7hnLOO7bV14fLg5ThBx24M3y7fB6eMXudfbnE7THbepACAsY026ZxQ5DVbH6HObW01CMm6HiwEUBI/rendition.m3u8?cdn=fastly&expires=1740218400&skid=default&signature=NjdiOWEwMjBfNjdiMWE2YTYzZDMyYzYxMTA3OTk5NjU5MjY0MzEwYTY3ZjQ0NGRmNWQ0OTVhMjhjNWNmYzhlOTMyOGRhMmJhZg==&vsid=v9o00gTIN00tMihOSsY8x8QNDtZhn33IVc3j4OrbbrCA8ERnuLCE18iQQFBQqdhQToj3rbKtOeKdY',
			averageBandwidth: 618200,
			bandwidth: 618200,
			codecs: ['mp4a.40.2', 'avc1.640020'],
			resolution: {width: 720, height: 720},
			id: 5,
		},
		{
			url: 'https://manifest-gcp-us-east1-vop1.fastly.mux.com/HK00VP300bJL5NOhaDdV5OE0200XUPTm02ImLVdoI00kxgnKdXSX00xH00Mn01oBtR63oAGS7XJGDcrxMVDfatXAcZSit9VOil1PdqLkywEZvDVZTM7s/rendition.m3u8?cdn=fastly&expires=1740218400&skid=default&signature=NjdiOWEwMjBfYTVlYTQyYzM3OGY2ZjUwODE3MGFiYWY2YTBlNzgwMjk0YzQ0MWIzMmRjODBmNTJjZWMxMzIzNzRlYjMwOWEzNA==&vsid=v9o00gTIN00tMihOSsY8x8QNDtZhn33IVc3j4OrbbrCA8ERnuLCE18iQQFBQqdhQToj3rbKtOeKdY',
			averageBandwidth: 358600,
			bandwidth: 358600,
			codecs: ['mp4a.40.2', 'avc1.64001f'],
			resolution: {width: 480, height: 480},
			id: 7,
		},
		{
			url: 'https://manifest-gcp-us-east1-vop1.fastly.mux.com/e35901tOcxBHspMKcoo9ENOGGMIuUjvk7VVcD7JI0200imKZWYk4l6VuLZB9QwZvARhktihhC8Gk4RhtVUNDhKpveiFo5AwnxRn/rendition.m3u8?cdn=fastly&expires=1740218400&skid=default&signature=NjdiOWEwMjBfNGUzMTljZmEzNDI1ZWNiYmY4YmNmZWI5MTI0NzkzZDUwZmQ5YTYzZDI5ZWIwOThlY2EyM2JiODg0NmQxMmRkZA==&vsid=v9o00gTIN00tMihOSsY8x8QNDtZhn33IVc3j4OrbbrCA8ERnuLCE18iQQFBQqdhQToj3rbKtOeKdY',
			averageBandwidth: 214500,
			bandwidth: 214500,
			codecs: ['mp4a.40.2', 'avc1.640015'],
			resolution: {width: 270, height: 270},
			id: 9,
		},
	]);
});
