import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {parseAndDownloadMedia} from '../parse-and-download-media';
import {nodeReader} from '../readers/from-node';
import {nodeWriter} from '../writers/node';

test('should be able to parse and download video', async () => {
	const {size} = await parseAndDownloadMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			size: true,
		},
		writer: nodeWriter('output.avi'),
	});

	const s = Bun.file('output.avi');
	expect(s.size).toBe(742478);
	expect(size).toBe(742478);
	await s.unlink();
});

test('should be able to parse and download video', async () => {
	const {size} = await parseAndDownloadMedia({
		src: exampleVideos.iphonehevc,
		reader: nodeReader,
		fields: {
			size: true,
		},
		writer: nodeWriter('iphonehevc.mp4'),
	});

	const s = Bun.file('iphonehevc.mp4');
	expect(size).toBe(7418901);
	expect(s.size).toBe(7418901);
	await s.unlink();
});

test(
	'should be able to parse and download remote video',
	async () => {
		const {size} = await parseAndDownloadMedia({
			src: 'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/transportstream.ts',
			fields: {
				size: true,
			},
			writer: nodeWriter('output2'),
		});

		const s = Bun.file('output2');
		expect(s.size).toBe(1913464);
		expect(size).toBe(1913464);
		await s.unlink();
	},
	{timeout: 30_000},
);
