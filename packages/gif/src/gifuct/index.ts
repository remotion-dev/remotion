// @ts-expect-error
import {parse} from 'js-binary-schema-parser';
// @ts-expect-error
import {buildStream} from 'js-binary-schema-parser/lib/parsers/uint8';
// @ts-expect-error
import GIF from 'js-binary-schema-parser/lib/schemas/gif';
import {deinterlace} from './deinterlace';
import {lzw} from './lzw';
import type {Frame, ParsedFrameWithoutPatch, ParsedGif} from './types';

export const parseGIF = (arrayBuffer: ArrayBuffer) => {
	const byteData = new Uint8Array(arrayBuffer);
	return parse(buildStream(byteData), GIF);
};

export const decompressFrame = (
	frame: Frame,
	gct: [number, number, number][]
) => {
	if (!frame.image) {
		console.warn('gif frame does not have associated image.');
		return;
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
		colorTable: gct,
		delay: (frame.gce.delay || 10) * 10,
		disposalType: frame.gce.extras.disposal,
		transparentIndex: frame.gce.extras.transparentColorGiven
			? frame.gce.transparentColorIndex
			: -1,
	};

	return resultImage;
};

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => !('application' in f))
		.map((f) => decompressFrame(f as Frame, parsedGif.gct));
};
