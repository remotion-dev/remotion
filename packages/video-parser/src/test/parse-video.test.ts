import {expect, test} from 'bun:test';
import {loadVideo, parseVideo} from '../parse-video';
import {exampleVideos} from './example-videos';

// If this is fixed we can unflag https://github.com/oven-sh/bun/issues/10890
if (process.platform !== 'win32') {
	test('Parse Big Buck bunny', async () => {
		const video = await loadVideo(exampleVideos.bigBuckBunny, 4 * 1024);
		const data = parseVideo(video);
		expect(data).toEqual([
			{
				offset: 0,
				boxSize: 32,
				type: 'ftyp-box',
				majorBrand: 'isom',
				minorVersion: 512,
				compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
			},
			{
				offset: 32,
				boxSize: 8,
				boxType: 'free',
				type: 'regular-box',
				children: [],
			},
		]);
	});

	test('Parse an iPhone video', async () => {
		const video = await loadVideo(exampleVideos.iphonevideo, 4 * 1024);
		const data = parseVideo(video);
		expect(data).toEqual([
			{
				boxSize: 20,
				type: 'ftyp-box',
				majorBrand: 'qt',
				minorVersion: 0,
				compatibleBrands: ['qt'],
				offset: 0,
			},
			{
				type: 'regular-box',
				boxType: 'wide',
				boxSize: 8,
				offset: 20,
				children: [],
			},
		]);
	});

	test('Parse framer', async () => {
		const video = await loadVideo(
			exampleVideos.framerWithoutFileExtension,
			4 * 1024,
		);
		const parsed = parseVideo(video);
		expect(parsed).toEqual([
			{
				offset: 0,
				boxSize: 32,
				compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
				majorBrand: 'isom',
				minorVersion: 512,
				type: 'ftyp-box',
			},
			{
				offset: 32,
				boxSize: 8,
				boxType: 'free',
				type: 'regular-box',
				children: [],
			},
		]);
	});

	test('Parse a full video', async () => {
		const video = await loadVideo(exampleVideos.framer24fps, Infinity);
		const data = parseVideo(video);
		if (!data) throw new Error('No data');

		const [first, second, third] = data;

		if (first.type !== 'ftyp-box') {
			throw new Error('Expected ftyp-box');
		}

		expect(first).toEqual({
			offset: 0,
			boxSize: 32,
			type: 'ftyp-box',
			majorBrand: 'isom',
			minorVersion: 512,
			compatibleBrands: ['isom', 'iso2', 'avc1', 'mp41'],
		});
		expect(second).toEqual({
			offset: 32,
			boxType: 'free',
			boxSize: 8,
			type: 'regular-box',
			children: [],
		});
		expect(third).toEqual({
			offset: 40,
			boxSize: 57014,
			boxType: 'mdat',
			children: [],
			type: 'regular-box',
		});
	});
}
