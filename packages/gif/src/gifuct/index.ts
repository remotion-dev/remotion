/* eslint-disable no-console */
import {GIF} from '../js-binary-schema-parser/gif';
import {parse} from '../js-binary-schema-parser/parser';
import {buildStream} from '../js-binary-schema-parser/uint8-parser';
import {deinterlace} from './deinterlace';
import {lzw} from './lzw';
import type {Frame, ParsedFrameWithoutPatch, ParsedGif} from './types';

export const parseGIF = (arrayBuffer: ArrayBuffer): ParsedGif => {
	const byteData = new Uint8Array(arrayBuffer);
	return parse(buildStream(byteData), GIF) as ParsedGif;
};

export const decompressFrame = (
	frame: Frame,
	gct: [number, number, number][],
): ParsedFrameWithoutPatch | null => {
	if (!frame.image) {
		console.warn('gif frame does not have associated image.');
		return null;
	}

	const {image} = frame;

	// get the number of pixels
	const totalPixels = image.descriptor.width * image.descriptor.height;
	// do lzw decompression
	let pixels = lzw(image.data.minCodeSize, image.data.blocks, totalPixels);

	// deal with interlacing if necessary
	if (image.descriptor.lct?.interlaced) {
		pixels = deinterlace(pixels, image.descriptor.width);
	}

	const resultImage: ParsedFrameWithoutPatch = {
		pixels,
		dims: {
			top: frame.image.descriptor.top,
			left: frame.image.descriptor.left,
			width: frame.image.descriptor.width,
			height: frame.image.descriptor.height,
		},
		colorTable: image.descriptor.lct?.exists
			? (image.lct as [number, number, number][])
			: gct,
		delay: (frame.gce?.delay ?? 10) * 10,
		disposalType: frame.gce ? frame.gce.extras.disposal : 1,
		transparentIndex: frame.gce
			? frame.gce.extras.transparentColorGiven
				? frame.gce.transparentColorIndex
				: -1
			: -1,
	};

	return resultImage;
};

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => !('application' in f))
		.map((f) => decompressFrame(f as Frame, parsedGif.gct));
};
