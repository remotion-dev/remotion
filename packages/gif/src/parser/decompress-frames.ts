import {decompressFrame} from '../gifuct';
import type {Frame, ParsedFrameWithoutPatch, ParsedGif} from '../gifuct/types';

export const decompressFrames = (parsedGif: ParsedGif) => {
	return parsedGif.frames
		.filter((f) => {
			return 'image' in f;
		})
		.map((f) => {
			return decompressFrame(f as Frame, parsedGif.gct);
		})
		.filter(Boolean)
		.map((f) => f as ParsedFrameWithoutPatch);
};
