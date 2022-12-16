import type {Frame, ParsedFrame, ParsedGif} from 'gifuct-js';
import {deinterlace} from './deinterlace';
import {lzw} from './lzw';

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
	if (image.descriptor.lct.interlaced) {
		pixels = deinterlace(pixels, image.descriptor.width);
	}

	const resultImage: ParsedFrame = {
		pixels,
		dims: {
			top: frame.image.descriptor.top,
			left: frame.image.descriptor.left,
			width: frame.image.descriptor.width,
			height: frame.image.descriptor.height,
		},
		colorTable: image.descriptor.lct.exists ? image.lct : gct,
		delay: frame.gce ? (frame.gce.delay || 10) * 10 : 100,
		disposalType: frame.gce ? frame.gce.extras.disposal : 0,
		transparentIndex: frame.gce?.extras.transparentColorGiven
			? frame.gce.transparentColorIndex
			: 0,
		patch: new Uint8ClampedArray(0),
	};

	return resultImage;
};

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => {
			return !('application' in f);
		})
		.map((f) => {
			return decompressFrame(f as Frame, parsedGif.gct);
		});
};
