import {expect, test} from 'bun:test';
import {detectFileType} from '../detect-file-type';

test('detects PNG dimensions', () => {
	const png = new Uint8Array(24);
	png.set([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10], 0);
	png.set([0, 0, 0, 13], 8);
	png.set([0x49, 0x48, 0x44, 0x52], 12);
	png.set([0, 0, 7, 128], 16);
	png.set([0, 0, 4, 56], 20);

	expect(detectFileType(png)).toEqual({
		type: 'png',
		dimensions: {
			width: 1920,
			height: 1080,
		},
	});
});

test('detects animated PNG dimensions', () => {
	const apng = new Uint8Array(53);
	apng.set([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10], 0);
	apng.set([0, 0, 0, 13], 8);
	apng.set([0x49, 0x48, 0x44, 0x52], 12);
	apng.set([0, 0, 1, 64], 16);
	apng.set([0, 0, 0, 180], 20);
	apng.set([0, 0, 0, 8], 33);
	apng.set([0x61, 0x63, 0x54, 0x4c], 37);

	expect(detectFileType(apng)).toEqual({
		type: 'apng',
		dimensions: {
			width: 320,
			height: 180,
		},
	});
});

test('detects animated WebP files', () => {
	const webp = new Uint8Array(44);
	webp.set([0x52, 0x49, 0x46, 0x46, 36, 0, 0, 0], 0);
	webp.set([0x57, 0x45, 0x42, 0x50], 8);
	webp.set([0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0], 12);
	webp.set([0x02, 0, 0, 0, 0x3f, 0x01, 0, 0xb3, 0, 0], 20);
	webp.set([0x41, 0x4e, 0x49, 0x4d, 6, 0, 0, 0], 30);

	expect(detectFileType(webp)).toEqual({
		type: 'webp',
		animated: true,
		dimensions: {
			width: 320,
			height: 180,
		},
	});
});

test('detects static WebP files', () => {
	const webp = new Uint8Array(30);
	webp.set([0x52, 0x49, 0x46, 0x46, 22, 0, 0, 0], 0);
	webp.set([0x57, 0x45, 0x42, 0x50], 8);
	webp.set([0x56, 0x50, 0x38, 0x58, 10, 0, 0, 0], 12);
	webp.set([0, 0, 0, 0, 0x3f, 0x01, 0, 0xb3, 0, 0], 20);

	expect(detectFileType(webp)).toEqual({
		type: 'webp',
		animated: false,
		dimensions: {
			width: 320,
			height: 180,
		},
	});
});

test('detects GIF dimensions', () => {
	const gif = new Uint8Array([
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x20, 0x03, 0x58, 0x02,
	]);

	expect(detectFileType(gif)).toEqual({
		type: 'gif',
		dimensions: {
			width: 800,
			height: 600,
		},
	});
});

test('returns null dimensions for short GIF signatures', () => {
	expect(detectFileType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toEqual({
		type: 'gif',
		dimensions: null,
	});
});

test('detects iso base media and WebM files as videos', () => {
	const mp4 = new Uint8Array([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70]);
	const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);

	expect(detectFileType(mp4)).toEqual({type: 'iso-base-media'});
	expect(detectFileType(webm)).toEqual({type: 'webm'});
});

test('detects audio file signatures', () => {
	const wav = new Uint8Array([
		0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45,
	]);
	const mp3 = new Uint8Array([0x49, 0x44, 0x33, 3]);
	const aac = new Uint8Array([0xff, 0xf1]);
	const flac = new Uint8Array([0x66, 0x4c, 0x61, 0x43]);

	expect(detectFileType(wav)).toEqual({type: 'wav'});
	expect(detectFileType(mp3)).toEqual({type: 'mp3'});
	expect(detectFileType(aac)).toEqual({type: 'aac'});
	expect(detectFileType(flac)).toEqual({type: 'flac'});
});

test('returns unknown for unsupported signatures', () => {
	expect(detectFileType(new Uint8Array([1, 2, 3, 4]))).toEqual({
		type: 'unknown',
	});
});
