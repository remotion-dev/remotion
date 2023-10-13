import {parseGIF} from './gifuct';
import type {Frame, ParsedFrameWithoutPatch, ParsedGif} from './gifuct/types';
import {decompressFrames} from './parser/decompress-frames';
import type {GifState} from './props';

const validateAndFix = (gif: ParsedGif) => {
	let currentGce = null;
	for (const frame of gif.frames) {
		currentGce = (frame as Frame).gce ? (frame as Frame).gce : currentGce;

		// fix loosing graphic control extension for same frames
		if ('image' in frame && !('gce' in frame) && currentGce !== null) {
			(frame as Frame).gce = currentGce;
		}
	}
};

const resetPixels = ({
	typedArray,
	dx,
	dy,
	width,
	height,
	gifWidth,
}: {
	typedArray: Uint8ClampedArray;
	dx: number;
	dy: number;
	width: number;
	height: number;
	gifWidth: number;
}) => {
	const offset = dy * gifWidth + dx;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const taPos = offset + y * gifWidth + x;
			typedArray[taPos * 4] = 0;
			typedArray[taPos * 4 + 1] = 0;
			typedArray[taPos * 4 + 2] = 0;
			typedArray[taPos * 4 + 3] = 0;
		}
	}
};

const putPixels = (
	typedArray: Uint8ClampedArray,
	frame: ParsedFrameWithoutPatch,
	gifSize: {
		width: number;
		height: number;
	},
) => {
	const {width, height, top: dy, left: dx} = frame.dims;
	const offset = dy * gifSize.width + dx;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const pPos = y * width + x;
			const colorIndex = frame.pixels[pPos];
			if (colorIndex !== frame.transparentIndex) {
				const taPos = offset + y * gifSize.width + x;
				const color = frame.colorTable[colorIndex];
				typedArray[taPos * 4] = color[0];
				typedArray[taPos * 4 + 1] = color[1];
				typedArray[taPos * 4 + 2] = color[2];
				typedArray[taPos * 4 + 3] =
					colorIndex === frame.transparentIndex ? 0 : 255;
			}
		}
	}
};

export const parse = (
	src: string,
	{
		signal,
	}: {
		signal: AbortController['signal'];
	},
) =>
	fetch(src, {signal})
		.then((resp) => {
			if (!resp.headers.get('Content-Type')?.includes('image/gif'))
				throw Error(
					`Wrong content type: "${resp.headers.get('Content-Type')}"`,
				);
			return resp.arrayBuffer();
		})
		.then((buffer) => parseGIF(buffer))
		.then((gif: ParsedGif) => {
			validateAndFix(gif);
			return gif;
		})
		.then((gif) =>
			Promise.all([
				decompressFrames(gif),
				{width: gif.lsd.width, height: gif.lsd.height},
			]),
		)
		.then(([frames, options]) => {
			const readyFrames: Uint8ClampedArray[] = [];
			const size = options.width * options.height * 4;

			let canvas = new Uint8ClampedArray(size);

			for (let i = 0; i < frames.length; ++i) {
				const frame = frames[i];

				// Read about different disposal types
				// https://giflib.sourceforge.net/whatsinagif/animation_and_transparency.html
				const prevCanvas = frames[i].disposalType === 3 ? canvas.slice() : null;

				putPixels(canvas, frame, options);
				readyFrames.push(canvas.slice());

				// Disposal type 2: The canvas should be restored to the background color
				if (frames[i].disposalType === 2) {
					resetPixels({
						typedArray: canvas,
						dx: frame.dims.left,
						dy: frame.dims.top,
						width: frame.dims.width,
						height: frame.dims.height,
						gifWidth: options.width,
					});
				}
				// Disposal type 3: The decoder should restore the canvas to its previous state before the current image was drawn
				else if (frames[i].disposalType === 3) {
					if (!prevCanvas) {
						throw Error('Disposal type 3 without previous frame');
					}

					canvas = prevCanvas;
				}
				// Disposal type 1: Draw the next image on top of it
				else {
					canvas = readyFrames[i].slice();
				}
			}

			return {
				...options,
				loaded: true,
				delays: frames.map((frame) => frame.delay),
				frames: readyFrames,
			};
		});

type ParserCallbackArgs = {
	width: number;
	height: number;
	delays: number[];
	frames: Uint8ClampedArray[];
};

export const generate = (info: ParserCallbackArgs): GifState => {
	return {
		...info,
		frames: info.frames.map((buffer) => {
			const image = new ImageData(info.width, info.height);
			image.data.set(new Uint8ClampedArray(buffer));

			return image;
		}),
	};
};
