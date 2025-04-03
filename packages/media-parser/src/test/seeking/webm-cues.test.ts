import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {fetchWebmCues} from '../../containers/webm/fetch-web-cues';
import {mediaParserController} from '../../controller/media-parser-controller';
import {nodeReader} from '../../node';
import {parseMedia} from '../../parse-media';

test('get webm cues', async () => {
	const fields = await fetchWebmCues({
		src: exampleVideos.stretchedVp8,
		// must be data in seek head + offset of seek head
		position: 0x0000c9581a,
		controller: mediaParserController(),
		readerInterface: nodeReader,
		logLevel: 'info',
	});

	expect(fields).toEqual([
		{
			minVintWidth: 1,
			type: 'CuePoint',
			value: [
				{
					minVintWidth: 1,
					type: 'CueTime',
					value: {
						byteLength: 1,
						value: 3,
					},
				},
				{
					minVintWidth: 1,
					type: 'CueTrackPositions',
					value: [
						{
							minVintWidth: 1,
							type: 'CueTrack',
							value: {
								byteLength: 1,
								value: 1,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueClusterPosition',
							value: {
								byteLength: 2,
								value: 4485,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueRelativePosition',
							value: {
								byteLength: 1,
								value: 10,
							},
						},
					],
				},
			],
		},
		{
			minVintWidth: 1,
			type: 'CuePoint',
			value: [
				{
					minVintWidth: 1,
					type: 'CueTime',
					value: {
						byteLength: 2,
						value: 4803,
					},
				},
				{
					minVintWidth: 1,
					type: 'CueTrackPositions',
					value: [
						{
							minVintWidth: 1,
							type: 'CueTrack',
							value: {
								byteLength: 1,
								value: 1,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueClusterPosition',
							value: {
								byteLength: 3,
								value: 5080846,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueRelativePosition',
							value: {
								byteLength: 2,
								value: 1016,
							},
						},
					],
				},
			],
		},
		{
			minVintWidth: 1,
			type: 'CuePoint',
			value: [
				{
					minVintWidth: 1,
					type: 'CueTime',
					value: {
						byteLength: 2,
						value: 9603,
					},
				},
				{
					minVintWidth: 1,
					type: 'CueTrackPositions',
					value: [
						{
							minVintWidth: 1,
							type: 'CueTrack',
							value: {
								byteLength: 1,
								value: 1,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueClusterPosition',
							value: {
								byteLength: 3,
								value: 10317853,
							},
						},
						{
							minVintWidth: 1,
							type: 'CueRelativePosition',
							value: {
								byteLength: 2,
								value: 995,
							},
						},
					],
				},
			],
		},
	]);
});

test('should use them for seeking', async () => {
	await parseMedia({
		src: exampleVideos.stretchedVp8,
		acknowledgeRemotionLicense: true,
		reader: nodeReader,
		onVideoTrack: (track) => {
			return (sample) => {};
		},
	});
});
