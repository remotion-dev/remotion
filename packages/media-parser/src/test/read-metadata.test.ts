import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseMedia} from '../parse-media';
import {nodeReader} from '../readers/from-node';

test('iPhone metadata', async () => {
	const {structure, metadata, location} = await parseMedia({
		src: exampleVideos.iphonelivefoto,
		fields: {
			structure: true,
			metadata: true,
			location: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	if (structure.type !== 'iso-base-media') {
		throw new Error('Expected video');
	}

	expect(location).toEqual({
		latitude: 47.3915,
		longitude: 8.5121,
		altitude: 404.68,
		horizontalAccuracy: 5.762147,
	});

	expect(metadata).toEqual([
		{
			key: 'com.apple.quicktime.location.accuracy.horizontal',
			trackId: null,
			value: '5.762147',
		},
		{
			key: 'com.apple.quicktime.live-photo.auto',
			trackId: null,
			value: 1,
		},
		{
			key: 'com.apple.quicktime.full-frame-rate-playback-intent',
			trackId: null,
			value: 1,
		},
		{
			key: 'com.apple.quicktime.content.identifier',
			trackId: null,
			value: '2C1C7C94-E977-45D0-9B3F-9A9CA8EFB47D',
		},
		{
			key: 'com.apple.quicktime.live-photo.vitality-score',
			trackId: null,
			value: 1,
		},
		{
			key: 'com.apple.quicktime.live-photo.vitality-scoring-version',
			trackId: null,
			value: 4,
		},
		{
			key: 'com.apple.quicktime.location.ISO6709',
			trackId: null,
			value: '+47.3915+008.5121+404.680/',
		},
		{
			key: 'com.apple.quicktime.make',
			trackId: null,
			value: 'Apple',
		},
		{
			key: 'com.apple.quicktime.model',
			trackId: null,
			value: 'iPhone 15 Pro',
		},
		{
			key: 'com.apple.quicktime.software',
			trackId: null,
			value: '18.0',
		},
		{
			key: 'com.apple.quicktime.creationdate',
			trackId: null,
			value: '2024-10-01T12:46:18+0200',
		},
		{
			key: 'com.apple.quicktime.camera.lens_model',
			trackId: 1,
			value: 'iPhone 15 Pro back camera 6.765mm f/1.78',
		},
		{
			key: 'com.apple.quicktime.camera.focal_length.35mm_equivalent',
			trackId: 1,
			value: 23,
		},
	]);
});

test('AVI metadata', async () => {
	const {metadata} = await parseMedia({
		src: exampleVideos.avi,
		fields: {
			metadata: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});
	expect(metadata).toEqual([
		{
			key: 'encoder',
			trackId: null,
			value: 'Lavf57.19.100',
		},
	]);
});

test('Metadata from Matroska', async () => {
	const {metadata} = await parseMedia({
		src: exampleVideos.matroskaPcm16,
		fields: {
			metadata: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});
	expect(metadata).toEqual([
		{
			key: 'comment',
			trackId: null,
			value: 'Made with Remotion 4.0.192',
		},
		{
			key: 'encoder',
			trackId: null,
			value: 'Lavf60.16.100',
		},
		{
			key: 'encoder',
			trackId: 1,
			value: 'Lavc60.31.102 libx264',
		},
		{
			key: 'duration',
			trackId: 1,
			value: '00:00:00.333000000',
		},
		{
			key: 'duration',
			trackId: 2,
			value: '00:00:00.333000000',
		},
	]);
});

test('webm Big buck bunny metadata', async () => {
	const {metadata} = await parseMedia({
		src: exampleVideos.av1bbb,
		fields: {
			metadata: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});
	expect(metadata).toEqual([
		{
			key: 'major_brand',
			trackId: null,
			value: 'isom',
		},
		{
			key: 'minor_version',
			trackId: null,
			value: '512',
		},
		{
			key: 'compatible_brands',
			trackId: null,
			value: 'isomav01iso2mp41',
		},
		{
			key: 'artist',
			trackId: null,
			value: 'Blender Foundation 2008, Janus Bager Kristensen 2013',
		},
		{
			key: 'composer',
			trackId: null,
			value: 'Sacha Goedegebure',
		},
		{
			key: 'genre',
			trackId: null,
			value: 'Animation',
		},
		{
			key: 'comment',
			trackId: null,
			value:
				'Creative Commons Attribution 3.0 - http://bbb3d.renderfarming.net',
		},
		{
			key: 'encoder',
			trackId: null,
			value: 'Lavf58.63.100',
		},
		{
			key: 'handler_name',
			trackId: 1,
			value: 'GPAC ISO Video Handler',
		},
		{
			key: 'duration',
			trackId: 1,
			value: '00:00:10.000000000',
		},
	]);
});

test('mp4 Big buck bunny metadata', async () => {
	const {metadata} = await parseMedia({
		src: exampleVideos.av1mp4,
		fields: {
			metadata: true,
			structure: true,
		},
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
	});

	expect(metadata).toEqual([
		{
			key: 'title',
			trackId: null,
			value: 'Big Buck Bunny, Sunflower version',
		},
		{
			key: 'artist',
			trackId: null,
			value: 'Blender Foundation 2008, Janus Bager Kristensen 2013',
		},
		{
			key: 'writer',
			trackId: null,
			value: 'Sacha Goedegebure',
		},
		{
			key: 'encoder',
			trackId: null,
			value: 'Lavf60.16.100',
		},
		{
			key: 'comment',
			trackId: null,
			value:
				'Creative Commons Attribution 3.0 - http://bbb3d.renderfarming.net',
		},
		{
			key: 'genre',
			trackId: null,
			value: 'Animation',
		},
	]);
});
