import {exampleVideos} from '@remotion/example-videos';
import {expect, test} from 'bun:test';
import {existsSync, statSync, unlinkSync} from 'node:fs';
import {downloadAndParseMedia} from '../download-and-parse-media';
import {mediaParserController} from '../media-parser-controller';
import {nodeReader} from '../readers/from-node';
import {nodeWriter} from '../writers/node';

test('should be able to parse and download video', async () => {
	const {size} = await downloadAndParseMedia({
		src: exampleVideos.avi,
		reader: nodeReader,
		fields: {
			size: true,
		},
		writer: nodeWriter('output.avi'),
		acknowledgeRemotionLicense: true,
	});

	const s = statSync('output.avi');
	expect(s.size).toBe(742478);
	expect(size).toBe(742478);
	unlinkSync('output.avi');
});

test('should be able to parse and download mp4 video', async () => {
	const {size} = await downloadAndParseMedia({
		src: exampleVideos.iphonehevc,
		reader: nodeReader,
		fields: {
			size: true,
		},
		writer: nodeWriter('iphonehevc.mp4'),
		acknowledgeRemotionLicense: true,
	});

	const s = statSync('iphonehevc.mp4');
	expect(size).toBe(7418901);
	expect(s.size).toBe(7418901);
	unlinkSync('iphonehevc.mp4');
});

test(
	'should be able to parse and download remote video',
	async () => {
		const {size} = await downloadAndParseMedia({
			src: 'https://remotion-assets.s3.eu-central-1.amazonaws.com/example-videos/transportstream.ts',
			fields: {
				size: true,
			},
			writer: nodeWriter('output2'),
			acknowledgeRemotionLicense: true,
		});

		const s = statSync('output2');
		expect(s.size).toBe(1913464);
		expect(size).toBe(1913464);
		unlinkSync('output2');
	},
	{timeout: 30_000},
);

test('should be able to abort the download by throwing an error', () => {
	const controller = mediaParserController();
	expect(
		downloadAndParseMedia({
			src: 'https://www.w3schools.com/html/mov_bbb.mp4',
			onContainer: (container) => {
				if (container === 'mp4') {
					throw new Error('Unsupported format');
				}
			},
			controller,
			writer: nodeWriter('output3.mp4'),
			acknowledgeRemotionLicense: true,
		}),
	).rejects.toThrow('Unsupported format');
});

test('should be able to parse and download video with audio', () => {
	expect(
		downloadAndParseMedia({
			src: 'https://www.w3schools.com/html/mov_bbb.mp4',
			onContainer: async (container) => {
				await new Promise((resolve) => {
					setTimeout(resolve, 10);
				});
				if (container === 'mp4') {
					throw new Error('Unsupported format');
				}
			},
			writer: nodeWriter('output3.mp4'),
			acknowledgeRemotionLicense: true,
		}),
	).rejects.toThrow('Unsupported format');
	expect(existsSync('output3.mp4')).toBe(false);
});

test('should be able to continue on error', () => {
	const controller = mediaParserController();
	expect(
		downloadAndParseMedia({
			src: 'https://remotion-assets.s3.eu-central-1.amazonaws.com/jkl.gif',
			controller,
			writer: nodeWriter('jkl.gif'),
			onError: () => ({action: 'download'}),
			acknowledgeRemotionLicense: true,
		}),
	).rejects.toThrow('GIF files are not yet supported');
	expect(existsSync('jkl.gif')).toBe(true);
	unlinkSync('jkl.gif');
});
